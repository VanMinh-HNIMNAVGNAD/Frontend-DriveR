import { useState, useEffect } from 'react';

/**
 * useDebounce — Trả về giá trị đã được debounce sau `delay` ms.
 * Dùng để tránh gọi API mỗi keystroke khi người dùng gõ search.
 *
 * @param {any} value - Giá trị cần debounce (thường là search query)
 * @param {number} delay - Thời gian delay tính bằng ms (mặc định 400ms)
 * @returns {any} Giá trị sau debounce
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
