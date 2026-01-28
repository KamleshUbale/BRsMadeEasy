import React, { useState, useEffect } from 'react';
import { getClientProfiles, getAllResolutions } from '../services/storage';
import { ClientProfile, ResolutionData } from '../types';
import { Building2, Search, FileText, ChevronRight } from 'lucide-react';

const ClientProfiles: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setClients(getClientProfiles());
    setResolutions(getAllResolutions());
  }, []);

  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Client Profiles</h1>
           <p className="text-slate-500">Manage your company database and view history.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search company or CIN..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
          const clientResCount = resolutions.filter(r => r.companyDetails.cin === client.cin).length;
          
          return (
            <div key={client.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                     <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                     {clientResCount} Docs
                  </span>
               </div>
               
               <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1" title={client.companyName}>{client.companyName}</h3>
               <p className="text-xs text-slate-500 mb-4 font-mono">{client.cin}</p>
               
               <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <p className="line-clamp-2 text-xs">{client.address}</p>
               </div>

               <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Last updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
               </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
           <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No client profiles found.</p>
              <p className="text-sm">Profiles are created automatically when you generate a resolution.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfiles;