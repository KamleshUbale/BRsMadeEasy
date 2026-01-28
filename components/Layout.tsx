import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, Files, LogOut, User as UserIcon, Menu, LayoutTemplate, Shield, Building2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'create' | 'template-builder' | 'list' | 'admin' | 'clients';
  onNavigate: (page: 'dashboard' | 'create' | 'template-builder' | 'list' | 'admin' | 'clients') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { user, logout, isAdmin, canCreateTemplate } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ page, icon: Icon, label, visible = true }: { page: any, icon: any, label: string, visible?: boolean }) => {
    if (!visible) return null;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          setMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-2 text-sm font-medium transition-colors rounded-lg ${
          activePage === page
            ? 'bg-brand-900 text-white' // Active state: Deep Navy background
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-xl flex items-center gap-2">
          <Files className="w-6 h-6 text-orange-500" /> BRsMadeEasy
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:flex md:flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-brand-900">
          <div className="bg-white p-1.5 rounded-lg">
            <Files className="w-6 h-6 text-brand-900" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">BRsMadeEasy</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="mb-8">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem page="create" icon={FilePlus} label="Create Resolution" />
            <NavItem page="clients" icon={Building2} label="Client Profiles" />
            <NavItem 
              page="template-builder" 
              icon={LayoutTemplate} 
              label="My Templates" 
              visible={canCreateTemplate} 
            />
            <NavItem page="list" icon={Files} label="Saved Resolutions" />
            
            {isAdmin && (
               <>
                 <div className="my-4 border-t border-slate-100 mx-4"></div>
                 <p className="px-4 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Admin</p>
                 <NavItem page="admin" icon={Shield} label="Admin Panel" />
               </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;