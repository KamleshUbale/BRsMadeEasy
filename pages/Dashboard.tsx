
import React from 'react';
import { getResolutions, getClientProfiles } from '../services/storage';
import { 
  FileText, Building2, Clock, CheckCircle2, 
  TrendingUp, Zap, Calendar, ArrowRight,
  History, FileSignature, Layers
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const resolutions = getResolutions();
  const clients = getClientProfiles();
  const recentResolutions = resolutions.slice(0, 5);
  
  const thisMonthCount = resolutions.filter(r => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const getDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#f05a28]/10 text-[#f05a28] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">Live Workspace</span>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formattedDate}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {getDayGreeting()}, <span className="text-[#1b438d]">Patron Team.</span>
          </h1>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => onNavigate('create')}
             className="bg-[#1b438d] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-[#163673] hover:scale-[1.02] transition-all flex items-center gap-2"
           >
              <Zap className="w-5 h-5" /> Quick Draft
           </button>
        </div>
      </div>

      {/* Stats Grid - Adjusted to 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-patron group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-[#1b438d] group-hover:bg-[#1b438d] group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio Reach</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">{clients.length}</h3>
            <span className="text-xs font-bold text-slate-400">Entities</span>
          </div>
          <div className="mt-4 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
             <div className="bg-[#1b438d] h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-patron group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 p-3 rounded-2xl text-[#f05a28] group-hover:bg-[#f05a28] group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">+{thisMonthCount} this month</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Output</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">{resolutions.length}</h3>
            <span className="text-xs font-bold text-slate-400">Drafts</span>
          </div>
          <div className="mt-4 flex gap-1 items-end h-6">
             {[30, 50, 40, 70, 45, 90, 60].map((h, i) => (
               <div key={i} className="flex-1 bg-orange-100 rounded-t-sm group-hover:bg-orange-200 transition-colors" style={{ height: `${h}%` }}></div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-patron group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Reliability</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">100%</h3>
            <span className="text-xs font-bold text-slate-400">Verified</span>
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-400">All statutory blocks synced.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Entity Registry */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[2.5rem] shadow-patron border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl"><Layers className="w-4 h-4" /></div>
                    <h3 className="font-black text-xl text-slate-900">Active Engagements</h3>
                 </div>
                 <button 
                  onClick={() => onNavigate('clients')}
                  className="text-[10px] font-black text-[#1b438d] uppercase tracking-widest hover:underline flex items-center gap-1"
                 >
                   View Master <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-8 py-5">Entity</th>
                         <th className="px-8 py-5">Engagement Status</th>
                         <th className="px-8 py-5 text-right">Draft Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-sm">
                      {clients.length === 0 ? (
                        <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-300 font-bold italic">No active entities found.</td></tr>
                      ) : (
                        clients.slice(0, 6).map((c, i) => {
                          const docCount = resolutions.filter(r => r.companyDetails.cin === c.cin).length;
                          return (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="font-black text-slate-900 group-hover:text-[#1b438d] transition-colors">{c.companyName}</div>
                                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{c.cin}</div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${docCount > 0 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                     <span className="font-bold text-slate-600 text-xs">{docCount} Docs Archived</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button 
                                    onClick={() => onNavigate('create')} 
                                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1b438d] hover:border-[#1b438d] hover:shadow-sm transition-all"
                                  >
                                    <FileSignature className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                          );
                        })
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Sidebar: Activity & Quick Actions */}
        <div className="space-y-8">
           {/* Recent Activity Timeline */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-patron">
              <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                 <History className="w-5 h-5 text-[#f05a28]" /> Recent Activity
              </h3>
              <div className="space-y-6">
                 {recentResolutions.length === 0 ? (
                    <div className="py-10 text-center">
                       <p className="text-xs text-slate-300 font-bold">No recent actions recorded.</p>
                    </div>
                 ) : (
                    recentResolutions.map((res, i) => (
                       <div key={res.id} className="relative pl-6 border-l-2 border-slate-100 group">
                          <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-200 group-hover:bg-[#1b438d] transition-colors border-2 border-white"></div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             <p className="text-xs font-black text-slate-800 line-clamp-1">{res.companyDetails.companyName}</p>
                             <p className="text-[10px] font-bold text-slate-400 italic">
                                {res.subType || res.docType} Drafted
                             </p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
              <button 
                onClick={() => onNavigate('list')}
                className="w-full mt-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1b438d] hover:bg-blue-50 transition-all"
              >
                View Full History
              </button>
           </div>

           {/* Quick Action Tiles */}
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onNavigate('clients')}
                className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-[#1b438d]/30 transition-all text-center group"
              >
                 <div className="bg-slate-50 p-3 rounded-2xl inline-block mb-3 group-hover:bg-blue-50 transition-colors">
                    <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#1b438d]" />
                 </div>
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Add Client</p>
              </button>
              <button 
                onClick={() => onNavigate('list')}
                className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-[#f05a28]/30 transition-all text-center group"
              >
                 <div className="bg-slate-50 p-3 rounded-2xl inline-block mb-3 group-hover:bg-orange-50 transition-colors">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#f05a28]" />
                 </div>
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Audit Vault</p>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
