import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import { filesApi, storageApi, sharingApi, chunkedApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useDebounce } from '../hooks/useDebounce';

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
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterSender, setFilterSender] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState('name'); // 'name' | 'size' | 'type' | 'owner' | 'group' | 'updatedAt' | 'createdAt'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'


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

  // Upload Queue State — mỗi job: { id, fileName, percent, status, error? }
  // status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error'
  const [uploadQueue, setUploadQueue] = useState([]);
  const activeCountRef = useRef(0);   // số job đang chạy thực sự
  const pendingQueueRef = useRef([]); // mirror của uploadQueue để runner đọc không bị stale
  const uploadQueueRef = useRef([]);        // mirror mới nhất của uploadQueue, đọc đồng bộ trong updateJob
  const percentThrottleRef = useRef(new Map()); // jobId -> timeout id, để throttle riêng percent
  const PERCENT_THROTTLE_MS = 200;          // tối đa ~5 lần setState/giây cho mỗi job

  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  useEffect(() => {
    return () => {
      percentThrottleRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      percentThrottleRef.current.clear();
    };
  }, []);

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
        filterSender: filterSender !== 'all' ? filterSender : undefined,
        page: currentPage,
        limit: pageSize,
      });

      const rawItems = response.items || [];
      const formattedItems = rawItems.map((item) => ({
        ...item,
        owner: 'Tôi',
        size: Number(item.sizeBytes || 0),
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '',
      }));

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
  }, [isAuthenticated, isAuthLoading, activeTab, currentFolderId, debouncedSearch, filterType, filterDate, filterSender, currentPage, pageSize]);

  useEffect(() => {
    fetchFiles();
    fetchAnalytics();
  }, [fetchFiles, fetchAnalytics]);

  const resetFilters = () => {
    setFilterType('all');
    setFilterDate('all');
    setFilterSender('all');
    setFilterOwner('all');
    setFilterLocation('all');
    setSearchQuery('');
  };

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

  const formatStorageUsed = (bytes) => {
    if (!bytes || bytes <= 0) return '0.00 MB';
    if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // Storage Info Object
  const storageInfo = {
    usedBytes: analytics ? analytics.usedBytes : 0,
    usedGB: analytics ? analytics.usedGB : '0.00',
    usedMB: analytics ? (analytics.usedBytes / (1024 * 1024)).toFixed(2) : '0.00',
    usedFormatted: analytics ? formatStorageUsed(analytics.usedBytes) : '0.00 MB',
    totalGB: analytics ? analytics.limitGB : '2.00',
    percentage: analytics ? analytics.percentageUsed : 0,
    categories: analytics?.categories || {},
  };

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
      await filesApi.createFolder({
        name: folderName.trim(),
        parentId: currentFolderId || undefined,
      });
      fetchFiles();
    } catch (err) {
      alert('Không thể tạo thư mục: ' + err.message);
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
      const res = await filesApi.createFolder({
        name: name.trim(),
        parentId: parentId || undefined,
      });
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

  // --- Upload Queue Engine ---

  /** Cập nhật 1 job trong queue theo id */
  const updateJob = (id, patch) => {
    const isPercentOnlyUpdate =
      Object.keys(patch).every((key) => key === 'percent') && Object.keys(patch).length > 0;

    const applyNow = () => {
      setUploadQueue((prev) =>
        prev.map((job) => (job.id === id ? { ...job, ...patch } : job)),
      );
    };

    // Update đổi status/fileName/error: áp dụng ngay, không throttle
    if (!isPercentOnlyUpdate) {
      const existingTimeout = percentThrottleRef.current.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        percentThrottleRef.current.delete(id);
      }
      applyNow();
      return;
    }

    // Update chỉ đổi percent: throttle để giảm tần suất re-render
    if (percentThrottleRef.current.has(id)) return; // đã có 1 update đang chờ, bỏ qua update này

    const timeoutId = setTimeout(() => {
      percentThrottleRef.current.delete(id);
      applyNow();
    }, PERCENT_THROTTLE_MS);

    percentThrottleRef.current.set(id, timeoutId);
  };

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
          setTimeout(() => setUploadQueue((prev) => prev.filter((j) => j.id !== id)), 5000);
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
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((j) => j.id !== id));
        }, 5000);

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
      // Thêm vào state (UI) và ref (runner)
      setUploadQueue((prev) => [...prev, job]);
      pendingQueueRef.current.push(job);
      dispatchRunner();
    },
    [currentFolderId, dispatchRunner],
  );

  /**
   * Retry 1 job đang lỗi — reset trạng thái về pending và chạy lại.
   * Giữ nguyên jobId để UI không nhảy (không tạo row mới).
   */
  const retryUploadJob = useCallback(
    (jobId) => {
      setUploadQueue((prev) => {
        const job = prev.find((j) => j.id === jobId && j.status === 'error');
        if (!job) return prev;

        // Reset job về pending trong state
        const resetJob = { ...job, percent: 0, status: 'pending', error: undefined, renamedFrom: undefined };
        const nextQueue = prev.map((j) => (j.id === jobId ? resetJob : j));

        // Đưa lại vào pendingQueueRef để runner xử lý
        pendingQueueRef.current.push(resetJob);
        // Dispatch runner ngay (setTimeout để state flush trước)
        setTimeout(() => dispatchRunner(), 0);

        return nextQueue;
      });
    },
    [dispatchRunner],
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
        filterSender,
        setFilterSender,
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
        setUploadQueue,
        infoDrawerItem,
        isInfoDrawerOpen,
        infoDrawerTab,
        openInfoDrawer,
        closeInfoDrawer,
        previewItem,
        openPreview,
        closePreview,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export const useFiles = () => useContext(FileContext);