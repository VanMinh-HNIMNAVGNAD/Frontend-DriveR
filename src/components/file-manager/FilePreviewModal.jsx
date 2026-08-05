import { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2, 
  HardDrive, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileText, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { useFiles } from '../../context/FileContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function FilePreviewModal({ item, onClose }) {
  const { getPreviewUrl, getDownloadUrl, getFileTextContent } = useFiles();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setZoom(1);
    setRotation(0);

    const fetchUrl = async () => {
      try {
        const previewUrl = await getPreviewUrl(item.id);
        if (isMounted) {
          if (previewUrl) {
            setUrl(previewUrl);
          } else {
            setError('Không thể lấy được liên kết xem trước từ Cloud.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Lỗi khi tải bản xem trước tệp');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === '=' || e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === 'r' || e.key === 'R') handleRotate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = async () => {
    const downloadUrl = await getDownloadUrl(item.id);
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const mime = (item.mimeType || '').toLowerCase();
  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(item.name);
  const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(item.name);
  const isAudio = mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(item.name);
  const isPdf = mime.includes('pdf') || /\.pdf$/i.test(item.name);
  const isCodeOrText = (mime.startsWith('text/') || /\.(js|jsx|ts|tsx|py|html|css|json|sql|md|txt|xml|yaml|yml|sh|env|conf|log|c|cpp|h|hpp|java|go|rs|kt|php|vue|svelte|cs)$/i.test(item.name)) && Number(item.sizeBytes) <= 5 * 1024 * 1024;
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [textContent, setTextContent] = useState(null);

  useEffect(() => {
    if (isCodeOrText && item) {
      getFileTextContent(item.id)
        .then((text) => {
          if (text) {
            setTextContent(text);
          } else {
            setTextContent('Không thể tải nội dung tệp văn bản/mã nguồn');
          }
        })
        .catch(() => setTextContent('Không thể tải nội dung tệp văn bản/mã nguồn'));
    }
  }, [isCodeOrText, item]);

  const formatSize = (bytes) => {
    const b = Number(bytes || 0);
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 text-white select-none">
      {/* Top Floating Header & Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
            {isImage ? <FileImage className="w-5 h-5" /> : isVideo ? <FileVideo className="w-5 h-5" /> : isAudio ? <FileAudio className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate max-w-md" title={item.name}>
              {item.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatSize(item.sizeBytes)}</span>
              <span>•</span>
              <span className="capitalize">{item.storageProvider?.replace('_', ' ') || 'Google Cloud'}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {isImage && url && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 py-1 bg-white/10 rounded-lg text-slate-300 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Xoay 90 độ (R)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Về kích thước gốc"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
            </>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải xuống</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-all ml-2 cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-6 relative">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Đang tải bản xem trước từ Đám Mây Multi-Cloud...</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-3">
            <p className="text-sm text-red-300 font-medium">{error}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition-all"
            >
              Tải tệp về máy để xem
            </button>
          </div>
        )}

        {!loading && !error && url && (
          <>
            {isImage && (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-4 cursor-grab active:cursor-grabbing">
                <img
                  src={url}
                  alt={item.name}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>
            )}

            {isVideo && (
              <div className="max-w-4xl max-h-full w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                <video src={url} controls autoPlay className="w-full max-h-[75vh]" />
              </div>
            )}

            {isAudio && (
              <div className="p-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <FileAudio className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-400">{formatSize(item.sizeBytes)}</p>
                </div>
                <audio src={url} controls autoPlay className="w-full" />
              </div>
            )}

            {isPdf && (
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-white shadow-2xl">
                <iframe src={url} title={item.name} className="w-full h-full border-none" />
              </div>
            )}

            {isCodeOrText && (
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-2xl flex flex-col">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-white/10 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyText}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 transition-colors"
                    >
                      {copied ? '✓ Đã sao chép' : 'Sao chép mã'}
                    </button>
                    <span>UTF-8 • {formatSize(item.sizeBytes)}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto text-xs text-slate-200 selection:bg-blue-500/40">
                  {textContent ? (
                    <SyntaxHighlighter
                      language={(() => {
                        const ext = item?.name?.split('.').pop()?.toLowerCase();
                        const map = {
                          js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
                          py: 'python', json: 'json', html: 'html', css: 'css',
                          sql: 'sql', md: 'markdown', sh: 'bash', bash: 'bash',
                          java: 'java', go: 'go', rs: 'rust', c: 'c', cpp: 'cpp',
                          cs: 'csharp', php: 'php', xml: 'xml', yaml: 'yaml', yml: 'yaml',
                          env: 'bash', txt: 'text'
                        };
                        return map[ext] || 'text';
                      })()}
                      style={vscDarkPlus}
                      showLineNumbers={true}
                      customStyle={{ margin: 0, padding: '1rem', background: 'transparent', minHeight: '100%' }}
                      wrapLines={true}
                    >
                      {textContent}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="text-slate-400 p-4 font-mono">Đang nạp mã nguồn từ đám mây...</div>
                  )}
                </div>
              </div>
            )}

            {!isImage && !isVideo && !isAudio && !isPdf && !isCodeOrText && (
              <div className="p-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm">
                <FileText className="w-16 h-16 text-blue-400" />
                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                <p className="text-xs text-slate-400">Định dạng tệp không hỗ trợ xem trước trực tiếp.</p>
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white shadow-lg transition-all"
                >
                  Tải xuống tệp gốc
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="px-6 py-3 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <span>Lưu trữ trên {item.storageProvider || 'google_cloud'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Phím tắt: ESC (Đóng), +/- (Thu phóng), R (Xoay)</span>
        </div>
      </div>
    </div>
  );
}
