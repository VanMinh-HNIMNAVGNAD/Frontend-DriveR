import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { HardDrive, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const location = useLocation();

  // Đọc query param ?error=oauth_failed khi OAuth cụ redirect về với lỗi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'oauth_failed') {
      setLocalError('Đăng nhập OAuth thất bại. Vui lòng thử lại hoặc sử dụng Email để đăng nhập.');
    }
  }, [location.search]);

  const validateEmail = (val) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(val)) {
      return 'Email không hợp lệ. Vui lòng nhập đúng định dạng (Ví dụ: name@gmail.com)';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setLocalError(emailErr);
      return;
    }

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      console.error('Đăng nhập thất bại:', err);
    }
  };

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const handleSocialLogin = (providerName) => {
    if (providerName === 'Google') {
      window.location.href = `${apiBase}/auth/google`;
    } else if (providerName === 'GitHub') {
      window.location.href = `${apiBase}/auth/github`;
    } else if (providerName === 'Facebook') {
      window.location.href = `${apiBase}/auth/facebook`;
    } else {
      setLocalError(`Đăng nhập bằng ${providerName} sắp ra mắt. Vui lòng sử dụng Google, GitHub, Facebook hoặc Email!`);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <HardDrive className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Đăng nhập driveR</h2>
          <p className="text-xs text-slate-400">Truy cập toàn bộ hệ sinh thái lưu trữ đám mây của bạn</p>
        </div>

        {displayError && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-300 text-center font-medium">
            {displayError}
          </div>
        )}

        {/* Social Login Options */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Đăng nhập nhanh bằng
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
              title="Đăng nhập bằng Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
              title="Đăng nhập bằng Facebook"
            >
              <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
              title="Đăng nhập bằng GitHub"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest absolute">
            hoặc email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email (Khuyên dùng @gmail.com)
            </label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-blue-500 transition-all">
              <Mail className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="flex items-center bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-blue-500 transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Đang xử lý...' : 'Vào Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs text-slate-400 pt-2">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
