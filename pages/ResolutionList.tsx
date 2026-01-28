import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getResolutionsByUser, deleteResolution } from '../services/storage';
import { Download, Trash2, Search, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const ResolutionList: React.FC = () => {
  const { user } = useAuth();
  const [resolutions, setResolutions] = useState(user ? getResolutionsByUser(user.id) : []);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resolution?')) {
      deleteResolution(id);
      if (user) setResolutions(getResolutionsByUser(user.id));
    }
  };

  const handleDownload = (res: any) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(res.finalContent, {
        callback: function (doc) {
          doc.save(`${res.companyDetails.companyName}_Resolution.pdf`);
        },
        x: 40,
        y: 40,
        width: 500,
        windowWidth: 650
      });
  };

  const filteredResolutions = resolutions.filter(r => 
    r.companyDetails.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Document Repository</h1>
           <p className="text-slate-500">Manage all your generated board resolutions.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by company or type..." 
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredResolutions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-800">No resolutions found</p>
            <p className="text-sm mt-1">Create a new resolution to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Company Name</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Resolution Category</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResolutions.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {res.companyDetails.companyName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                        {res.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                       <button 
                        onClick={() => handleDownload(res)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Download PDF"
                       >
                         <Download className="w-5 h-5" />
                       </button>
                       <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                       >
                         <Trash2 className="w-5 h-5" />
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