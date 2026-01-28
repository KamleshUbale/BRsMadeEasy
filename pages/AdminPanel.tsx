import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllTemplates, getAllResolutions, updateUserStatus, updateUserPermission, deleteUserTemplate } from '../services/storage';
import { User, UserTemplate, ResolutionData, UserRole } from '../types';
import { Users, FileText, LayoutTemplate, Shield, Check, X, Trash2, Search, Power } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'templates' | 'resolutions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionData[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setUsers(getAllUsers());
    setTemplates(getAllTemplates());
    setResolutions(getAllResolutions());
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserStatus(userId, !currentStatus);
    refresh();
  };

  const handleTogglePermission = (userId: string, currentPermission: boolean) => {
    updateUserPermission(userId, !currentPermission);
    refresh();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Permanently delete this template?')) {
      deleteUserTemplate(id);
      refresh();
    }
  };

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Create Template?</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.role !== UserRole.ADMIN && (
                    <button 
                      onClick={() => handleTogglePermission(u.id, u.canCreateTemplate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${u.canCreateTemplate ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${u.canCreateTemplate ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  )}
                  {u.role === UserRole.ADMIN && <span className="text-slate-400 text-xs">Always Allowed</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role !== UserRole.ADMIN && (
                    <button 
                      onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        u.isActive 
                          ? 'border-red-200 text-red-600 hover:bg-red-50' 
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Template Name</th>
              <th className="px-6 py-4">Created By</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                <td className="px-6 py-4 text-slate-600">
                   {users.find(u => u.id === t.userId)?.name || 'Unknown User'}
                   {t.isSystemTemplate && <span className="ml-2 text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">(Admin)</span>}
                </td>
                <td className="px-6 py-4">
                  {t.isSystemTemplate ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      System Global
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      Private User
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDeleteTemplate(t.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
               <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No templates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderResolutions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Generated By</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resolutions.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{r.companyDetails.companyName}</td>
                <td className="px-6 py-4 text-slate-600">{users.find(u => u.id === r.userId)?.name || 'Unknown User'}</td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{r.type.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-600" /> Admin Control Panel
          </h1>
          <p className="text-slate-500 mt-1">Manage users, permissions, and system-wide content.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${
             activeTab === 'users' ? 'bg-white border-x border-t border-slate-200 text-brand-600' : 'text-slate-500 hover:text-slate-700 bg-slate-50'
          }`}
        >
           <Users className="w-4 h-4" /> User Management
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${
             activeTab === 'templates' ? 'bg-white border-x border-t border-slate-200 text-brand-600' : 'text-slate-500 hover:text-slate-700 bg-slate-50'
          }`}
        >
           <LayoutTemplate className="w-4 h-4" /> Template Master
        </button>
        <button 
          onClick={() => setActiveTab('resolutions')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${
             activeTab === 'resolutions' ? 'bg-white border-x border-t border-slate-200 text-brand-600' : 'text-slate-500 hover:text-slate-700 bg-slate-50'
          }`}
        >
           <FileText className="w-4 h-4" /> Resolution Monitor
        </button>
      </div>

      <div>
         {activeTab === 'users' && renderUsers()}
         {activeTab === 'templates' && renderTemplates()}
         {activeTab === 'resolutions' && renderResolutions()}
      </div>
    </div>
  );
};

export default AdminPanel;