import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getResolutionsByUser, getClientProfiles } from '../services/storage';
import { FilePlus, Files, Clock, ChevronRight, LayoutTemplate, Shield, Building2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'create' | 'template-builder' | 'list' | 'admin' | 'clients') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin, canCreateTemplate } = useAuth();
  const resolutions = user ? getResolutionsByUser(user.id) : [];
  const clientCount = getClientProfiles().length;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mt-1">Here is what's happening with your corporate compliance today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
            <Files className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Resolutions</p>
            <h3 className="text-2xl font-bold text-slate-900">{resolutions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
           <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Clients</p>
            <h3 className="text-2xl font-bold text-slate-900">{clientCount}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Last Generated</p>
            <h3 className="text-lg font-bold text-slate-900">
              {resolutions.length > 0 
                ? new Date(resolutions[0].createdAt).toLocaleDateString() 
                : 'N/A'}
            </h3>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div 
          onClick={() => onNavigate('create')}
          className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FilePlus className="w-24 h-24 text-brand-600" />
          </div>
          <div className="bg-brand-50 w-fit p-3 rounded-xl mb-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <FilePlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900">Create Resolution</h2>
          <p className="text-slate-500 mb-6 text-sm">Generate Board Resolutions using system or your own custom templates.</p>
          <span className="inline-flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-700">
            Start Drafting <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>

        <div 
          onClick={() => onNavigate('clients')}
          className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
        >
          <div className="bg-orange-50 w-fit p-3 rounded-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Client Profiles</h2>
          <p className="text-slate-500 mb-6 text-sm">View and manage company details and history.</p>
          <span className="inline-flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900">
            View Clients <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>

        {canCreateTemplate && (
          <div 
            onClick={() => onNavigate('template-builder')}
            className="group bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden text-white"
          >
            <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm">
              <LayoutTemplate className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create Template</h2>
            <p className="text-indigo-100 mb-6 text-sm">Design your own reusable resolution templates. Define fields and draft content.</p>
            <span className="inline-flex items-center text-sm font-semibold bg-white text-indigo-700 px-4 py-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
              Build Template <ChevronRight className="w-4 h-4 ml-1" />
            </span>
            <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        )}

        {isAdmin && (
          <div 
            onClick={() => onNavigate('admin')}
            className="group bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden text-white"
          >
            <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Admin Panel</h2>
            <p className="text-purple-100 mb-6 text-sm">Manage users, grant permissions, and oversee system templates.</p>
            <span className="inline-flex items-center text-sm font-semibold bg-white text-purple-700 px-4 py-2 rounded-lg group-hover:bg-purple-50 transition-colors">
              Manage System <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        )}

        <div 
          onClick={() => onNavigate('list')}
          className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
        >
          <div className="bg-slate-50 w-fit p-3 rounded-xl mb-4 group-hover:bg-slate-800 group-hover:text-white transition-colors">
            <Files className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">View Repository</h2>
          <p className="text-slate-500 mb-6 text-sm">Access, search, and download your previously generated corporate documents.</p>
          <span className="inline-flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;