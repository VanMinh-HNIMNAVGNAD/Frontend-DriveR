/**
 * Format bytes to human readable string
 * @param {number|string} bytes - Số bytes cần format (có thể là string từ API)
 * @param {number} decimals - Số chữ số thập phân, mặc định 2
 * @returns {string} - Chuỗi đã format (ví dụ: "1.67 GB")
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  
  const num = Number(bytes);
  if (isNaN(num) || num < 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(num) / Math.log(k));
  const value = (num / Math.pow(k, i)).toFixed(dm);
  return `${value} ${sizes[i]}`;
}
