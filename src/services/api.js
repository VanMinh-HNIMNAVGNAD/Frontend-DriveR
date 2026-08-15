import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 Unauthorized token expiration
api.interceptors.response.use(
  (response) => {
    // Standardize backend wrapped response ({ statusCode, data, message })
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      const path = window.location.pathname;
      // Khách vãng lai trên trang chia sẻ KHÔNG bao giờ bị redirect về /login
      const isPublicSharePage = path.startsWith('/share');
      if (!isPublicSharePage && path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    console.error('[API Error]', error);
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

// Auth APIs
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  updatePassword: (data) => api.patch('/users/me/password', data),
};

// User Profile APIs
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  updateAvatar: (formData) => api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  recalculateQuota: () => api.patch('/users/me/recalculate-quota'),
};

// Files & Folders Hierarchy APIs
export const filesApi = {
  getFilesAndFolders: (params = {}) => api.get('/files', { params }),
  createFolder: (data) => api.post('/folders', data),
  createFoldersBatch: (paths, parentId) => api.post('/files/folders/batch', { paths, parentId }),
  renameItem: (id, data) => api.patch(`/files/${id}/rename`, data),
  moveItem: (id, data) => api.patch(`/files/${id}/move`, data),
  copyItem: (id, data) => api.post(`/files/${id}/copy`, data),
  toggleStar: (id) => api.patch(`/files/${id}/star`),
  moveToTrash: (id) => api.patch(`/files/${id}/trash`),
  restoreFromTrash: (id) => api.patch(`/files/${id}/restore`),
  emptyTrash: () => api.delete('/files/trash/empty'),
  deletePermanently: (id) => api.delete(`/files/${id}/permanent`),
  getStorageAnalytics: () => api.get('/files/analytics'),
  downloadZip: (fileIds) => api.post('/files/download-zip', { fileIds }, { responseType: 'blob' }),
  getFileVersions: (id) => api.get(`/files/${id}/versions`),
  getActivityLogs: (id) => api.get(id ? `/files/${id}/activity-logs` : '/files/activity-logs'),
};

// Multi-Cloud Storage APIs
export const storageApi = {
  getUploadUrl: (data) => api.post('/files/upload-url', data),
  confirmUpload: (data) => api.post('/files/confirm-upload', data),
  getDownloadUrl: (id) => api.get(`/files/${id}/download-url`),
  getPreviewUrl: (id) => api.get(`/files/${id}/preview-url`),
  getFileTextContent: (id) => api.get(`/files/${id}/content`),

  // Direct PUT Upload to Presigned URL (Cloudflare R2 / Backblaze B2 / GCS)
  uploadDirectToCloud: async (presignedUrl, file, onUploadProgress) => {
    return axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },
  uploadProxy: async (file, parentId, targetProvider, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    if (targetProvider) formData.append('targetProvider', targetProvider);

    return api.post('/files/upload-proxy', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },
};

// Chunked / Resumable Upload API (GCS native resumable upload)
// Luồng: init → uploadChunkDirect (PUT lên GCS, lặp N lần) → complete
export const chunkedApi = {
  /**
   * Khởi tạo GCS resumable session.
   * Response: { uploadId, resumableUrl, storageKey, chunkSize, totalChunks, totalSizeBytes }
   */
  init: (data) =>
    api.post('/files/upload-chunk/init', data),

  /**
   * PUT 1 chunk trực tiếp lên GCS resumable URL.
   * GCS xác định vị trí chunk qua Content-Range header.
   * Không qua backend — gọi GCS endpoint trực tiếp.
   */
  uploadChunkDirect: async (resumableUrl, chunk, start, totalSize, onProgress) => {
    const end = start + chunk.size - 1;
    return axios.put(resumableUrl, chunk, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      },
      validateStatus: (status) => status === 200 || status === 201 || status === 308, // 308 = chunk nhận OK, chờ thêm
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const chunkPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(chunkPercent);
        }
      },
    });
  },

  /**
   * Hoàn tất: backend verify userId qua GCS metadata → tạo FileItem DB record.
   */
  complete: (data) =>
    api.post('/files/upload-chunk/complete', data),
};

// Sharing APIs — Public share link & access management
export const sharingApi = {
  /** Lấy thông tin tệp qua token chia sẻ (không cần đăng nhập) */
  getSharedItem: (token) => api.get(`/shares/${token}`),
  /** Sinh presigned preview URL (inline) qua token chia sẻ */
  getSharedPreviewUrl: (token, fileId) =>
    api.get(`/shares/${token}/preview-url`, { params: fileId ? { fileId } : {} }),
  /** Sinh presigned download URL qua token chia sẻ */
  getSharedDownloadUrl: (token, fileId) =>
    api.get(`/shares/${token}/download-url`, { params: fileId ? { fileId } : {} }),
  /** Lấy danh sách file/folder con trong thư mục được chia sẻ (không cần đăng nhập) */
  getSharedChildren: (token, folderId) =>
    api.get(`/shares/${token}/children`, { params: folderId ? { folderId } : {} }),
  /** Tạo link chia sẻ công khai cho một tệp (yêu cầu đăng nhập) */
  createShareLink: (id, data) => api.post(`/files/${id}/share`, data),
  /** Lấy danh sách người được chia sẻ trực tiếp (yêu cầu đăng nhập) */
  getShareAccess: (id) => api.get(`/files/${id}/share-access`),
  /** Thêm quyền truy cập cho người dùng cụ thể (yêu cầu đăng nhập) */
  addShareAccess: (id, data) => api.post(`/files/${id}/share-access`, data),
  /** Thu hồi quyền truy cập của một người dùng (yêu cầu đăng nhập) */
  removeShareAccess: (id, userId) => api.delete(`/files/${id}/share-access/${userId}`),
};

// Admin APIs (SUPER_ADMIN only)
export const adminApi = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserQuota: (id, storageLimitBytes) => api.patch(`/admin/users/${id}/quota`, { storageLimitBytes }),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  getSystemAnalytics: () => api.get('/admin/analytics'),
};

export default api;
