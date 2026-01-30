
import React, { useState, useEffect } from 'react';
import { getResolutions, deleteResolution } from '../services/storage';
import { Download, Trash2, Search, FileText, Edit2, Building2 } from 'lucide-react';
import { ResolutionData, DocCategory, DocSubType } from '../types';
import jsPDF from 'jspdf';

interface Props {
  onEdit: (res: ResolutionData) => void;
}

const ResolutionList: React.FC<Props> = ({ onEdit }) => {
  const [resolutions, setResolutions] = useState<ResolutionData[]>(getResolutions());
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      deleteResolution(id);
      setResolutions(getResolutions());
    }
  };

  const handleDownload = (res: ResolutionData) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(res.finalContent, {
        callback: function (doc) {
          doc.save(`${res.companyDetails.companyName}_${res.docType}.pdf`);
        },
        x: 40,
        y: 40,
        width: 500,
        windowWidth: 650
      });
  };

  const getDocLabel = (res: ResolutionData) => {
    if (res.subType === 'SPECIMEN_SIGNATURE') return 'Specimen Signature';
    if (res.subType === 'INC_NOC') return 'NOC (Incorporation)';
    if (res.docType === 'RESOLUTION') return 'Board Resolution';
    if (res.docType === 'RESIGNATION') return 'Resignation Letter';
    if (res.docType === 'DIR2') return 'DIR-2 (Consent)';
    if (res.docType === 'NOC') return 'NOC Certificate';
    return res.docType.replace(/_/g, ' ');
  };

  const filteredResolutions = resolutions.filter(r => 
    r.companyDetails.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDocLabel(r).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <span className="text-[#f05a28] font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Minute Book Vault</span>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Repository</h1>
           <p className="text-slate-400 font-medium mt-1">Archive of all generated statutory documents.</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by Entity or Doc Type..." 
             className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-bold text-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-patron border border-slate-200 overflow-hidden">
        {filteredResolutions.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-3xl mb-6">
              <FileText className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Vault is empty</p>
            <p className="text-xs text-slate-300 font-bold mt-2">Documents you finalize in the drafting engine will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Filing Date</th>
                  <th className="px-8 py-6">Corporate Entity</th>
                  <th className="px-8 py-6">Document Type</th>
                  <th className="px-8 py-6 text-right">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResolutions.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-slate-400 font-mono text-xs">
                      {new Date(res.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 text-[#1b438d] rounded-lg"><Building2 className="w-4 h-4" /></div>
                         <div className="font-black text-slate-900 tracking-tight">{res.companyDetails.companyName}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        res.docType === 'RESOLUTION' ? 'bg-blue-50 text-blue-600' : 
                        res.docType === 'INCORPORATION' ? 'bg-purple-50 text-purple-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {getDocLabel(res)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                       <button 
                        onClick={() => onEdit(res)}
                        className="p-3 text-slate-400 hover:text-[#1b438d] hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Document"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleDownload(res)}
                        className="p-3 text-slate-400 hover:text-[#f05a28] hover:bg-orange-50 rounded-xl transition-all"
                        title="Download PDF"
                       >
                         <Download className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Permanently"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolutionList;
