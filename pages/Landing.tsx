
import React, { useState } from 'react';
import { useWorkspace, useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, User, Briefcase, Building } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const { login } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onEnter();
    } else {
      setError('Invalid Administrative Key');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Branding Side */}
        <div className="lg:w-1/2 patron-gradient p-12 lg:p-24 flex flex-col justify-center text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">PATRON STUDIO</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.05] tracking-tight">
              Corporate <br/> Drafting <span className="text-[#f05a28]">Evolved.</span>
            </h1>
            <p className="text-blue-100 text-xl mb-12 max-w-lg font-medium opacity-90">
              The internal professional toolkit for high-efficiency corporate legal automation and minute book management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onEnter}
                className="group flex items-center gap-4 py-5 px-10 rounded-2xl text-lg font-black text-white bg-[#f05a28] hover:bg-[#d94d1f] transition-all shadow-2xl shadow-orange-900/40 active:scale-95"
              >
                Access Team Hub
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        </div>

        {/* Action Side */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
          <div className="w-full max-w-sm text-center">
            {!showAdminLogin ? (
              <div className="animate-fadeIn">
                <div className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100 mb-10">
                  <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-6">
                    <Briefcase className="w-10 h-10 text-[#1b438d]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Workspace Protected</h2>
                  <p className="text-slate-500 text-sm font-medium">This portal is restricted to the Patron Professional Team. Entity Master and Digital Vault are enabled.</p>
                </div>

                <button 
                  onClick={() => setShowAdminLogin(true)}
                  className="text-xs font-black text-slate-300 uppercase tracking-widest hover:text-[#1b438d] transition-colors"
                >
                  Admin Key Access
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="mb-8 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto font-black uppercase text-[10px] tracking-widest"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back to access
                </button>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Administrator Panel</h2>
                <p className="text-slate-500 mb-8">Unlock Global Template Configuration.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {error && <div className="text-red-500 text-xs font-bold mb-4">{error}</div>}
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Enter Admin Key"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#1b438d] font-bold"
                    />
                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-[#1b438d] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20">
                    Unlock Admin Access
                  </button>
                </form>
              </div>
            )}
          </div>
          <p className="absolute bottom-10 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">© 2025 Patron Accounting - Team Workspace</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
