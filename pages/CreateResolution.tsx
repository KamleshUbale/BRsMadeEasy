
import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/AuthContext';
import { 
  UserType, CompanyDetails, MeetingType, ResolutionType, UserTemplate, 
  ResolutionItemData, HeaderFooterConfig, ClientProfile, DocCategory, DocSubType, ResolutionData 
} from '../types';
import { saveResolution, getAllTemplates, getClientProfiles, GLOBAL_USER_ID } from '../services/storage';
import { 
  ChevronRight, ChevronLeft, Check, Download, Save, Trash2, 
  Files, Building2, Search, FileText, UserMinus, UserCheck, 
  Stamp, ScrollText, ArrowRight, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import jsPDF from 'jspdf';

interface CreateResolutionProps {
  onComplete: () => void;
  initialClientId?: string | null;
  editResolution?: ResolutionData | null;
}

const CreateResolution: React.FC<CreateResolutionProps> = ({ onComplete, initialClientId, editResolution }) => {
  const { mode } = useWorkspace();
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);
  
  const [selectedDoc, setSelectedDoc] = useState<DocCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<DocSubType | null>(null);
  
  const [allTemplates, setAllTemplates] = useState<UserTemplate[]>([]);
  const [existingClients, setExistingClients] = useState<ClientProfile[]>([]);

  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    cin: '',
    companyName: '',
    address: '',
    companyEmail: '',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingTime: '11:00',
    meetingPlace: 'Registered Office',
    financialYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    meetingType: MeetingType.BOARD,
    chairmanName: '',
    chairmanDin: '',
    directorsPresent: '',
    quorumPresent: true,
  });

  const [resolutionItems, setResolutionItems] = useState<ResolutionItemData[]>([]);
  
  const [headerFooter, setHeaderFooter] = useState<HeaderFooterConfig>({
    showHeader: true,
    headerTitle: '',
    headerSubtitle: '',
    signatoryName: '',
    signatoryDesignation: 'Director',
    signatoryDin: ''
  });

  useEffect(() => {
    const clients = getClientProfiles();
    setExistingClients(clients);
    setAllTemplates(getAllTemplates());

    if (editResolution) {
      setCompanyDetails(editResolution.companyDetails);
      setResolutionItems(editResolution.items || []);
      setHeaderFooter(editResolution.headerFooter || headerFooter);
      setSelectedDoc(editResolution.docType);
      setSelectedSub(editResolution.subType || null);
      setEditedContent(editResolution.finalContent);
      setStep(5); // Jump directly to preview
    } else if (initialClientId) {
      const client = clients.find(c => c.id === initialClientId);
      if (client) populateFromClient(client);
    }
  }, [initialClientId, editResolution]);

  useEffect(() => {
    if (step === 5 && !editResolution) setEditedContent(generateInitialHTML());
  }, [step]);

  const populateFromClient = (client: ClientProfile) => {
    setCompanyDetails(prev => ({
      ...prev,
      cin: client.cin,
      companyName: client.companyName,
      address: client.address,
      companyEmail: client.companyEmail,
      directorsPresent: client.directors?.map(d => d.name).join(', ') || ''
    }));
    setHeaderFooter(prev => ({
      ...prev, 
      headerTitle: client.companyName, 
      headerSubtitle: client.address,
      signatoryName: client.directors?.[0]?.name || ''
    }));
  };

  const handleDocSelection = (category: DocCategory) => {
    setSelectedDoc(category);
    if (category !== 'INCORPORATION') {
      setStep(1); // Jump straight to Entity Info
    }
  };

  const handleSubSelection = (sub: DocSubType) => {
    setSelectedSub(sub);
    setStep(1);
  };

  const handleNext = () => {
    const isSimplified = selectedDoc === 'RESIGNATION' || selectedDoc === 'DIR2' || selectedSub === 'INC_NOC' || selectedSub === 'SPECIMEN_SIGNATURE';
    
    if (isSimplified && step === 1) {
      if (resolutionItems.length === 0) {
        let templateName = '';
        if (selectedSub === 'INC_NOC') templateName = 'Standard NOC Template';
        if (selectedSub === 'SPECIMEN_SIGNATURE') templateName = 'Specimen Signature Card';

        const resTemplate = templateName 
          ? allTemplates.find(t => t.name === templateName)
          : allTemplates.find(t => t.category === selectedDoc);

        if (resTemplate) {
          setResolutionItems([{
            id: crypto.randomUUID(),
            type: ResolutionType.CUSTOM,
            templateId: resTemplate.id,
            templateName: resTemplate.name,
            draftText: resTemplate.draftText,
            customValues: {}
          }]);
        }
      }
      setStep(4); // Skip Library (2) and Header (3)
      return;
    }

    if (selectedDoc === 'RESOLUTION' && step === 2) {
      setStep(4);
      return;
    }

    setStep(s => s + 1);
  };

  const handleBack = () => {
    const isSimplified = selectedDoc === 'RESIGNATION' || selectedDoc === 'DIR2' || selectedSub === 'INC_NOC' || selectedSub === 'SPECIMEN_SIGNATURE';
    
    if (isSimplified && step === 4) {
      setStep(1);
      return;
    }

    if (selectedDoc === 'RESOLUTION' && step === 4) {
      setStep(2);
      return;
    }

    setStep(s => s - 1);
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (printRef.current) {
      setEditedContent(printRef.current.innerHTML);
    }
  };

  const inputClass = "w-full px-5 py-3 bg-[#F8F9FB] border border-[#CBD5E1] rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder-slate-400 text-slate-800 text-sm font-semibold";
  const labelClass = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setCompanyDetails({ ...companyDetails, [e.target.name]: value });
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const client = existingClients.find(c => c.id === e.target.value);
    if (client) populateFromClient(client);
  };

  const addResolutionItem = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    setResolutionItems([...resolutionItems, {
      id: crypto.randomUUID(),
      type: ResolutionType.CUSTOM,
      templateId: template.id,
      templateName: template.name,
      draftText: template.draftText,
      customValues: {}
    }]);
  };

  const removeResolutionItem = (id: string) => setResolutionItems(resolutionItems.filter(i => i.id !== id));

  const handleItemValueChange = (itemId: string, fieldKey: string, value: string) => {
    setResolutionItems(prev => prev.map(item => item.id === itemId ? {
      ...item, customValues: { ...item.customValues, [fieldKey]: value }
    } : item));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const content = printRef.current;
    
    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save(`${companyDetails.companyName || 'Document'}_Draft.pdf`);
        },
        x: 40,
        y: 40,
        width: 500,
        windowWidth: 650
      });
    }
  };

  const generateInitialHTML = () => {
    const { headerTitle, headerSubtitle, signatoryName, signatoryDesignation } = headerFooter;
    const { companyName, address, chairmanName, cin, meetingDate, meetingPlace } = companyDetails;

    const itemsHTML = resolutionItems.map((item) => {
      let draft = item.draftText;
      const template = allTemplates.find(t => t.id === item.templateId);

      if (selectedSub === 'SPECIMEN_SIGNATURE') {
        const names = (item.customValues['Signatory Names (Comma Separated)'] || '').split(',');
        const designations = (item.customValues['Signatory Designations (Comma Separated)'] || '').split(',');
        
        let boxesHTML = '';
        names.forEach((name, idx) => {
          if (!name.trim()) return;
          const designation = (designations[idx] || '').trim();
          boxesHTML += `
            <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px; page-break-inside: avoid;">
              <p style="margin: 0 0 10px 0;">Name: <strong>${name.trim()}</strong></p>
              <p style="margin: 0 0 10px 0;">Designation: <strong>${designation}</strong></p>
              <p style="margin: 0 0 5px 0;">Specimen Signature:</p>
              <p style="margin: 10px 0;">1. __________________________</p>
              <p style="margin: 10px 0;">2. __________________________</p>
              <p style="margin: 10px 0;">3. __________________________</p>
            </div>
          `;
        });
        draft = draft.replace('{{DYNAMIC_SIGNATORY_BOXES}}', boxesHTML);
      }
      
      template?.fields.forEach(f => {
        const val = item.customValues[f.label] || `[${f.label}]`;
        draft = draft.replace(new RegExp(`{{${f.label}}}`, 'g'), `<strong>${val}</strong>`);
      });

      const systemVars = {
        'Company_Name': companyName,
        'Company_Address': address,
        'CIN': cin,
        'Chairman_Name': chairmanName,
        'Meeting_Date': meetingDate,
        'Meeting_Place': meetingPlace
      };

      Object.entries(systemVars).forEach(([key, val]) => {
        draft = draft.replace(new RegExp(`{{${key}}}`, 'g'), `<strong>${val || `[${key}]`}</strong>`);
      });

      return `<div style="margin-bottom: 25px;">${draft}</div>`;
    }).join('');

    const isSpecialDoc = selectedDoc === 'RESIGNATION' || selectedDoc === 'DIR2' || selectedSub === 'INC_NOC' || selectedSub === 'SPECIMEN_SIGNATURE' || selectedDoc === 'RESOLUTION';

    const headerHTML = !isSpecialDoc && headerFooter.showHeader ? `
        <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
           <h1 style="font-size: 16pt; font-weight: bold; margin:0;">${headerTitle || companyName}</h1>
           <p style="font-size: 9pt; margin:5px 0;">${headerSubtitle || address}</p>
        </div>` : '';

    const footerHTML = !isSpecialDoc ? `
        <div style="margin-top: 50px;">
           <p>For <strong>${companyName}</strong></p>
           <br/><br/>
           <p><strong>${signatoryName || chairmanName}</strong><br/>${signatoryDesignation}</p>
        </div>` : '';

    return `
      ${headerHTML}
      <div style="padding: 20px;">
        ${itemsHTML || '<p style="text-align:center; color:#ccc;">[Document Draft Content Placeholder]</p>'}
      </div>
      ${footerHTML}
    `;
  };

  const handleSave = () => {
    setLoading(true);
    saveResolution({
      userId: GLOBAL_USER_ID,
      companyDetails,
      type: ResolutionType.CUSTOM,
      items: resolutionItems,
      headerFooter,
      finalContent: printRef.current?.innerHTML || editedContent,
      docType: selectedDoc || 'RESOLUTION',
      subType: selectedSub || undefined
    });
    setTimeout(onComplete, 800);
  };

  const docTypes = [
    { id: 'RESOLUTION', label: 'Board Resolution', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'INCORPORATION', label: 'Incorporation Documents', icon: Stamp, color: 'text-purple-600', bg: 'bg-purple-50', hasSub: true },
    { id: 'RESIGNATION', label: 'Resignation', icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'DIR2', label: 'DIR-2 (Consent)', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const subTypes = [
    { id: 'SPECIMEN_SIGNATURE', label: 'Specimen Signature', icon: Stamp },
    { id: 'INC_NOC', label: 'NOC (Incorporation)', icon: ScrollText },
  ];

  const isSimplified = selectedDoc === 'RESIGNATION' || selectedDoc === 'DIR2' || selectedSub === 'INC_NOC' || selectedSub === 'SPECIMEN_SIGNATURE';

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-center mb-10 shrink-0">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const isHidden = (isSimplified && (i === 2 || i === 3)) || (selectedDoc === 'RESOLUTION' && i === 3);
          if (isHidden) return null;
          
          return (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                step >= i ? 'bg-[#1b438d] border-[#1b438d] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'
              }`}>{step > i ? <Check className="w-5 h-5" /> : i + 1}</div>
              {i < 5 && !(isSimplified && i === 1) && !(selectedDoc === 'RESOLUTION' && i === 2) && <div className={`w-12 h-1 mx-2 rounded-full ${step > i ? 'bg-[#1b438d]' : 'bg-slate-200'}`} />}
              {(isSimplified && i === 1) && <div className={`w-12 h-1 mx-2 rounded-full ${step >= 4 ? 'bg-[#1b438d]' : 'bg-slate-200'}`} />}
              {(selectedDoc === 'RESOLUTION' && i === 2) && <div className={`w-12 h-1 mx-2 rounded-full ${step >= 4 ? 'bg-[#1b438d]' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-patron border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-8 border-b border-slate-50 bg-[#fafbfc] flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 0 && 'Document Selection'}
            {step === 1 && 'Entity Information'}
            {step === 2 && `${selectedDoc?.charAt(0) + selectedDoc?.slice(1).toLowerCase()} Library`}
            {step === 3 && 'Statutory Header'}
            {step === 4 && 'Data Variable Entry'}
            {step === 5 && 'Legal Finalization & Edit'}
          </h2>
          {step === 5 && (
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-[#f05a28] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d94d1f] transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Download Draft
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-10 custom-scrollbar">
           {step === 0 && (
             <div className="animate-fadeIn max-w-4xl mx-auto">
               {!selectedDoc ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {docTypes.map(doc => (
                     <button
                       key={doc.id}
                       onClick={() => handleDocSelection(doc.id as DocCategory)}
                       className="flex flex-col items-center p-10 bg-white border border-slate-100 rounded-[2.5rem] hover:border-[#1b438d] hover:shadow-2xl transition-all group text-center"
                     >
                       <div className={`p-6 rounded-3xl ${doc.bg} ${doc.color} mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                         <doc.icon className="w-12 h-12" />
                       </div>
                       <h3 className="text-lg font-black text-slate-900">{doc.label}</h3>
                     </button>
                   ))}
                 </div>
               ) : selectedDoc === 'INCORPORATION' && !selectedSub ? (
                 <div className="max-w-xl mx-auto py-10 animate-slideUp">
                   <button onClick={() => setSelectedDoc(null)} className="text-[10px] font-black uppercase text-slate-400 mb-8 hover:text-slate-600 flex items-center gap-2">
                     <ChevronLeft className="w-3 h-3"/> Choose different category
                   </button>
                   <h3 className="text-xl font-black text-slate-900 mb-8">Select Specific Document:</h3>
                   <div className="space-y-4">
                     {subTypes.map(sub => (
                       <button
                         key={sub.id}
                         onClick={() => handleSubSelection(sub.id as DocSubType)}
                         className="w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#1b438d] hover:bg-white transition-all group"
                       >
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><sub.icon className="w-6 h-6" /></div>
                            <span className="font-black text-slate-700">{sub.label}</span>
                         </div>
                         <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#1b438d] group-hover:translate-x-1 transition-all" />
                       </button>
                     ))}
                   </div>
                 </div>
               ) : null}
             </div>
           )}

           {step === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                <div className="md:col-span-2 flex justify-between items-center mb-4">
                   <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Client Entity</h3>
                   <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
                      <select onChange={handleClientSelect} className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 outline-none">
                         <option value="">Load from Entity Master...</option>
                         {existingClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                      </select>
                   </div>
                </div>
                <div className="md:col-span-2">
                   <label className={labelClass}>Company Name</label>
                   <input name="companyName" value={companyDetails.companyName} onChange={handleCompanyChange} className={inputClass} placeholder="PATRON ACCOUNTING PRIVATE LIMITED" />
                </div>
                <div><label className={labelClass}>CIN / LLPIN</label><input name="cin" value={companyDetails.cin} onChange={handleCompanyChange} className={inputClass} placeholder="L12345..." /></div>
                <div><label className={labelClass}>Email Address</label><input name="companyEmail" value={companyDetails.companyEmail} onChange={handleCompanyChange} className={inputClass} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Statutory Address</label><textarea name="address" value={companyDetails.address} onChange={handleCompanyChange} className={inputClass + " min-h-[80px]"} /></div>
             </div>
           )}

           {step === 2 && (
             <div className="max-w-2xl mx-auto py-10 animate-slideUp">
                <div className="relative mb-10">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <select 
                    className="w-full pl-12 pr-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-700 bg-slate-50 outline-none focus:border-[#1b438d] transition-all"
                    onChange={(e) => { if(e.target.value) { addResolutionItem(e.target.value); e.target.value = ''; } }}
                  >
                    <option value="">Select {selectedDoc} Template...</option>
                    {allTemplates.filter(t => t.category === selectedDoc).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                   {resolutionItems.map((item, idx) => (
                      <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm">
                         <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-blue-50 text-[#1b438d] flex items-center justify-center text-xs font-black">#{idx+1}</div><span className="font-black text-slate-800 tracking-tight">{item.templateName}</span></div>
                         <button onClick={() => removeResolutionItem(item.id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5 text-red-400" /></button>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fadeIn">
                 <div className="md:col-span-2 flex items-center justify-between mb-2">
                    <label className={labelClass}>Include Entity Letterhead</label>
                    <input type="checkbox" checked={headerFooter.showHeader} onChange={e => setHeaderFooter({...headerFooter, showHeader: e.target.checked})} className="w-6 h-6 text-[#1b438d] rounded-lg" />
                 </div>
                 <div className="md:col-span-2"><label className={labelClass}>Header Name</label><input value={headerFooter.headerTitle} onChange={e => setHeaderFooter({...headerFooter, headerTitle: e.target.value})} className={inputClass} /></div>
                 <div className="md:col-span-2"><label className={labelClass}>Header Address</label><textarea value={headerFooter.headerSubtitle} onChange={e => setHeaderFooter({...headerFooter, headerSubtitle: e.target.value})} className={inputClass} /></div>
                 <div><label className={labelClass}>Signatory</label><input value={headerFooter.signatoryName} onChange={e => setHeaderFooter({...headerFooter, signatoryName: e.target.value})} className={inputClass} /></div>
                 <div><label className={labelClass}>Designation</label><input value={headerFooter.signatoryDesignation} onChange={e => setHeaderFooter({...headerFooter, signatoryDesignation: e.target.value})} className={inputClass} /></div>
              </div>
           )}

           {step === 4 && (
              <div className="space-y-10 max-w-4xl mx-auto animate-fadeIn">
                 {resolutionItems.map((item, idx) => {
                   const template = allTemplates.find(t => t.id === item.templateId);
                   return (
                     <div key={item.id} className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-patron">
                        <h3 className="font-black text-xl text-slate-900 mb-8">Variable Entry: {item.templateName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {template?.fields.map(f => (
                             <div key={f.id} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className={labelClass}>{f.label}</label>
                                {f.type === 'textarea' ? (
                                   <textarea className={inputClass + " min-h-[80px]"} value={item.customValues[f.label] || ''} onChange={(e) => handleItemValueChange(item.id, f.label, e.target.value)} />
                                ) : (
                                   <input className={inputClass} type={f.type === 'date' ? 'date' : 'text'} value={item.customValues[f.label] || ''} onChange={(e) => handleItemValueChange(item.id, f.label, e.target.value)} />
                                )}
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                 })}
              </div>
           )}

           {step === 5 && (
              <div className="flex flex-col items-center gap-6 animate-slideUp">
                 <div className="w-[210mm] bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2 shadow-sm sticky top-0 z-10">
                    <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-100 rounded" title="Bold"><Bold className="w-4 h-4"/></button>
                    <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-100 rounded" title="Italic"><Italic className="w-4 h-4"/></button>
                    <button onClick={() => execCommand('underline')} className="p-2 hover:bg-slate-100 rounded" title="Underline"><Underline className="w-4 h-4"/></button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-slate-100 rounded" title="Align Left"><AlignLeft className="w-4 h-4"/></button>
                    <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-100 rounded" title="Align Center"><AlignCenter className="w-4 h-4"/></button>
                    <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-slate-100 rounded" title="Align Right"><AlignRight className="w-4 h-4"/></button>
                    <button onClick={() => execCommand('justifyFull')} className="p-2 hover:bg-slate-100 rounded" title="Justify"><AlignJustify className="w-4 h-4"/></button>
                    <div className="flex-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Draft Editor Active</span>
                 </div>
                 
                 <div className="bg-slate-50 p-12 rounded-[2.5rem] w-full flex justify-center">
                    <div 
                      ref={printRef} 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => setEditedContent(e.currentTarget.innerHTML)}
                      className="bg-white shadow-2xl p-[25mm] w-[210mm] min-h-[297mm] res-preview outline-none focus:ring-2 focus:ring-[#1b438d]/20 transition-all text-black" 
                      dangerouslySetInnerHTML={{ __html: editedContent }} 
                    />
                 </div>
              </div>
           )}
        </div>

        <div className="p-8 border-t border-slate-50 flex justify-between bg-white">
          <button onClick={handleBack} disabled={step === 0} className="px-8 py-3.5 rounded-2xl font-black text-slate-300 uppercase tracking-widest text-xs disabled:opacity-30">Previous</button>
          <div className="flex gap-4">
            {step === 5 ? (
              <button onClick={handleSave} className="px-12 py-4 bg-[#1b438d] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-transform">{loading ? 'Processing...' : 'Finalize & Store'}</button>
            ) : (
              <button 
                onClick={handleNext} 
                disabled={step === 0 && !selectedDoc}
                className="px-12 py-4 bg-[#1b438d] text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResolution;
