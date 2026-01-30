
import React, { useState, useEffect, useRef } from 'react';
import { getClientProfiles, getResolutions, deleteClientProfile, saveClientProfile } from '../services/storage';
import { ClientProfile, ResolutionData, DirectorInfo } from '../types';
import { Building2, Search, Trash2, Plus, X, FileSignature, Save, Users, FileUp, Download } from 'lucide-react';
import Papa from 'papaparse';

interface Props {
  onDraftResolution: (clientId: string) => void;
}

const ClientProfiles: React.FC<Props> = ({ onDraftResolution }) => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    companyName: '',
    cin: '',
    address: '',
    companyEmail: '',
    directors: [{ name: '', din: '' }] as DirectorInfo[]
  });

  useEffect(() => {
    setClients(getClientProfiles());
    setResolutions(getResolutions());
  }, []);

  const handleDeleteClient = (id: string) => {
    if (confirm('Are you sure you want to delete this client profile?')) {
      deleteClientProfile(id);
      setClients(getClientProfiles());
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedDirectors = newClient.directors.filter(d => d.name.trim() !== '');
    saveClientProfile({
      ...newClient,
      directors: cleanedDirectors
    } as any);
    
    setClients(getClientProfiles());
    setShowAddModal(false);
    setNewClient({ 
      companyName: '', 
      cin: '', 
      address: '', 
      companyEmail: '', 
      directors: [{ name: '', din: '' }] 
    });
  };

  const handleDirectorChange = (index: number, field: keyof DirectorInfo, value: string) => {
    const updated = [...newClient.directors];
    updated[index] = { ...updated[index], [field]: value };
    setNewClient({ ...newClient, directors: updated });
  };

  const addDirectorRow = () => {
    setNewClient({ ...newClient, directors: [...newClient.directors, { name: '', din: '' }] });
  };

  const removeDirectorRow = (index: number) => {
    if (newClient.directors.length <= 1) return;
    setNewClient({ ...newClient, directors: newClient.directors.filter((_, i) => i !== index) });
  };

  const downloadSampleCSV = () => {
    const headers = ["Company Name", "CIN", "Address", "Email", "Directors (Format: Name1:DIN1, Name2:DIN2)"];
    const rows = [
      ["Example Private Limited", "U12345MH2023PTC123456", "123 Business Park, Mumbai", "contact@example.com", "John Doe:01234567, Jane Smith:08765432"]
    ];
    
    const csvContent = Papa.unparse({ fields: headers, data: rows });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "patron_client_master_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let successCount = 0;
        results.data.forEach((row: any) => {
          const companyName = row["Company Name"] || row["companyName"];
          const cin = row["CIN"] || row["cin"];
          const address = row["Address"] || row["address"];
          const email = row["Email"] || row["email"];
          const directorsRaw = row["Directors (Format: Name1:DIN1, Name2:DIN2)"] || row["directors"];

          if (companyName && cin) {
            let directors: DirectorInfo[] = [];
            if (directorsRaw) {
              directors = directorsRaw.split(',').map((pair: string) => {
                const parts = pair.split(':');
                return { name: parts[0]?.trim() || '', din: parts[1]?.trim() || '' };
              }).filter((d: DirectorInfo) => d.name !== '');
            }

            saveClientProfile({
              companyName,
              cin,
              address: address || '',
              companyEmail: email || '',
              directors: directors
            } as any);
            successCount++;
          }
        });

        setClients(getClientProfiles());
        alert(`Successfully imported ${successCount} clients into the master.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
      }
    });
  };

  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <span className="text-[#f05a28] font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Entity Registry</span>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Client Master</h1>
           <button 
             onClick={downloadSampleCSV}
             className="mt-2 text-[10px] font-black text-[#1b438d] uppercase tracking-widest flex items-center gap-1.5 hover:underline"
           >
             <Download className="w-3 h-3" /> Download Sample Template
           </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Corporate Entities..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept=".csv" 
             onChange={handleFileUpload} 
           />
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-white text-[#1b438d] border-2 border-[#1b438d] px-6 py-4 rounded-2xl font-black shadow-sm flex items-center justify-center gap-3 hover:bg-blue-50 transition-all"
           >
              <FileUp className="w-5 h-5" /> Import Master
           </button>

           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-[#1b438d] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 hover:bg-[#163673] transition-all"
           >
              <Plus className="w-5 h-5" /> Onboard New Entity
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map(client => {
          const clientResCount = resolutions.filter(r => r.companyDetails.cin === client.cin).length;
          
          return (
            <div key={client.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-patron hover:shadow-xl transition-all relative group flex flex-col h-full">
               <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-blue-50 text-[#1b438d] rounded-2xl">
                     <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Client Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight line-clamp-2" title={client.companyName}>{client.companyName}</h3>
               <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-6 font-mono">{client.cin}</p>
               
               <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><Building2 className="w-3.5 h-3.5 text-slate-300" /></div>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">{client.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><Users className="w-3.5 h-3.5 text-slate-300" /></div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-black uppercase tracking-tighter">
                        {client.directors?.length || 0} Directors Registered
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {client.directors?.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-[9px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100" title={`DIN: ${d.din || 'N/A'}`}>
                            {d.name}
                          </span>
                        ))}
                        {(client.directors?.length || 0) > 3 && <span className="text-[9px] text-slate-300 font-bold">+{(client.directors?.length || 0) - 3} more</span>}
                      </div>
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Digital Records</span>
                    <span className="text-sm font-black text-slate-900">{clientResCount} Documents</span>
                  </div>
                  <button 
                    onClick={() => onDraftResolution(client.id)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1b438d] transition-all shadow-lg"
                  >
                    <FileSignature className="w-3.5 h-3.5" /> Start Draft
                  </button>
               </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
           <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-100" />
              <p className="text-slate-400 font-black uppercase tracking-widest">No entities found</p>
              <p className="text-xs text-slate-300 font-bold mt-2">Onboard a client manually or draft a resolution to auto-populate this master.</p>
           </div>
        )}
      </div>

      {/* Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp my-auto">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900">Onboard New Entity</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                   <X className="w-6 h-6 text-slate-400" />
                </button>
             </div>
             
             <form onSubmit={handleAddClient} className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Corporate Name</label>
                      <input 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-sm"
                        value={newClient.companyName}
                        onChange={e => setNewClient({...newClient, companyName: e.target.value})}
                        placeholder="e.g. PATRON ACCOUNTING PRIVATE LIMITED"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">CIN / LLPIN</label>
                      <input 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-sm"
                        value={newClient.cin}
                        onChange={e => setNewClient({...newClient, cin: e.target.value})}
                        placeholder="L12345MH..."
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Entity Email</label>
                      <input 
                        required
                        type="email"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-sm"
                        value={newClient.companyEmail}
                        onChange={e => setNewClient({...newClient, companyEmail: e.target.value})}
                        placeholder="compliance@entity.com"
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Registered Address</label>
                      <textarea 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-sm min-h-[80px]"
                        value={newClient.address}
                        onChange={e => setNewClient({...newClient, address: e.target.value})}
                        placeholder="Full statutory address for header..."
                      />
                   </div>
                   
                   <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Director Register</label>
                        <button type="button" onClick={addDirectorRow} className="text-[10px] font-black text-[#1b438d] uppercase tracking-widest flex items-center gap-1 hover:underline">
                          <Plus className="w-3 h-3"/> Add Director
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {newClient.directors.map((dir, idx) => (
                          <div key={idx} className="flex gap-3 animate-fadeIn">
                             <div className="flex-1">
                                <input 
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-xs"
                                  placeholder="Director Name"
                                  value={dir.name}
                                  onChange={e => handleDirectorChange(idx, 'name', e.target.value)}
                                />
                             </div>
                             <div className="w-32">
                                <input 
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1b438d]/5 focus:border-[#1b438d] outline-none font-bold text-xs"
                                  placeholder="DIN"
                                  value={dir.din}
                                  onChange={e => handleDirectorChange(idx, 'din', e.target.value)}
                                />
                             </div>
                             {newClient.directors.length > 1 && (
                               <button type="button" onClick={() => removeDirectorRow(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setShowAddModal(false)}
                     className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 bg-[#1b438d] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 hover:bg-[#163673] transition-all"
                   >
                      <Save className="w-5 h-5" /> Save to Master
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfiles;
