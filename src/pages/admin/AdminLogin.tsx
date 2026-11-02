import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { SchoolProfile } from '../../types';

interface AdminLoginProps {
  profile: SchoolProfile | null;
  onLoginSuccess: (token: string, user: any) => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ profile, onLoginSuccess, onBackToWebsite }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Check credentials.');
      }
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A2112] via-[#6B2E16] to-[#3B2117] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#D6A64F] max-w-md w-full overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#4A2112] text-[#FFF4E2] p-6 text-center border-b-2 border-[#D6A64F]">
          <div className="relative inline-block mb-3">
            <img
              src={logoSrc}
              alt="School Logo"
              className="w-20 h-20 object-contain rounded-full border-2 border-[#D6A64F] p-0.5 bg-white shadow-md mx-auto"
            />
          </div>
          <h2 className="font-heading font-extrabold text-lg text-white">
            Administrative Management Portal
          </h2>
          <p className="text-xs text-[#D6A64F] font-semibold mt-0.5">
            Saraswati Vidya Mandir Public School, Semla
          </p>
          <p className="text-[11px] text-[#E8D0B5]">Dumka (Jharkhand) • Reg. No: 2162/07</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Administrator Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#D6A64F]" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>

          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="text-xs font-semibold text-[#6B2E16] hover:text-[#4A2112] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
