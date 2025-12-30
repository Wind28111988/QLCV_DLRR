
import React, { useState } from 'react';
import { User } from '../types';
// Add ADMIN_PREFIX to the import list
import { ADMIN_EMAIL_IMPORT, ADMIN_PASSWORD_2025, SYSTEM_RECOVERY_CODE, ADMIN_PREFIX } from '../constants';
import { ShieldAlert, X, CheckCircle2, KeyRound } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onResetPassword: (email: string, newPass: string) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, onResetPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // States cho modal khôi phục
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const fullEmail = username.includes('@') ? username : `${username}@gdt.gov.vn`;
    const user = users.find(u => u.email.toLowerCase() === fullEmail.toLowerCase() && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = recoveryEmail.includes('@') ? recoveryEmail : `${recoveryEmail}@gdt.gov.vn`;
    
    // Kiểm tra xem email có tồn tại không
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      setRecoveryMessage({ text: 'Địa chỉ email này không tồn tại trong hệ thống.', type: 'error' });
      return;
    }

    // Nếu là admin tối cao
    if (email.toLowerCase() === ADMIN_EMAIL_IMPORT.toLowerCase()) {
      if (recoveryCode === SYSTEM_RECOVERY_CODE) {
        onResetPassword(email, ADMIN_PASSWORD_2025);
        setRecoveryMessage({ 
          text: `Khôi phục thành công! Mật khẩu tài khoản Quản trị đã được reset về mặc định: ${ADMIN_PASSWORD_2025}`, 
          type: 'success' 
        });
      } else {
        setRecoveryMessage({ text: 'Mã khôi phục hệ thống không chính xác.', type: 'error' });
      }
    } else {
      // Nếu là user thường
      setRecoveryMessage({ 
        text: 'Đối với tài khoản nhân sự, vui lòng liên hệ Quản trị viên hệ thống (admin@gdt.gov.vn) để được cấp lại mật khẩu.', 
        type: 'info' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-indigo-950">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-xl shadow-indigo-200">
              Q
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Đăng nhập Hệ thống</h1>
            <p className="text-slate-500 mt-2">Quản lý công việc</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
            {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">{error}</div>}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tài khoản đăng nhập</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản..."
                  autoComplete="one-time-code"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold">
                  @gdt.gov.vn
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mật khẩu</label>
                <button 
                  type="button"
                  onClick={() => {
                    setIsRecoveryModalOpen(true);
                    setRecoveryMessage(null);
                    setRecoveryEmail(username);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transform active:scale-[0.98] transition-all"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Hệ thống Quản lý công việc &copy; 2025
          </div>
        </div>
      </div>

      {/* Modal Khôi phục mật khẩu */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsRecoveryModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-10">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                <KeyRound size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Khôi phục mật khẩu</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">Vui lòng cung cấp thông tin tài khoản để nhận hỗ trợ khôi phục.</p>

              {recoveryMessage && (
                <div className={`p-4 rounded-2xl mb-6 text-sm font-medium border flex items-start space-x-3 ${
                  recoveryMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  recoveryMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>
                  {recoveryMessage.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <ShieldAlert size={18} className="mt-0.5 shrink-0" />}
                  <span>{recoveryMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRecoverySubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ Email</label>
                  <input
                    type="text"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="email@gdt.gov.vn"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Ô nhập mã bảo mật chỉ hiện khi nhập đúng email admin tối cao */}
                {(recoveryEmail.toLowerCase() === ADMIN_EMAIL_IMPORT.toLowerCase() || recoveryEmail.toLowerCase() === ADMIN_PREFIX) && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center">
                      <ShieldAlert size={12} className="mr-1" /> Mã khôi phục hệ thống (Admin)
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="Nhập mã bảo mật hệ thống..."
                      className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm font-mono font-black outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-900 shadow-xl shadow-slate-200 transition-all mt-4"
                >
                  Xác nhận yêu cầu
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
