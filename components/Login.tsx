
import React, { useState } from 'react';
import { Lock, ShieldAlert, Loader2, Building2 } from 'lucide-react';

interface Props {
  onLogin: (key: string) => Promise<boolean>;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [adminKey, setAdminKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const success = await onLogin(adminKey);
    if (!success) {
      setError('Invalid Admin Key. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
           <div className="bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
             <Building2 className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
           <p className="text-slate-500 text-sm mt-1">ChennaiPropertyPro Management</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-6 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
            <ShieldAlert size={20} className="shrink-0" />
            <p>Access is restricted to authorized bank representatives and administrators only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Secret Admin Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter your security key"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Grant Access'
              )}
            </button>
          </form>
        </div>

        <button 
          onClick={() => window.location.hash = '#/'}
          className="w-full text-center mt-6 text-sm text-slate-500 hover:text-primary transition-colors font-medium"
        >
          Return to Main Website
        </button>
      </div>
    </div>
  );
};

export default Login;
