
import React from 'react';
import { useWorkspace, useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FilePlus, Files, Menu, 
  LayoutTemplate, Building2, ShieldCheck, Briefcase, 
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { mode } = useWorkspace();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ page, icon: Icon, label, visible = true }: { page: any, icon: any, label: string, visible?: boolean }) => {
    if (!visible) return null;
    const isActive = activePage === page;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          setMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-semibold transition-all rounded-xl group ${
          isActive
            ? 'bg-[#1b438d] text-white shadow-lg shadow-blue-900/20'
            : 'text-slate-500 hover:bg-slate-100 hover:text-[#1b438d]'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1b438d]'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="bg-[#1b438d] p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1b438d] leading-none tracking-tighter">PATRON</span>
              <span className="text-[10px] font-bold text-[#f05a28] uppercase tracking-[0.2em] mt-0.5">TEAM WORKSPACE</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
           <div className="flex items-center gap-2 text-[#1b438d] text-xs font-black uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Management Tool Active
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Access</span>
             <span className="text-xs font-bold text-[#1b438d]">Active Member</span>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white bg-[#1b438d] shadow-lg shadow-blue-900/10">
            T
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex-1 space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Workspace</p>
              <NavItem page="dashboard" icon={LayoutDashboard} label="Console" />
              <NavItem page="create" icon={FilePlus} label="Drafting Engine" />
              <NavItem page="clients" icon={Building2} label="Entity Master" />
              <NavItem page="list" icon={Files} label="Digital Vault" />
              
              <div className="pt-6">
                <p className="px-4 text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Configuration</p>
                <NavItem page="template-builder" icon={LayoutTemplate} label="Template Master" />
                <NavItem page="admin" icon={Shield} label="Security Panel" />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
