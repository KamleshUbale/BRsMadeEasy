import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompanyDetails, MeetingType, ResolutionType, UserTemplate, ResolutionItemData, HeaderFooterConfig, ClientProfile } from '../types';
import { saveResolution, getUserTemplates, getClientProfiles } from '../services/storage';
import { ChevronRight, ChevronLeft, Check, Download, Save, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface CreateResolutionProps {
  onComplete: () => void;
}

const CreateResolution: React.FC<CreateResolutionProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Data Loading
  const [allTemplates, setAllTemplates] = useState<UserTemplate[]>([]);
  const [existingClients, setExistingClients] = useState<ClientProfile[]>([]);

  useEffect(() => {
    if (user) {
      setAllTemplates(getUserTemplates(user.id));
      setExistingClients(getClientProfiles());
    }
  }, [user]);

  // Corporate UI Styles
  const inputClass = "w-full px-4 py-3 bg-[#F8F9FB] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-800 text-sm";
  const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";
  const sectionTitleClass = "text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2";

  // --- Step 1: Company Details State ---
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

  // --- Step 2 & 3: Multi-Resolution State ---
  const [resolutionItems, setResolutionItems] = useState<ResolutionItemData[]>([]);
  
  // --- Step 4: Header/Footer State ---
  const [headerFooter, setHeaderFooter] = useState<HeaderFooterConfig>({
    showHeader: true,
    headerTitle: '',
    headerSubtitle: '',
    signatoryName: '',
    signatoryDesignation: 'Director',
    signatoryDin: ''
  });

  // Handlers
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setCompanyDetails({ ...companyDetails, [e.target.name]: value });
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = existingClients.find(c => c.id === clientId);
    if (client) {
      setCompanyDetails(prev => ({
        ...prev,
        cin: client.cin,
        companyName: client.companyName,
        address: client.address,
        companyEmail: client.companyEmail
      }));
      // Auto-set header info
      setHeaderFooter(prev => ({...prev, headerTitle: client.companyName, headerSubtitle: client.address}));
    }
  };

  const addResolutionItem = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newItem: ResolutionItemData = {
      id: crypto.randomUUID(),
      type: ResolutionType.CUSTOM,
      templateId: template.id,
      templateName: template.name,
      draftText: template.draftText,
      customValues: {}
    };
    setResolutionItems([...resolutionItems, newItem]);
  };

  const removeResolutionItem = (id: string) => {
    setResolutionItems(resolutionItems.filter(i => i.id !== id));
  };

  const handleItemValueChange = (itemId: string, fieldKey: string, value: string) => {
    setResolutionItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        customValues: { ...item.customValues, [fieldKey]: value }
      };
    }));
  };

  const handleHeaderFooterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setHeaderFooter({ ...headerFooter, [e.target.name]: value });
  };

  // --- HTML Generation ---
  const generateFinalHTML = () => {
    const { companyName, address, cin, meetingDate, meetingType, chairmanName, chairmanDin, meetingPlace, companyEmail } = companyDetails;
    const { showHeader, headerTitle, headerSubtitle, signatoryName, signatoryDesignation, signatoryDin } = headerFooter;

    // Formatting Date
    const dateObj = new Date(meetingDate);
    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // Formatting Place - if "Registered Office" use the full address
    const finalMeetingPlace = meetingPlace.toLowerCase().includes('registered office') 
      ? address.toUpperCase() 
      : meetingPlace.toUpperCase();

    // Consolidate Footer Data
    const finalSignatoryName = signatoryName || chairmanName;
    const finalSignatoryDesignation = signatoryDesignation || 'Director';
    const finalSignatoryDin = signatoryDin || chairmanDin;
    const finalDate = formattedDate;
    const finalPlace = meetingPlace;

    // Generate Items HTML
    const itemsHTML = resolutionItems.map((item, index) => {
      const template = allTemplates.find(t => t.id === item.templateId);
      if (!template) return '';

      let draft = item.draftText;
      
      // Replace Custom Fields
      template.fields.forEach(f => {
        const val = item.customValues[f.label] || `[${f.label}]`;
        const regex = new RegExp(`{{${f.label}}}`, 'g');
        draft = draft.replace(regex, `<strong>${val}</strong>`);
      });

      // Replace System Variables
      const systemVars: Record<string, string> = {
        'Company_Name': companyName,
        'CIN': cin,
        'Chairman_Name': finalSignatoryName,
        'Meeting_Date': formattedDate,
        'Meeting_Place': meetingPlace
      };

      Object.entries(systemVars).forEach(([key, val]) => {
         const regex = new RegExp(`{{${key}}}`, 'g');
         draft = draft.replace(regex, `<strong>${val}</strong>`);
      });

      return `
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
           ${resolutionItems.length > 1 ? `<div style="text-decoration: underline; font-weight: bold; margin-bottom: 10px; text-align: justify;">ITEM NO. ${index + 1}: ${item.templateName.toUpperCase()}</div>` : ''}
           ${draft.split('\n').map(p => p.trim() ? `<p class="mb-4" style="text-align: justify; text-justify: inter-word; margin-bottom: 10px;">${p}</p>` : '').join('')}
        </div>
      `;
    }).join('');

    // Standard Authorization Clauses
    const standardClauses = `
      <div style="page-break-inside: avoid;">
        <p style="text-align: justify; text-justify: inter-word; margin-bottom: 15px;">
          "<strong>RESOLVED FURTHER THAT</strong> ${finalSignatoryName} (DIN: ${finalSignatoryDin || '________'}), ${finalSignatoryDesignation} of the Company, be and is hereby authorized to sign, execute, submit and file all necessary documents, applications, returns and e-forms with the Registrar of Companies, Ministry of Corporate Affairs and to do all such acts, deeds and things as may be necessary to give effect to this resolution."
        </p>
        <p style="text-align: justify; text-justify: inter-word; margin-bottom: 15px;">
          "<strong>RESOLVED FURTHER THAT</strong> a certified true copy of this resolution be provided to such authorities or persons as may be required."
        </p>
      </div>
    `;

    // Updated container style for reduced font size and line spacing
    const containerStyle = `
      font-family: 'Times New Roman', serif; 
      line-height: 1.25; 
      color: #000;
      font-size: 11pt;
    `;

    const letterhead = showHeader ? `
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #000; padding-bottom: 15px;">
          <h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px;">${headerTitle || companyName}</h1>
          <p style="font-size: 10pt; margin: 5px 0;">${headerSubtitle || address}</p>
          <p style="font-size: 10pt; margin: 0;"><strong>CIN:</strong> ${cin} | <strong>Email:</strong> ${companyEmail}</p>
      </div>
    ` : '';

    return `
      <div style="${containerStyle}">
        ${letterhead}
        
        <div style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 30px; line-height: 1.35;">
          CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${companyName.toUpperCase()} HELD ON ${dayName.toUpperCase()}, ${formattedDate.toUpperCase()} AT ${companyDetails.meetingTime} AT ${finalMeetingPlace}
        </div>

        <br/>
        
        <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">BOARD RESOLUTION</div>
        
        <div style="text-align: justify; text-justify: inter-word;">
           ${itemsHTML || '<p>No resolutions added.</p>'}
           ${standardClauses}
        </div>

        <br/>

        <div style="margin-top: 40px; text-align: left; page-break-inside: avoid;">
          <p style="font-weight: bold;">CERTIFIED TRUE COPY</p>
          <p style="margin-top: 5px; font-weight: bold;">For ${companyName}</p>
          
          <div style="margin-top: 50px;">
             <p>__________________________</p>
             <p style="margin-top: 5px;">Name: <strong>${finalSignatoryName}</strong></p>
             <p style="margin-top: 5px;">Designation: <strong>${finalSignatoryDesignation}</strong></p>
             <p style="margin-top: 5px;">DIN / Membership No.: <strong>${finalSignatoryDin || '__________'}</strong></p>
             <p style="margin-top: 5px;">Date: <strong>${finalDate}</strong></p>
             <p style="margin-top: 5px;">Place: <strong>${finalPlace}</strong></p>
          </div>
        </div>
      </div>
    `;
  };

  const handleSave = () => {
    if (!user) return;
    setLoading(true);
    
    const content = generateFinalHTML();

    saveResolution({
      userId: user.id,
      companyDetails,
      type: ResolutionType.CUSTOM,
      items: resolutionItems,
      headerFooter,
      finalContent: content
    });

    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 800);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });
    
    const content = printRef.current;
    
    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save(`${companyDetails.companyName}_CTC.pdf`);
        },
        x: 0,
        y: 0,
        width: 595.28,
        windowWidth: 794,
        autoPaging: 'text' // Ensure text splits to new pages automatically
      });
    }
  };

  // --- Render Steps ---
  
  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 flex justify-between items-center mb-2">
         <h3 className={sectionTitleClass + " mb-0 border-none"}>Company Details</h3>
         <select onChange={handleClientSelect} className="text-sm bg-white border border-brand-300 text-brand-700 px-3 py-1.5 rounded-lg focus:outline-none">
            <option value="">Select Existing Client...</option>
            {existingClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
         </select>
      </div>
      <div>
        <label className={labelClass}>Company Name *</label>
        <input required type="text" name="companyName" value={companyDetails.companyName} onChange={handleCompanyChange} className={inputClass} placeholder="e.g. Acme Corp Private Limited" />
      </div>
      <div>
        <label className={labelClass}>Corporate Identity Number (CIN) *</label>
        <input required type="text" name="cin" value={companyDetails.cin} onChange={handleCompanyChange} className={inputClass} placeholder="L12345MH..." />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Registered Office Address *</label>
        <textarea required name="address" value={companyDetails.address} onChange={handleCompanyChange} className={inputClass} rows={2} placeholder="Full registered address" />
      </div>
      <div>
        <label className={labelClass}>Company Email ID *</label>
        <input required type="email" name="companyEmail" value={companyDetails.companyEmail} onChange={handleCompanyChange} className={inputClass} placeholder="info@acmecorp.com" />
      </div>
      <div>
         <label className={labelClass}>Financial Year *</label>
        <input required type="text" name="financialYear" value={companyDetails.financialYear} onChange={handleCompanyChange} className={inputClass} />
      </div>

      <div className="md:col-span-2 mt-4">
         <h3 className={sectionTitleClass}>Meeting Details</h3>
      </div>
      <div>
        <label className={labelClass}>Date of Meeting *</label>
        <input required type="date" name="meetingDate" value={companyDetails.meetingDate} onChange={handleCompanyChange} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Time of Meeting *</label>
        <input required type="time" name="meetingTime" value={companyDetails.meetingTime} onChange={handleCompanyChange} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Place of Meeting *</label>
        <input required type="text" name="meetingPlace" value={companyDetails.meetingPlace} onChange={handleCompanyChange} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Meeting Type</label>
        <select name="meetingType" value={companyDetails.meetingType} onChange={handleCompanyChange} className={inputClass}>
          {Object.values(MeetingType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="md:col-span-2 mt-4">
         <h3 className={sectionTitleClass}>Attendees</h3>
      </div>
      <div>
        <label className={labelClass}>Chairman Name *</label>
        <input required type="text" name="chairmanName" value={companyDetails.chairmanName} onChange={handleCompanyChange} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Chairman DIN *</label>
        <input required type="text" name="chairmanDin" value={companyDetails.chairmanDin} onChange={handleCompanyChange} className={inputClass} />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Names of Directors Present (comma separated) *</label>
        <input required type="text" name="directorsPresent" value={companyDetails.directorsPresent} onChange={handleCompanyChange} className={inputClass} placeholder="Mr. A, Ms. B" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 mb-8 text-center">
        <h3 className="text-xl font-bold text-brand-800 mb-2">Select Resolution</h3>
        
        <div className="flex gap-2 justify-center">
           <select 
             className="px-4 py-2 border border-brand-300 rounded-lg w-full max-w-md focus:outline-none"
             onChange={(e) => {
               if(e.target.value) {
                 addResolutionItem(e.target.value);
                 e.target.value = '';
               }
             }}
           >
              <option value="">+ Add a Resolution...</option>
              <optgroup label="System Templates">
                 {allTemplates.filter(t => t.isSystemTemplate).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
              <optgroup label="My Templates">
                 {allTemplates.filter(t => !t.isSystemTemplate).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
           </select>
        </div>
      </div>

      <div className="space-y-4">
         {resolutionItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
               No resolutions selected.
            </div>
         ) : (
            resolutionItems.map((item, idx) => (
               <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center animate-fadeIn">
                  <div className="flex items-center gap-3">
                     <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Item #{idx+1}</span>
                     <span className="font-semibold text-slate-800">{item.templateName}</span>
                  </div>
                  <button onClick={() => removeResolutionItem(item.id)} className="text-red-400 hover:text-red-600">
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            ))
         )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
       {resolutionItems.length === 0 && <div className="text-center text-red-500">Please go back and add at least one resolution.</div>}
       
       {resolutionItems.map((item, index) => {
          const template = allTemplates.find(t => t.id === item.templateId);
          if (!template || template.fields.length === 0) return null;

          return (
             <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                   <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold">Item #{index+1}</span>
                   <h3 className="font-bold text-lg text-slate-800">{item.templateName}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {template.fields.map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                         <label className={labelClass}>{field.label} {field.required && '*'}</label>
                         {field.type === 'textarea' ? (
                            <textarea 
                               className={inputClass} 
                               rows={3}
                               value={item.customValues[field.label] || ''}
                               onChange={(e) => handleItemValueChange(item.id, field.label, e.target.value)}
                            />
                         ) : (
                            <input 
                               type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                               className={inputClass}
                               value={item.customValues[field.label] || ''}
                               onChange={(e) => handleItemValueChange(item.id, field.label, e.target.value)}
                            />
                         )}
                      </div>
                   ))}
                </div>
             </div>
          )
       })}
       
       {/* Global Signatory Override */}
       <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className={sectionTitleClass}>Signatory & Footer Details</h3>
          <p className="text-xs text-slate-500 mb-4">The details below will be used for the "Certified True Copy" signature block.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                <label className={labelClass}>Signatory Name</label>
                <input 
                   type="text" 
                   name="signatoryName" 
                   value={headerFooter.signatoryName} 
                   onChange={handleHeaderFooterChange} 
                   className={inputClass} 
                   placeholder={companyDetails.chairmanName || 'Defaults to Chairman'}
                />
             </div>
             <div>
                <label className={labelClass}>Designation</label>
                <input 
                   type="text" 
                   name="signatoryDesignation" 
                   value={headerFooter.signatoryDesignation} 
                   onChange={handleHeaderFooterChange} 
                   className={inputClass} 
                   placeholder="Defaults to Director"
                />
             </div>
             <div>
                <label className={labelClass}>DIN (Optional)</label>
                <input 
                   type="text" 
                   name="signatoryDin" 
                   value={headerFooter.signatoryDin} 
                   onChange={handleHeaderFooterChange} 
                   className={inputClass} 
                   placeholder={companyDetails.chairmanDin || 'Defaults to Chairman DIN'}
                />
             </div>
          </div>
       </div>
    </div>
  );

  const renderStep4 = () => (
     <div className="flex justify-center h-full bg-slate-200 p-8 overflow-auto">
        {/* Live Preview (A4 Scale) */}
        {/* 210mm width, 297mm height, 25.4mm (1in) padding */}
        <div 
           ref={printRef}
           className="bg-white shadow-2xl p-[25.4mm] text-black w-[210mm] min-h-[297mm] box-border mx-auto"
           dangerouslySetInnerHTML={{ __html: generateFinalHTML() }} 
        />
     </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-8 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
              step >= i 
                ? 'bg-brand-600 border-brand-600 text-white' 
                : 'bg-white border-slate-300 text-slate-400'
            }`}>
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 4 && (
              <div className={`w-12 h-0.5 mx-2 transition-colors ${step > i ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 1 && 'Step 1: Company Profile'}
            {step === 2 && 'Step 2: Add Resolutions'}
            {step === 3 && 'Step 3: Fill Details'}
            {step === 4 && 'Step 4: Finalize & Print'}
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 bg-slate-50">
           {/* Wrapper div to give some padding on steps 1-3 */}
           {step !== 4 ? (
             <div className="p-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
             </div>
           ) : renderStep4()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50 shrink-0">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </button>

          <div className="flex space-x-4">
             {step === 4 ? (
               <>
                <button 
                  onClick={handleDownloadPDF}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center shadow-md"
                >
                  <Download className="w-5 h-5 mr-2" /> Download PDF
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center shadow-md"
                >
                  {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save & Exit</>}
                </button>
               </>
             ) : (
                <button 
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={(step === 1 && !companyDetails.companyName) || (step === 2 && resolutionItems.length === 0)}
                  className="px-8 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center shadow-md disabled:opacity-50"
                >
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResolution;