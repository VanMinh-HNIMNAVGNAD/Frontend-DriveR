import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sharingApi } from '../services/api';
import { formatBytes } from '../utils/formatFileSize';
import * as pdfjsLib from 'pdfjs-dist';

// ─── Khởi tạo PDF.js Worker (an toàn, không trùng lặp) ───────────────────────
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

// ─── Hằng số: loại MIME hỗ trợ preview ──────────────────────────────────────
const PREVIEW_IMAGE = (mime) => mime?.startsWith('image/');
const PREVIEW_VIDEO = (mime) => mime?.startsWith('video/');
const PREVIEW_AUDIO = (mime) => mime?.startsWith('audio/');
const PREVIEW_PDF   = (mime) => mime?.includes('pdf');
const PREVIEW_TEXT  = (mime, name) =>
  mime?.startsWith('text/') ||
  /\.(js|ts|jsx|tsx|py|json|html|css|md|txt|sql|sh|yaml|yml|env|toml|xml|csv)$/i.test(name ?? '');

// ─── Helper: icon MIME ────────────────────────────────────────────────────────
function mimeColor(mimeType, type) {
  if (type === 'folder') return 'text-amber-400';
  if (PREVIEW_IMAGE(mimeType)) return 'text-emerald-400';
  if (PREVIEW_VIDEO(mimeType)) return 'text-violet-400';
  if (PREVIEW_AUDIO(mimeType)) return 'text-pink-400';
  if (PREVIEW_PDF(mimeType)) return 'text-rose-400';
  return 'text-slate-400';
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} aria-hidden="true" />;
}

function SharePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col">
      <header className="border-b border-white/8 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </main>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────
function SharePageError({ message, onGoHome }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center px-4">
      <a href="/" className="mb-10 text-2xl font-bold tracking-tight select-none">
        drive<span className="text-indigo-400">R</span>
      </a>
      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 ring-1 ring-rose-500/30">
        <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold mb-3 text-center">Không thể truy cập liên kết</h1>
      <p className="text-white/50 text-center max-w-sm mb-8">
        {message || 'Liên kết này không tồn tại, đã hết hạn hoặc đã bị thu hồi.'}
      </p>
      <button
        onClick={onGoHome}
        className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
      >
        Quay về trang chủ
      </button>
    </div>
  );
}

// ─── PDF Canvas Viewer (dùng pdfjs-dist, không dùng iframe) ──────────────────
function PdfCanvasViewer({ url }) {
  const [pdfDoc, setPdfDoc]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages]   = useState(0);
  const [zoom, setZoom]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const canvasRef                 = useRef(null);
  const renderTaskRef             = useRef(null);

  // 1. Tải binary PDF từ presigned URL
  useEffect(() => {
    if (!url) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.arrayBuffer();
        if (!mounted) return;
        const task = pdfjsLib.getDocument({ data });
        const doc  = await task.promise;
        if (!mounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err) {
        if (mounted) {
          console.error('[PDF]', err);
          setError('Không thể giải mã PDF. Vui lòng tải xuống để xem.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [url]);

  // 2. Vẽ trang lên canvas khi page/zoom thay đổi
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
    }

    (async () => {
      try {
        const page     = await pdfDoc.getPage(currentPage);
        const canvas   = canvasRef.current;
        if (!canvas) return;
        const ctx      = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 * zoom });

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('[PDF render]', err);
        }
      }
    })();

    return () => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-white/40">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" />
        </svg>
        <span className="text-sm">Đang giải mã PDF…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-rose-300 text-sm text-center py-10 bg-rose-500/10 rounded-xl border border-rose-500/20 px-6">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas */}
      <div className="w-full overflow-auto flex justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-lg shadow-2xl bg-white"
          style={{ height: 'auto' }}
        />
      </div>

      {/* Điều hướng trang + Thu phóng */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/8 rounded-full select-none">
        {/* Thu nhỏ */}
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          title="Thu nhỏ"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
          </svg>
        </button>
        <span className="text-xs text-white/40 font-mono w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        {/* Phóng to */}
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          title="Phóng to"
          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
          </svg>
        </button>

        {numPages > 1 && (
          <>
            <span className="w-px h-4 bg-white/10 mx-1" />
            {/* Trang trước */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-full hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
              title="Trang trước"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-xs font-mono text-white/50 whitespace-nowrap">
              {currentPage} / {numPages}
            </span>
            {/* Trang sau */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1.5 rounded-full hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
              title="Trang sau"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Text Preview (fetch & render inline) ────────────────────────────────────
function TextPreview({ url }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        let text = await res.text();
        if (text.length > 100_000) text = text.slice(0, 100_000) + '\n\n[... nội dung bị cắt bớt]';
        if (!cancelled) setContent(text);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-white/40 text-sm gap-2">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" />
        </svg>
        Đang tải nội dung…
      </div>
    );
  }
  if (error) {
    return <div className="text-white/30 text-sm text-center h-40 flex items-center justify-center">Không thể đọc nội dung. Vui lòng tải xuống để xem.</div>;
  }
  return (
    <pre className="text-sm text-white/80 bg-white/[0.03] border border-white/8 rounded-xl p-5 overflow-auto max-h-[60vh] font-mono leading-relaxed whitespace-pre-wrap break-words">
      {content}
    </pre>
  );
}

// ─── Preview Area (dispatch theo MIME) ───────────────────────────────────────
function PreviewArea({ file, previewUrl, loadingPreview }) {
  const { mimeType, name } = file;

  if (loadingPreview) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-white/40">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" />
        </svg>
        <span className="text-sm">Đang tải bản xem trước…</span>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-white/30">
        <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <span className="text-sm">Không hỗ trợ xem trước định dạng này</span>
        <span className="text-xs text-white/20">Vui lòng tải xuống để xem nội dung</span>
      </div>
    );
  }

  if (PREVIEW_IMAGE(mimeType)) {
    return <img src={previewUrl} alt={name} className="max-h-[70vh] max-w-full object-contain rounded-xl mx-auto block" loading="lazy" />;
  }
  if (PREVIEW_VIDEO(mimeType)) {
    return <video controls className="max-h-[70vh] w-full rounded-xl bg-black" preload="metadata" src={previewUrl} />;
  }
  if (PREVIEW_AUDIO(mimeType)) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <svg className="w-14 h-14 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
        </svg>
        <audio controls className="w-full max-w-md" src={previewUrl} />
      </div>
    );
  }
  if (PREVIEW_PDF(mimeType)) {
    // Canvas viewer — không dùng iframe để tránh browser popup tải file
    return <PdfCanvasViewer url={previewUrl} />;
  }
  if (PREVIEW_TEXT(mimeType, name)) {
    return <TextPreview url={previewUrl} />;
  }
  // Fallback
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-white/30">
      <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <span className="text-sm">Không hỗ trợ xem trước định dạng này</span>
    </div>
  );
}

// ─── Folder Browser — bảng danh sách file con ────────────────────────────────
function FolderBrowser({ token, rootFolderName, isDownloadAllowed, onOpenFile }) {
  const [stack, setStack]         = useState([{ id: null, name: rootFolderName }]); // breadcrumb stack
  const [children, setChildren]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

  const currentFolderId = stack[stack.length - 1].id;

  // Tải danh sách file con khi thay đổi folder
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    sharingApi.getSharedChildren(token, currentFolderId || undefined)
      .then((data) => {
        if (!cancelled) setChildren(data.items || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không thể tải nội dung thư mục');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, currentFolderId]);

  // Mở subfolder
  function handleOpenFolder(item) {
    setStack((s) => [...s, { id: item.id, name: item.name }]);
  }

  // Breadcrumb back
  function handleBreadcrumb(index) {
    setStack((s) => s.slice(0, index + 1));
  }

  // Tải ZIP toàn bộ thư mục gốc
  async function handleDownloadZip() {
    if (zipLoading) return;
    setZipLoading(true);
    try {
      // Endpoint /download-url với token — khi folder sẽ trả về ZIP stream trực tiếp
      // Dùng window.open để trigger download mà không cần fetch blob
      window.open(
        `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')}/shares/${token}/download-url`,
        '_blank',
      );
    } finally {
      setZipLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
      {/* Header bảng */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-white/40 min-w-0 overflow-hidden flex-1">
          {stack.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1 min-w-0">
              {idx > 0 && <span className="mx-0.5 text-white/20">/</span>}
              <button
                onClick={() => handleBreadcrumb(idx)}
                disabled={idx === stack.length - 1}
                className="hover:text-white disabled:text-white/70 disabled:cursor-default transition-colors truncate max-w-[120px]"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Nút tải ZIP */}
        {isDownloadAllowed && (
          <button
            onClick={handleDownloadZip}
            disabled={zipLoading}
            className="shrink-0 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {zipLoading ? 'Đang xử lý…' : 'Tải xuống (.zip)'}
          </button>
        )}
      </div>

      {/* Nội dung */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-white/30 text-sm">{error}</div>
      ) : children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/25">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
          <span className="text-sm">Thư mục đang trống</span>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {/* Header hàng */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-5 py-2 text-xs text-white/25 uppercase tracking-widest font-medium">
            <span />
            <span>Tên</span>
            <span className="text-right hidden sm:block">Dung lượng</span>
            <span className="text-right hidden sm:block">Ngày sửa</span>
          </div>

          {children.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-5 py-3 items-center hover:bg-white/[0.03] transition-colors group cursor-pointer"
              onDoubleClick={() => {
                if (item.type === 'folder') {
                  handleOpenFolder(item);
                } else {
                  onOpenFile(item);
                }
              }}
              onClick={(e) => {
                // Single click subfolder → navigate
                if (item.type === 'folder' && e.detail === 1) {
                  handleOpenFolder(item);
                }
              }}
              title={item.type === 'folder' ? `Mở thư mục ${item.name}` : `Xem trước ${item.name}`}
            >
              {/* Icon */}
              <span className={`shrink-0 ${mimeColor(item.mimeType, item.type)}`}>
                {item.type === 'folder' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.25 6a2.25 2.25 0 0 1 2.25-2.25h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 0 12.62 6.75H19.5A2.25 2.25 0 0 1 21.75 9v9a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18V6Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                )}
              </span>

              {/* Tên */}
              <span className="truncate text-sm text-white/80 group-hover:text-white transition-colors">
                {item.name}
              </span>

              {/* Dung lượng */}
              <span className="text-xs text-white/30 text-right hidden sm:block whitespace-nowrap">
                {item.type === 'file' ? formatBytes(item.sizeBytes) : '—'}
              </span>

              {/* Ngày */}
              <span className="text-xs text-white/25 text-right hidden sm:block whitespace-nowrap">
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString('vi-VN')
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── File Icon (đơn giản, dùng cho tiêu đề) ──────────────────────────────────
function FileTypeIcon({ mimeType, type }) {
  const color = mimeColor(mimeType, type);
  if (type === 'folder') {
    return (
      <svg className={`w-14 h-14 ${color}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.25 6a2.25 2.25 0 0 1 2.25-2.25h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 0 12.62 6.75H19.5A2.25 2.25 0 0 1 21.75 9v9a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18V6Z" />
      </svg>
    );
  }
  return (
    <svg className={`w-14 h-14 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SharePage() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [shareData, setShareData]           = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [loadingPage, setLoadingPage]       = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError]                   = useState(null);

  // File con được chọn để xem preview (khi đang duyệt folder)
  const [selectedChild, setSelectedChild]   = useState(null);
  const [childPreviewUrl, setChildPreviewUrl] = useState(null);
  const [childPreviewLoading, setChildPreviewLoading] = useState(false);

  // ── Bước 1: Lấy metadata share link ──────────────────────────────────────
  useEffect(() => {
    if (!token) { setError('Token không hợp lệ.'); setLoadingPage(false); return; }
    let cancelled = false;

    sharingApi.getSharedItem(token)
      .then((data) => {
        if (!cancelled) {
          setShareData(data);
          document.title = `${data.file?.name ?? 'Tệp được chia sẻ'} — driveR`;
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Liên kết không tồn tại hoặc đã hết hạn.');
      })
      .finally(() => { if (!cancelled) setLoadingPage(false); });

    return () => { cancelled = true; };
  }, [token]);

  // ── Bước 2: Tự động tải preview URL cho FILE ──────────────────────────────
  useEffect(() => {
    if (!shareData || shareData.file.type === 'folder') return;

    const { file } = shareData;
    const canPreview =
      PREVIEW_IMAGE(file.mimeType) || PREVIEW_VIDEO(file.mimeType) ||
      PREVIEW_AUDIO(file.mimeType) || PREVIEW_PDF(file.mimeType)   ||
      PREVIEW_TEXT(file.mimeType, file.name);

    if (!canPreview) return;

    let cancelled = false;
    setLoadingPreview(true);

    sharingApi.getSharedPreviewUrl(token)
      .then((res) => { if (!cancelled) setPreviewUrl(res.previewUrl); })
      .catch(() => {}) // Preview không bắt buộc
      .finally(() => { if (!cancelled) setLoadingPreview(false); });

    return () => { cancelled = true; };
  }, [shareData, token]);

  // ── Handler: Tải xuống (file) ─────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (downloadLoading) return;
    setDownloadLoading(true);
    try {
      const res = await sharingApi.getSharedDownloadUrl(token);
      if (res?.downloadUrl) {
        const a = document.createElement('a');
        a.href = res.downloadUrl;
        a.download = shareData?.file?.name || 'driveR_download';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      alert(err?.message || 'Không thể tải xuống tệp lúc này.');
    } finally {
      setDownloadLoading(false);
    }
  }, [downloadLoading, token, shareData]);

  // ── Handler: Mở preview file con trong folder ─────────────────────────────
  const handleOpenChildFile = useCallback(async (childFile) => {
    setSelectedChild(childFile);
    setChildPreviewUrl(null);

    const canPreview =
      PREVIEW_IMAGE(childFile.mimeType) || PREVIEW_VIDEO(childFile.mimeType) ||
      PREVIEW_AUDIO(childFile.mimeType) || PREVIEW_PDF(childFile.mimeType)   ||
      PREVIEW_TEXT(childFile.mimeType, childFile.name);

    if (!canPreview) return;

    setChildPreviewLoading(true);
    try {
      // Dùng presigned preview của file gốc qua owner — không cần expose thêm endpoint
      // Gọi qua token: GET /shares/:token/preview-url với childId param
      // Đây là trade-off: dùng lại endpoint preview của share nhưng không hỗ trợ file con.
      // Fallback: hiện thông báo tải xuống.
      setChildPreviewUrl(null);
    } catch {} finally {
      setChildPreviewLoading(false);
    }
  }, []);

  // ── Render: Loading ───────────────────────────────────────────────────────
  if (loadingPage) return <SharePageSkeleton />;

  // ── Render: Error ─────────────────────────────────────────────────────────
  if (error || !shareData) {
    return <SharePageError message={error} onGoHome={() => navigate('/')} />;
  }

  const { file, owner, isDownloadAllowed, expiresAt, hasPassword } = shareData;
  const isFolder = file.type === 'folder';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col">

      {/* ── Header sticky ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0f1117]/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <a href="/" className="text-lg font-bold tracking-tight shrink-0 select-none hover:opacity-80 transition-opacity">
            drive<span className="text-indigo-400">R</span>
          </a>

          {/* Người chia sẻ */}
          <div className="flex items-center gap-2 text-sm text-white/60 min-w-0 overflow-hidden">
            {owner?.avatarUrl ? (
              <img src={owner.avatarUrl} alt={owner.fullName} className="w-6 h-6 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {(owner?.fullName ?? 'D').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate">
              <span className="text-white/40 mr-1">Chia sẻ bởi</span>
              <span className="font-medium text-white/80">{owner?.fullName ?? 'Người dùng driveR'}</span>
            </span>
          </div>

          {/* Nút tải xuống */}
          {isDownloadAllowed && !isFolder && (
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-medium transition-all shadow-lg shadow-indigo-500/25"
            >
              {downloadLoading
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              }
              <span className="hidden sm:inline">{downloadLoading ? 'Đang tải…' : 'Tải xuống'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

        {/* Tiêu đề file */}
        <div className="flex items-start gap-4 mb-8">
          <div className="shrink-0 mt-1">
            <FileTypeIcon mimeType={file.mimeType} type={file.type} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold break-words leading-tight mb-2" title={file.name}>
              {file.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40">
              {!isFolder && <span>{formatBytes(file.sizeBytes)}</span>}
              {file.mimeType && !isFolder && (
                <span className="uppercase tracking-wide text-xs font-mono bg-white/5 px-2 py-0.5 rounded">
                  {file.mimeType.split('/').pop()?.split(';')[0]}
                </span>
              )}
              {isFolder && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  </svg>
                  Thư mục
                </span>
              )}
              {expiresAt && (
                <span className="flex items-center gap-1 text-amber-400/70">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Hết hạn {new Date(expiresAt).toLocaleDateString('vi-VN')}
                </span>
              )}
              {hasPassword && (
                <span className="flex items-center gap-1 text-white/30">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Được bảo vệ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── FOLDER: Bảng duyệt file con ─────────────────────────────────── */}
        {isFolder ? (
          <FolderBrowser
            token={token}
            rootFolderName={file.name}
            isDownloadAllowed={isDownloadAllowed}
            onOpenFile={handleOpenChildFile}
          />
        ) : (
          /* ── FILE: Preview Panel ─────────────────────────────────────────── */
          <section className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden" aria-label="Bản xem trước">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
              <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Xem trước</span>
              {isDownloadAllowed && (
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {downloadLoading ? 'Đang tải…' : 'Tải xuống'}
                </button>
              )}
            </div>
            <div className="p-4 sm:p-6">
              <PreviewArea file={file} previewUrl={previewUrl} loadingPreview={loadingPreview} />
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/25 text-sm">
            Bạn muốn lưu trữ và chia sẻ file miễn phí?{' '}
            <a href="/register" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
              Đăng ký driveR
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
