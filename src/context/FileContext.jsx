import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import { filesApi, storageApi, sharingApi, chunkedApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useUpload } from './UploadContext';
import { formatBytes } from '../utils/formatFileSize';

const FileContext = createContext();

export function FileProvider({ children }) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  
  let activeTab = 'my-drive';
  if (location.pathname.includes('/app/home')) activeTab = 'home';
  else if (location.pathname.includes('/app/shared-drives')) activeTab = 'shared-drives';
  else if (location.pathname.includes('/app/shared-with-me')) activeTab = 'shared-with-me';
  else if (location.pathname.includes('/app/recent')) activeTab = 'recent';
  else if (location.pathname.includes('/app/starred')) activeTab = 'starred';
  else if (location.pathname.includes('/app/spam')) activeTab = 'spam';
  else if (location.pathname.includes('/app/trash')) activeTab = 'trash';
  else if (location.pathname.includes('/app/billing')) activeTab = 'billing';

  const folderMatch = matchPath('/app/:tab/folders/:folderId', location.pathname);
  const currentFolderId = folderMatch ? folderMatch.params.folderId : null;

  const setActiveTab = useCallback((tab) => {
    navigate(`/app/${tab}`);
  }, [navigate]);

  const setCurrentFolderId = useCallback((id) => {
    if (id) {
      navigate(`/app/${activeTab}/folders/${id}`);
    } else {
      navigate(`/app/${activeTab}`);
    }
  }, [navigate, activeTab]);

  const openFolder = useCallback((folder) => {
    if (!folder || !folder.id) {
      navigate('/app/my-drive');
      return;
    }
    if (folder.sharedDriveId) {
      navigate(`/app/shared-drives/folders/${folder.id}`);
    } else {
      navigate(`/app/my-drive/folders/${folder.id}`);
    }
  }, [navigate]);

  const [viewMode, setViewMode] = useState('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: 'Driver của tôi' }]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400); // B8: chỉ gọi API sau 400ms idle
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState('name'); // 'name' | 'size' | 'type' | 'owner' | 'group' | 'updatedAt' | 'createdAt'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);

  // Clipboard State (Cut / Copy / Paste)
  const [clipboard, setClipboard] = useState({ items: [], mode: null });
  const [isPasting, setIsPasting] = useState(false);

  // Refs to avoid stale closures in event listeners and asynchronous callbacks
  const clipboardRef = useRef(clipboard);
  clipboardRef.current = clipboard;

  const isPastingRef = useRef(isPasting);
  isPastingRef.current = isPasting;

  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const currentFolderIdRef = useRef(currentFolderId);
  currentFolderIdRef.current = currentFolderId;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Storage Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Preview modal state
  const [previewItem, setPreviewItem] = useState(null);

  const openPreview = (item) => {
    if (item && !item.isFolder && item.type !== 'folder') {
      setPreviewItem(item);
    }
  };

  const closePreview = () => {
    setPreviewItem(null);
  };
  // Info drawer state
  const [infoDrawerItem, setInfoDrawerItem] = useState(null);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [infoDrawerTab, setInfoDrawerTab] = useState('details');

  // Upload Queue — delegate hoàn toàn sang UploadContext
  // FileContext chỉ dùng updateJob/enqueueJob/removeJob/resetJob từ UploadContext
  const {
    uploadQueue,
    setUploadQueue,
    uploadQueueRef,
    updateJob,
    enqueueJob,
    removeJob,
    resetJob,
  } = useUpload();

  const activeCountRef = useRef(0);   // số job đang chạy thực sự
  const pendingQueueRef = useRef([]); // mirror của uploadQueue để runner đọc không bị stale

  const CONCURRENCY = 2;    // 2 file song song
  const CHUNK_THRESHOLD = 10 * 1024 * 1024; // 10MB: file lớn hơn → dùng chunked upload

  // ── localStorage helpers (keyed by userId — ngăn resume vào tài khoản khác) ──
  const getChunkStateKey = (jobId) => `driveR_chunk_${user?.id || 'anon'}_${jobId}`;

  const saveChunkState = (jobId, state) => {
    try {
      localStorage.setItem(getChunkStateKey(jobId), JSON.stringify(state));
    } catch { /* quota exceeded — bỏ qua */ }
  };

  const loadChunkState = (jobId) => {
    try {
      const raw = localStorage.getItem(getChunkStateKey(jobId));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const clearChunkState = (jobId) => {
    try { localStorage.removeItem(getChunkStateKey(jobId)); } catch { /* ignore */ }
  };

  const openInfoDrawer = (item, tab = 'details') => {
    setInfoDrawerItem(item);
    setInfoDrawerTab(tab);
    setIsInfoDrawerOpen(true);
  };

  const closeInfoDrawer = () => {
    setIsInfoDrawerOpen(false);
  };

  const VALID_FILE_TABS = ['my-drive', 'starred', 'trash', 'spam', 'recent', 'shared-with-me', 'shared-drives'];

  // Fetch Storage Analytics
  const fetchAnalytics = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated) return;
    try {
      const data = await filesApi.getStorageAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Lỗi khi tải thống kê bộ nhớ:', err);
    }
  }, [isAuthenticated, isAuthLoading]);

  // Fetch Files and Folders from Backend API
  const fetchFiles = useCallback(async () => {
    // Chờ cho đến khi AuthContext đã resolve xong mới fetch
    if (isAuthLoading || !isAuthenticated) return;
    if (!VALID_FILE_TABS.includes(activeTab)) return; // Home/Billing không cần danh sách file
    try {
      setIsLoading(true);
      setError(null);

      const response = await filesApi.getFilesAndFolders({
        tab: activeTab,
        folderId: currentFolderId || undefined,
        search: debouncedSearch || undefined,
        filterType: filterType !== 'all' ? filterType : undefined,
        filterDate: filterDate !== 'all' ? filterDate : undefined,
        filterSender: filterOwner !== 'all' ? filterOwner : undefined,
        page: currentPage,
        limit: pageSize,
      });

      const rawItems = response.items || [];
      const formattedItems = rawItems.map((item) => {
        const base = {
          ...item,
          size: Number(item.sizeBytes || 0),
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '',
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '',
        };

        if (activeTab === 'shared-with-me') {
          return {
            ...base,
            owner: item.sharedOwner?.fullName || 'Người dùng khác',
            sharedOwner: item.sharedOwner || null,
            sharedRole: item.sharedRole || 'VIEWER',
            sharedAt: item.sharedAt
              ? new Date(item.sharedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : '',
          };
        }

        return {
          ...base,
          owner: 'Tôi',
        };
      });

      setItems(formattedItems);
      if (response.meta) {
        setTotalItems(response.meta.total || formattedItems.length);
        setTotalPages(response.meta.totalPages || 1);
      }
      if (response.breadcrumb) {
        setBreadcrumb(response.breadcrumb);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách file:', err);
      setError(err.message || 'Không thể tải danh sách tệp');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, activeTab, currentFolderId, debouncedSearch, filterType, filterDate, filterOwner, currentPage, pageSize]);

  useEffect(() => {
    fetchFiles();
    fetchAnalytics();
  }, [fetchFiles, fetchAnalytics]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterDate('all');
    setFilterOwner('all');
    setFilterLocation('all');
    setSearchQuery('');
  };

  // ── Selection Functions ──

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setLastSelectedId(id);
  }, []);

  /**
   * Chọn khoảng từ lastSelectedId đến endId (theo thứ tự hiển thị: folders trước, files sau).
   * Nếu không có lastSelectedId, chỉ chọn endId.
   */
  const selectRange = useCallback((endId, currentSortedFolders, currentSortedFiles) => {
    const allIds = [...(currentSortedFolders || []), ...(currentSortedFiles || [])].map((item) => item.id);
    const startId = lastSelectedId;
    if (!startId) {
      setSelectedIds((prev) => { const n = new Set(prev); n.add(endId); return n; });
      setLastSelectedId(endId);
      return;
    }
    const startIdx = allIds.indexOf(startId);
    const endIdx = allIds.indexOf(endId);
    if (startIdx === -1 || endIdx === -1) {
      setSelectedIds((prev) => { const n = new Set(prev); n.add(endId); return n; });
      setLastSelectedId(endId);
      return;
    }
    const [from, to] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
    const idsToSelect = allIds.slice(from, to + 1);
    setSelectedIds((prev) => {
      const n = new Set(prev);
      idsToSelect.forEach((id) => n.add(id));
      return n;
    });
    setLastSelectedId(endId);
  }, [lastSelectedId]);

  const selectAll = useCallback((currentSortedFolders, currentSortedFiles) => {
    const allIds = [...(currentSortedFolders || []), ...(currentSortedFiles || [])].map((item) => item.id);
    setSelectedIds(new Set(allIds));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  const getSelectedItems = useCallback(
    (currentSortedFolders, currentSortedFiles) =>
      [...(currentSortedFolders || []), ...(currentSortedFiles || [])].filter((item) => selectedIds.has(item.id)),
    [selectedIds]
  );

  // Reset selection khi fetch lại data (tab thay đổi, folder thay đổi)
  // Giữ lại selection nếu item vẫn tồn tại
  useEffect(() => {
    if (selectedIds.size > 0) {
      const existingIds = new Set(items.map((i) => i.id));
      setSelectedIds((prev) => {
        const filtered = new Set([...prev].filter((id) => existingIds.has(id)));
        return filtered;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const folders = items.filter((item) => item.type === 'folder');
  const files = items.filter((item) => item.type === 'file');

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [folders, sortField, sortDirection]);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'size') {
            valA = Number(a.sizeBytes) || 0;
            valB = Number(b.sizeBytes) || 0;
        } else if (sortField === 'type') {
            valA = a.mimeType || '';
            valB = b.mimeType || '';
        } else {
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [files, sortField, sortDirection]);

  // Storage Info Object
  const storageInfo = {
    usedBytes: analytics ? analytics.usedBytes : 0,
    usedGB: analytics ? analytics.usedGB : '0.00',
    usedMB: analytics ? (analytics.usedBytes / (1024 * 1024)).toFixed(2) : '0.00',
    usedFormatted: analytics ? formatBytes(analytics.usedBytes) : '0 Bytes',
    totalGB: analytics ? analytics.limitGB : '2.00',
    percentage: analytics ? analytics.percentageUsed : 0,
    categories: analytics?.categories || {},
  };

  // Danh sách unique owners từ items hiện tại — dùng cho filter
  const uniqueOwners = useMemo(() => {
    const seen = new Set();
    const owners = [];
    for (const item of items) {
      const name = item.owner || 'Tôi';
      if (!seen.has(name)) {
        seen.add(name);
        owners.push(name);
      }
    }
    return owners;
  }, [items]);


  // Actions connecting to Backend
  const toggleStar = async (id) => {
    try {
      await filesApi.toggleStar(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isStarred: !item.isStarred } : item)),
      );
    } catch (err) {
      alert('Không thể cập nhật dấu sao: ' + err.message);
    }
  };

  const moveToTrash = async (id) => {
    try {
      await filesApi.moveToTrash(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      fetchAnalytics();
    } catch (err) {
      alert('Không thể chuyển vào thùng rác: ' + err.message);
    }
  };

  const restoreFromTrash = async (id) => {
    try {
      await filesApi.restoreFromTrash(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      fetchAnalytics();
    } catch (err) {
      alert('Không thể khôi phục: ' + err.message);
    }
  };

  const deletePermanently = async (id) => {
    try {
      await filesApi.deletePermanently(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      fetchAnalytics();
    } catch (err) {
      alert('Không thể xóa vĩnh viễn: ' + err.message);
    }
  };

  const emptyTrash = async () => {
    try {
      await filesApi.emptyTrash();
      setItems([]);
      fetchAnalytics();
    } catch (err) {
      alert('Không thể dọn thùng rác: ' + err.message);
    }
  };

  const renameItem = async (id, newName) => {
    if (!newName || !newName.trim()) return;
    try {
      const updated = await filesApi.renameItem(id, { name: newName.trim() });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, name: updated.name || newName.trim() } : item)),
      );
    } catch (err) {
      alert('Không thể đổi tên: ' + err.message);
    }
  };

  const createFolder = async (folderName) => {
    if (!folderName || !folderName.trim()) return;
    try {
      setIsLoading(true);
      const payload = {
        name: folderName.trim(),
        ...(currentFolderId ? { parentId: currentFolderId } : {}),
      };
      const res = await filesApi.createFolder(payload);
      await fetchFiles();
      return res;
    } catch (err) {
      alert('Không thể tạo thư mục: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Tạo folder im lặng (không trigger loading, không gọi fetchFiles).
   * Dùng khi xây cấu trúc thư mục khi upload folder.
   * @returns {Promise<string|null>} ID của folder vừa tạo
   */
  const createFolderSilent = async (name, parentId) => {
    if (!name || !name.trim()) return null;
    try {
      const payload = {
        name: name.trim(),
        ...(parentId ? { parentId } : {}),
      };
      const res = await filesApi.createFolder(payload);
      // Backend trả về dạng { id, name, ... } hoặc wrap trong data
      return res?.id || res?.data?.id || null;
    } catch (err) {
      console.error(`Tạo folder "${name}" thất bại:`, err);
      return null; // Không throw — để caller tự xử lý fallback
    }
  };

  const moveItem = async (id, targetParentId) => {
    try {
      await filesApi.moveItem(id, { targetParentId });
      fetchFiles();
    } catch (err) {
      alert('Không thể di chuyển: ' + err.message);
    }
  };

  const copyItem = async (id, targetParentId) => {
    try {
      await filesApi.copyItem(id, { targetParentId });
      fetchFiles();
      fetchAnalytics();
    } catch (err) {
      alert('Không thể sao chép: ' + err.message);
    }
  };

  // ── Cut / Copy / Paste Actions (Snapshot-based Clipboard) ──

  const cutItems = useCallback((ids) => {
    const targetIds = ids && ids.length > 0 ? ids : Array.from(selectedIdsRef.current);
    if (targetIds.length === 0) return;

    // Snapshot dữ liệu ngay tại thời điểm cut từ items state hiện tại
    const snapshot = itemsRef.current
      .filter((item) => targetIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        parentId: item.parentId ?? null,
        name: item.name,
        type: item.type,
      }));

    if (snapshot.length === 0) return;

    setClipboard({
      items: snapshot,
      mode: 'cut',
    });
  }, []);

  const copyItems = useCallback((ids) => {
    const targetIds = ids && ids.length > 0 ? ids : Array.from(selectedIdsRef.current);
    if (targetIds.length === 0) return;

    // Snapshot dữ liệu ngay tại thời điểm copy từ items state hiện tại
    const snapshot = itemsRef.current
      .filter((item) => targetIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        parentId: item.parentId ?? null,
        name: item.name,
        type: item.type,
      }));

    if (snapshot.length === 0) return;

    setClipboard({
      items: snapshot,
      mode: 'copy',
    });
  }, []);

  const clearClipboard = useCallback(() => {
    setClipboard({ items: [], mode: null });
  }, []);

  const pasteItems = useCallback(
    async (targetParentId) => {
      const currentClip = clipboardRef.current;
      if (!currentClip.mode || currentClip.items.length === 0) return;
      if (isPastingRef.current) return; // Ngăn người dùng click liên tục gây trùng request

      const destId = targetParentId !== undefined ? targetParentId : (currentFolderIdRef.current || null);

      // No-op check dùng snapshot đã lưu: nếu mode cut và paste vào đúng folder ban đầu thì bỏ qua
      const toProcess =
        currentClip.mode === 'cut'
          ? currentClip.items.filter((entry) => (entry.parentId ?? null) !== (destId ?? null))
          : currentClip.items;

      // Nếu cut vào chính nơi cũ -> hoàn tất êm, xoá clipboard
      if (toProcess.length === 0) {
        if (currentClip.mode === 'cut') {
          clearClipboard();
        }
        return;
      }

      setIsPasting(true);
      try {
        const results = await Promise.allSettled(
          toProcess.map(async (entry) => {
            if (currentClip.mode === 'cut') {
              return await filesApi.moveItem(entry.id, { targetParentId: destId });
            } else {
              return await filesApi.copyItem(entry.id, { targetParentId: destId });
            }
          })
        );

        const rejected = [];
        let fulfilledCount = 0;

        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            fulfilledCount++;
          } else {
            rejected.push({
              name: toProcess[idx].name,
              reason: res.reason?.message || 'Lỗi không xác định',
            });
          }
        });

        if (rejected.length > 0) {
          const errorDetails = rejected.map((r) => `• ${r.name}: ${r.reason}`).join('\n');
          alert(`Có ${rejected.length}/${toProcess.length} mục xử lý thất bại:\n${errorDetails}`);
        }

        // Đồng bộ lại danh sách tệp & thông số lưu trữ
        await fetchFiles();
        await fetchAnalytics();

        // Nếu là cut thì xoá clipboard sau khi paste (kể cả có lỗi một phần)
        if (currentClip.mode === 'cut') {
          clearClipboard();
        }
        // Nếu là copy: giữ nguyên clipboard để paste nhiều lần
      } catch (err) {
        console.error('Lỗi trong quá trình dán:', err);
        alert('Đã xảy ra lỗi khi dán: ' + (err.message || err));
      } finally {
        setIsPasting(false);
      }
    },
    [clearClipboard, fetchFiles, fetchAnalytics]
  );

  // ── Global Keyboard Shortcuts Listener ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputActive =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.isContentEditable;

      // Không can thiệp nếu người dùng đang nhập văn bản trong ô input/textarea
      if (isInputActive) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
        if (selectedIdsRef.current.size > 0) {
          e.preventDefault();
          copyItems();
        }
      } else if (isCtrlOrCmd && (e.key === 'x' || e.key === 'X')) {
        if (selectedIdsRef.current.size > 0) {
          e.preventDefault();
          cutItems();
        }
      } else if (isCtrlOrCmd && (e.key === 'v' || e.key === 'V')) {
        if (clipboardRef.current.items.length > 0 && !isPastingRef.current) {
          e.preventDefault();
          pasteItems();
        }
      } else if (e.key === 'Escape') {
        if (clipboardRef.current.mode === 'cut') {
          clearClipboard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyItems, cutItems, pasteItems, clearClipboard]);

  // --- Upload Queue Engine ---
  // updateJob, enqueueJob, removeJob, resetJob — được inject từ UploadContext (xem trên)

  /** Chunked upload cho file > 10MB — resume được sau khi F5/đóng tab */
  const runChunkedUploadJob = useCallback(
    async (job) => {
      const { id, fileObj, parentId } = job;

      // ── Bước 1: Kiểm tra localStorage có session resume không ──
      let session = loadChunkState(id);
      let resumableUrl, storageKey, chunkSize, totalChunks;
      let chunksDone = 0;

      if (session && session.userId === user?.id) {
        // Resume session cũ
        ({ resumableUrl, storageKey, chunkSize, totalChunks, chunksDone } = session);
        updateJob(id, { status: 'uploading', percent: Math.round((chunksDone / totalChunks) * 95) });
      } else {
        // Khởi tạo session mới
        updateJob(id, { status: 'uploading', percent: 1 });
        const initRes = await chunkedApi.init({
          name: fileObj.name,
          totalSizeBytes: fileObj.size,
          mimeType: fileObj.type || 'application/octet-stream',
          parentId: parentId || undefined,
        });
        ({ resumableUrl, storageKey, chunkSize, totalChunks } = initRes);
        chunksDone = 0;

        // Lưu vào localStorage ngay — keyed by userId
        saveChunkState(id, {
          userId: user?.id,
          resumableUrl,
          storageKey,
          chunkSize,
          totalChunks,
          chunksDone: 0,
          fileName: fileObj.name,
          totalSizeBytes: fileObj.size,
          mimeType: fileObj.type || 'application/octet-stream',
          parentId: parentId || null,
        });
      }

      // ── Bước 2: PUT từng chunk lên GCS resumable URL ──
      for (let i = chunksDone; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end   = Math.min(start + chunkSize, fileObj.size);
        const chunk = fileObj.slice(start, end);

        await chunkedApi.uploadChunkDirect(
          resumableUrl,
          chunk,
          start,
          fileObj.size,
          () => {
            const percent = Math.round(((i + 0.5) / totalChunks) * 95);
            updateJob(id, { percent, status: 'uploading' });
          },
        );

        // Lưu progress sau mỗi chunk thành công
        chunksDone = i + 1;
        saveChunkState(id, {
          userId: user?.id,
          resumableUrl,
          storageKey,
          chunkSize,
          totalChunks,
          chunksDone,
          fileName: fileObj.name,
          totalSizeBytes: fileObj.size,
          mimeType: fileObj.type || 'application/octet-stream',
          parentId: parentId || null,
        });
        updateJob(id, { percent: Math.round((chunksDone / totalChunks) * 95) });
      }

      // ── Bước 3: Hoàn tất — backend tạo DB record và verify userId ──
      updateJob(id, { percent: 98, status: 'confirming' });
      const completeRes = await chunkedApi.complete({
        storageKey,
        name: fileObj.name,
        sizeBytes: fileObj.size,
        mimeType: fileObj.type || 'application/octet-stream',
        parentId: parentId || undefined,
      });

      // Thông báo nếu bị đổi tên
      const savedName = completeRes?.file?.name || completeRes?.finalName || fileObj.name;
      if (savedName !== fileObj.name) {
        updateJob(id, { fileName: savedName, renamedFrom: fileObj.name });
      }

      // Xoá localStorage — upload hoàn tất
      clearChunkState(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, fetchFiles, fetchAnalytics],
  );

  /** Thực thi upload cho 1 job (phân nhánh: chunked nếu > 10MB, thường nếu nhỏ hơn) */
  const runUploadJob = useCallback(
    async (job) => {
      const { id, fileObj, parentId, targetProvider } = job;
      updateJob(id, { status: 'uploading', percent: 0 });

      try {
        // ── Nếu file > 10MB → dùng GCS chunked resumable upload ──
        if (fileObj.size > CHUNK_THRESHOLD) {
          await runChunkedUploadJob(job);
          updateJob(id, { percent: 100, status: 'done' });
          setTimeout(() => removeJob(id), 5000);
          fetchFiles();
          fetchAnalytics();
          return;
        }

        // ── File nhỏ ≤ 10MB: flow cũ (presigned PUT hoặc proxy) ──
        let isUploaded = false;

        // 1. Thử Direct Presigned PUT
        try {
          const presignedData = await storageApi.getUploadUrl({
            name: fileObj.name,
            sizeBytes: fileObj.size,
            mimeType: fileObj.type || 'application/octet-stream',
            parentId: parentId || undefined,
            targetProvider,
          });

          const { uploadUrl, storageKey, storageProvider } = presignedData;

          await storageApi.uploadDirectToCloud(uploadUrl, fileObj, (percent) => {
            updateJob(id, { percent, status: 'uploading' });
          });

          updateJob(id, { percent: 99, status: 'confirming' });

          const confirmRes = await storageApi.confirmUpload({
            name: fileObj.name,
            sizeBytes: fileObj.size,
            mimeType: fileObj.type || 'application/octet-stream',
            storageKey,
            storageProvider,
            parentId: parentId || undefined,
          });

          // Backend có thể đổi tên nếu trùng (ví dụ: file.txt → file(1).txt)
          const savedName = confirmRes?.file?.name || confirmRes?.name || fileObj.name;
          if (savedName !== fileObj.name) {
            updateJob(id, { fileName: savedName, renamedFrom: fileObj.name });
          }

          isUploaded = true;
        } catch (directErr) {
          console.warn('Direct upload failed, falling back to proxy:', directErr);
        }

        // 2. Fallback qua Server Proxy
        if (!isUploaded) {
          const proxyRes = await storageApi.uploadProxy(fileObj, parentId, targetProvider, (percent) => {
            updateJob(id, { percent, status: 'uploading' });
          });

          // Backend có thể đổi tên nếu trùng
          const savedNameProxy = proxyRes?.file?.name || proxyRes?.name || fileObj.name;
          if (savedNameProxy !== fileObj.name) {
            updateJob(id, { fileName: savedNameProxy, renamedFrom: fileObj.name });
          }
        }

        updateJob(id, { percent: 100, status: 'done' });
        // Tự xóa job done sau 5 giây
        setTimeout(() => removeJob(id), 5000);

        // Refresh sau khi 1 file xong
        fetchFiles();
        fetchAnalytics();
      } catch (err) {
        console.error(`Lỗi upload "${fileObj.name}":`, err);
        updateJob(id, { percent: 0, status: 'error', error: err.message });
      } finally {
        // Giảm bộ đếm và dispatch runner để chạy job tiếp theo
        activeCountRef.current -= 1;
        dispatchRunner();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runChunkedUploadJob, fetchFiles, fetchAnalytics],
  );

  /** Runner: lấy job pending từ ref, chạy tối đa CONCURRENCY job cùng lúc */
  const dispatchRunner = useCallback(() => {
    while (
      activeCountRef.current < CONCURRENCY &&
      pendingQueueRef.current.length > 0
    ) {
      const nextJob = pendingQueueRef.current.shift();
      if (!nextJob) break;
      activeCountRef.current += 1;
      runUploadJob(nextJob);
    }
  }, [runUploadJob]);

  /**
   * Thêm 1 file vào upload queue.
   * parentId: override folder đích (dùng khi upload folder có cấu trúc — mục 3).
   */
  const enqueueUpload = useCallback(
    (fileObj, parentId = currentFolderId, targetProvider = undefined) => {
      if (!fileObj) return;
      const jobId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const job = {
        id: jobId,
        fileName: fileObj.name,
        fileObj,
        parentId,
        targetProvider,
        percent: 0,
        status: 'pending',
      };
      // Thêm vào UploadContext (UI) và ref (runner)
      enqueueJob(job);
      pendingQueueRef.current.push(job);
      dispatchRunner();
    },
    [currentFolderId, dispatchRunner, enqueueJob],
  );

  /**
   * Retry 1 job đang lỗi — reset trạng thái về pending và chạy lại.
   * Giữ nguyên jobId để UI không nhảy (không tạo row mới).
   */
  const retryUploadJob = useCallback(
    (jobId) => {
      const job = uploadQueueRef.current.find((j) => j.id === jobId && j.status === 'error');
      if (!job) return;

      const retriedJob = { ...job, percent: 0, status: 'pending', error: undefined, renamedFrom: undefined };
      // Reset job trong UploadContext state
      resetJob(jobId, { percent: 0, status: 'pending', error: undefined, renamedFrom: undefined });
      // Đưa lại vào pendingQueueRef để runner xử lý
      pendingQueueRef.current.push(retriedJob);
      // Dispatch runner (setTimeout để state flush trước)
      setTimeout(() => dispatchRunner(), 0);
    },
    [dispatchRunner, uploadQueueRef, resetJob],
  );

  // Backward-compat alias — code cũ gọi uploadFile vẫn hoạt động

  const uploadFile = enqueueUpload;

  // Backward compatibility alias for UI calls
  const uploadFileMock = (fileName) => {
    const blob = new Blob(['File content test'], { type: 'text/plain' });
    const file = new File([blob], fileName || 'test_document.txt', { type: 'text/plain' });
    enqueueUpload(file);
  };

  const getDownloadUrl = async (id) => {
    try {
      const res = await storageApi.getDownloadUrl(id);
      return res.downloadUrl;
    } catch (err) {
      alert('Lỗi lấy link tải: ' + err.message);
      return null;
    }
  };

  const getPreviewUrl = async (id) => {
    try {
      const res = await storageApi.getPreviewUrl(id);
      return res.previewUrl;
    } catch (err) {
      alert('Lỗi lấy link xem trước: ' + err.message);
      return null;
    }
  };

  const getFileTextContent = async (id) => {
    try {
      const res = await storageApi.getFileTextContent(id);
      return res.content;
    } catch (err) {
      console.error('Lỗi lấy nội dung tệp:', err);
      return null;
    }
  };

  const createShareLink = async (id, options = {}) => {
    try {
      return await sharingApi.createShareLink(id, options);
    } catch (err) {
      alert('Lỗi tạo link chia sẻ: ' + err.message);
      return null;
    }
  };

  return (
    <FileContext.Provider
      value={{
        items,
        currentFolderId,
        setCurrentFolderId: (id) => {
          setCurrentFolderId(id);
          setCurrentPage(1);
        },
        openFolder,
        activeTab,
        setActiveTab: (tab) => {
          if (activeTab === tab && !currentFolderId) return;
          setActiveTab(tab);
          setCurrentPage(1);
        },
        viewMode,
        setViewMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar: () => setIsSidebarCollapsed((prev) => !prev),
        isLoading,
        error,
        triggerReload: fetchFiles,
        currentPage,
        setCurrentPage,
        pageSize,
        totalItems,
        totalPages,
        breadcrumb,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterDate,
        setFilterDate,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        filterOwner,
        setFilterOwner,
        filterLocation,
        setFilterLocation,
        resetFilters,
        storageInfo,
        uniqueOwners,
        folders: sortedFolders,

        files: sortedFiles,
        rawFolders: folders,
        rawFiles: files,
        currentFilteredItems: items,
        paginatedItems: items,
        toggleStar,
        moveToTrash,
        restoreFromTrash,
        deletePermanently,
        emptyTrash,
        createFolder,
        createFolderSilent,
        moveItem,
        copyItem,
        uploadFile,
        enqueueUpload,
        retryUploadJob,
        uploadFileMock,
        renameItem,
        getDownloadUrl,
        getPreviewUrl,
        getFileTextContent,
        createShareLink,
        uploadQueue,
        infoDrawerItem,
        isInfoDrawerOpen,
        infoDrawerTab,
        openInfoDrawer,
        closeInfoDrawer,
        previewItem,
        openPreview,
        closePreview,
        // Selection
        selectedIds,
        selectedCount: selectedIds.size,
        lastSelectedId,
        toggleSelect,
        selectRange,
        selectAll,
        deselectAll,
        isSelected,
        getSelectedItems,
        // Clipboard (Cut / Copy / Paste)
        clipboard,
        isPasting,
        cutItems,
        copyItems,
        clearClipboard,
        pasteItems,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export const useFiles = () => useContext(FileContext);