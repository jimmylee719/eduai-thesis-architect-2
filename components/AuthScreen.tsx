import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/mockBackend';
import { GraduationCap, Lock, Mail, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User | null = null;
      if (isLogin) {
        user = await authService.login(email, password);
        if (!user) throw new Error("帳號或密碼錯誤");
      } else {
        if (!name) throw new Error("請輸入姓名");
        user = await authService.register(email, password, name);
      }
      
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || "發生錯誤，請重試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? '歡迎回到 EduAI' : '建立您的帳號'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? '請登入以繼續使用智慧學習系統' : '開始探索個人化的 AI 學習體驗'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-slate-700 ml-1">姓名</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="您的稱呼"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="user@mail.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
             <label htmlFor="password" className="text-sm font-medium text-slate-700 ml-1">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-lg flex items-center gap-2">
                <span className="block w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isLogin ? '登入系統' : '立即註冊'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
            }}
            className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            {isLogin ? '還沒有帳號？ 點此註冊' : '已有帳號？ 點此登入'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
            <p>預設使用者: user@mail.com / 1234</p>
            <p>預設管理者: boss@mail.com / 1234</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
