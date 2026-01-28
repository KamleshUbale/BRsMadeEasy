import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompanyDetails, MeetingType, ResolutionType, CustomField, PersonalizedResolutionItem, CustomFieldType } from '../types';
import { saveResolution } from '../services/storage';
import { ChevronRight, ChevronLeft, Check, Download, Save, Plus, Trash2, GripVertical, Copy, Layers } from 'lucide-react';
import jsPDF from 'jspdf';

interface Props {
  onComplete: () => void;
}

const PersonalizedResolution: React.FC<Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Styles
  const inputClass = "w-full px-4 py-3 bg-[#F8F9FB] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-800 text-sm";
  const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";
  const sectionTitleClass = "text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2";

  // Data State
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

  // Builder State
  const [resolutions, setResolutions] = useState<PersonalizedResolutionItem[]>([]);
  const [editingRes, setEditingRes] = useState<PersonalizedResolutionItem | null>(null);

  // Handlers
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setCompanyDetails({ ...companyDetails, [e.target.name]: value });
  };

  // --- Step 2: Builder Logic ---

  const addNewResolution = () => {
    const newRes: PersonalizedResolutionItem = {
      id: crypto.randomUUID(),
      title: `New Resolution ${resolutions.length + 1}`,
      draftText: 'RESOLVED THAT ...',
      fields: []
    };
    setResolutions([...resolutions, newRes]);
    setEditingRes(newRes);
  };

  const updateEditingRes = (updates: Partial<PersonalizedResolutionItem>) => {
    if (!editingRes) return;
    setEditingRes({ ...editingRes, ...updates });
  };

  const saveEditingRes = () => {
    if (!editingRes) return;
    setResolutions(resolutions.map(r => r.id === editingRes.id ? editingRes : r));
    setEditingRes(null);
  };

  const deleteResolution = (id: string) => {
    setResolutions(resolutions.filter(r => r.id !== id));
    if (editingRes?.id === id) setEditingRes(null);
  };

  const addFieldToRes = () => {
    if (!editingRes) return;
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: 'New Field',
      type: 'text',
      required: true,
      value: ''
    };
    updateEditingRes({ fields: [...editingRes.fields, newField] });
  };

  const updateField = (fieldId: string, updates: Partial<CustomField>) => {
    if (!editingRes) return;
    const updatedFields = editingRes.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    updateEditingRes({ fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    if (!editingRes) return;
    updateEditingRes({ fields: editingRes.fields.filter(f => f.id !== fieldId) });
  };

  // --- Step 3: Filler Logic ---

  const handleFieldValueChange = (resId: string, fieldId: string, value: string) => {
    setResolutions(resolutions.map(res => {
      if (res.id !== resId) return res;
      return {
        ...res,
        fields: res.fields.map(f => f.id === fieldId ? { ...f, value } : f)
      };
    }));
  };

  // --- Step 4: Generation Logic ---

  const generateFinalHTML = () => {
    const { companyName, address, cin, meetingDate, meetingType, chairmanName, companyEmail } = companyDetails;
    
    // Formatting Date
    const dateObj = new Date(meetingDate);
    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // Generate resolution blocks
    const resolutionsHTML = resolutions.map((res, index) => {
      let content = res.draftText;
      // Replace placeholders
      res.fields.forEach(f => {
         const regex = new RegExp(`{{${f.label}}}`, 'g'); // Simple replacement, in prod use safer regex
         content = content.replace(regex, `<strong>${f.value || `[${f.label}]`}</strong>`);
      });

      return `
        <div style="margin-bottom: 30px;">
           ${resolutions.length > 1 ? `<div style="text-decoration: underline; font-weight: bold; margin-bottom: 10px;">ITEM NO. ${index + 1}: ${res.title.toUpperCase()}</div>` : ''}
          <div style="text-align: justify; line-height: 1.5; font-size: 12pt;">
             ${content.split('\n').map(p => `<p style="margin-bottom: 10px;">${p}</p>`).join('')}
          </div>
        </div>
      `;
    }).join('<br/>');

     // Standard Authorization Clauses
    const standardClauses = `
      <p style="text-align: justify; margin-bottom: 15px;">
        "<strong>RESOLVED FURTHER THAT</strong> ${chairmanName} (DIN: ${companyDetails.chairmanDin || '________'}), Director of the Company, be and is hereby authorized to sign, execute, submit and file all necessary documents, applications, returns and e-forms with the Registrar of Companies, Ministry of Corporate Affairs and to do all such acts, deeds and things as may be necessary to give effect to this resolution."
      </p>
      <p style="text-align: justify; margin-bottom: 15px;">
        "<strong>RESOLVED FURTHER THAT</strong> a certified true copy of this resolution be provided to such authorities or persons as may be required."
      </p>
    `;

    const containerStyle = `
      font-family: 'Times New Roman', serif; 
      padding: 40px; 
      line-height: 1.5; 
      color: #000;
      font-size: 12pt;
    `;

    return `
      <div style="${containerStyle}">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #000; padding-bottom: 15px;">
          <h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px;">${companyName}</h1>
          <p style="font-size: 10pt; margin: 5px 0;"><strong>Regd. Office:</strong> ${address}</p>
          <p style="font-size: 10pt; margin: 0;"><strong>CIN:</strong> ${cin} | <strong>Email:</strong> ${companyEmail}</p>
        </div>
        
        <div style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 30px; line-height: 1.5;">
          CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING<br/>
          OF THE BOARD OF DIRECTORS OF<br/>
          ${companyName.toUpperCase()}<br/>
          HELD ON ${dayName.toUpperCase()}, ${formattedDate.toUpperCase()} AT ${companyDetails.meetingTime}<br/>
          AT ${companyDetails.meetingPlace.toUpperCase()}
        </div>

        <br/>
        
        <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">BOARD RESOLUTION</div>
        
        <div style="text-align: justify; margin: 30px 0;">
          ${resolutionsHTML}
          ${standardClauses}
        </div>

        <br/>

        <div style="margin-top: 40px;">
          <p style="font-weight: bold;">CERTIFIED TRUE COPY</p>
          <p style="margin-top: 10px; font-weight: bold;">For ${companyName}</p>
          
          <div style="margin-top: 60px;">
             <p>__________________________</p>
             <p style="margin-top: 5px;">Name: <strong>${chairmanName || '____________________'}</strong></p>
             <p style="margin-top: 5px;">Designation: <strong>Director</strong></p>
             <p style="margin-top: 5px;">DIN / Membership No.: <strong>${companyDetails.chairmanDin || '__________'}</strong></p>
             <p style="margin-top: 5px;">Date: __________________</p>
             <p style="margin-top: 5px;">Place: __________________</p>
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
      type: ResolutionType.PERSONALIZED,
      personalizedData: resolutions,
      finalContent: content
    });

    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 800);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const content = printRef.current;
    
    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save(`${companyDetails.companyName}_CTC.pdf`);
        },
        x: 40,
        y: 40,
        width: 500,
        windowWidth: 650
      });
    }
  };

  // --- Render Steps ---

  const renderStep1 = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
         <h3 className={sectionTitleClass}>Company Details</h3>
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
    </div>
  );

  const renderStep2Builder = () => (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
       {/* Left: List */}
       <div className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-lg">
             <h3 className="font-semibold text-slate-700">Resolutions</h3>
             <button onClick={addNewResolution} className="text-sm bg-brand-600 text-white px-2 py-1 rounded hover:bg-brand-700 flex items-center">
               <Plus className="w-4 h-4 mr-1"/> Add
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {resolutions.map((res, idx) => (
                <div 
                  key={res.id} 
                  onClick={() => setEditingRes(res)}
                  className={`p-3 rounded-md cursor-pointer border flex justify-between items-center ${
                    editingRes?.id === res.id ? 'bg-white border-brand-500 shadow-sm ring-1 ring-brand-500' : 'bg-white border-slate-200 hover:border-brand-300'
                  }`}
                >
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx+1}</span>
                      <span className="text-sm font-medium text-slate-800 truncate max-w-[150px]">{res.title}</span>
                   </div>
                   <button onClick={(e) => {e.stopPropagation(); deleteResolution(res.id);}} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             ))}
             {resolutions.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                   Click "Add" to start creating resolutions.
                </div>
             )}
          </div>
       </div>

       {/* Right: Editor */}
       <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-lg flex flex-col">
          {editingRes ? (
            <div className="flex flex-col h-full">
               <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Edit Resolution</span>
                  <button onClick={saveEditingRes} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">Save Changes</button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {/* Title */}
                  <div>
                     <label className={labelClass}>Resolution Title</label>
                     <input type="text" value={editingRes.title} onChange={(e) => updateEditingRes({title: e.target.value})} className={inputClass} />
                  </div>

                  {/* Field Builder */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-slate-700">Custom Input Fields</label>
                        <button onClick={addFieldToRes} className="text-xs text-brand-600 hover:underline flex items-center"><Plus className="w-3 h-3 mr-1"/> Add Field</button>
                     </div>
                     
                     <div className="space-y-3">
                        {editingRes.fields.map(field => (
                           <div key={field.id} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-200">
                              <input 
                                type="text" 
                                value={field.label} 
                                onChange={(e) => updateField(field.id, {label: e.target.value})}
                                className="flex-1 text-sm border-none focus:ring-0 p-1 bg-transparent font-medium" 
                                placeholder="Field Label"
                              />
                              <select 
                                value={field.type} 
                                onChange={(e) => updateField(field.id, {type: e.target.value as CustomFieldType})}
                                className="text-xs border rounded p-1"
                              >
                                 <option value="text">Text</option>
                                 <option value="number">Number</option>
                                 <option value="date">Date</option>
                                 <option value="currency">Currency</option>
                              </select>
                              <button 
                                onClick={() => navigator.clipboard.writeText(`{{${field.label}}}`)}
                                className="text-slate-400 hover:text-brand-600" title="Copy Placeholder"
                              >
                                 <Copy className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteField(field.id)} className="text-slate-400 hover:text-red-500">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                        {editingRes.fields.length === 0 && <p className="text-xs text-slate-400 italic">No custom fields defined.</p>}
                     </div>
                  </div>

                  {/* Draft Editor */}
                  <div>
                     <label className={labelClass}>Resolution Draft Text</label>
                     <p className="text-xs text-slate-500 mb-2">Use <strong>{`{{Label}}`}</strong> to insert dynamic fields defined above.</p>
                     <textarea 
                        value={editingRes.draftText} 
                        onChange={(e) => updateEditingRes({draftText: e.target.value})} 
                        className={inputClass + " font-mono text-sm h-64"}
                     />
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
               Select a resolution to edit or add a new one.
            </div>
          )}
       </div>
    </div>
  );

  const renderStep3Filler = () => (
     <div className="space-y-8">
        {resolutions.map((res, idx) => (
           <div key={res.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center">
                 <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mr-3">Item #{idx+1}</span>
                 {res.title}
              </h3>
              
              {res.fields.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {res.fields.map(field => (
                       <div key={field.id}>
                          <label className={labelClass}>{field.label} {field.required && '*'}</label>
                          <input 
                             type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                             value={field.value}
                             onChange={(e) => handleFieldValueChange(res.id, field.id, e.target.value)}
                             className={inputClass}
                             placeholder={field.type === 'currency' ? '0.00' : ''}
                          />
                       </div>
                    ))}
                 </div>
              ) : (
                 <p className="text-sm text-slate-400 italic">No custom fields to fill for this resolution.</p>
              )}

              <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 font-mono whitespace-pre-wrap border border-slate-200">
                 {/* Live Preview of text snippet */}
                 <strong>Preview Snippet: </strong>
                 {res.draftText.length > 100 ? res.draftText.substring(0, 100) + '...' : res.draftText}
              </div>
           </div>
        ))}
        {resolutions.length === 0 && (
           <div className="text-center text-slate-500 py-10">
              No resolutions defined. Please go back to the builder step.
           </div>
        )}
     </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {[
           {id: 1, label: 'Meeting'}, 
           {id: 2, label: 'Builder'}, 
           {id: 3, label: 'Data Input'}, 
           {id: 4, label: 'Preview'}
        ].map((s) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all ${
               step >= s.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400'
            }`}>
               {step > s.id ? <Check className="w-4 h-4"/> : s.id}
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= s.id ? 'text-indigo-800' : 'text-slate-400'}`}>{s.label}</span>
            {s.id < 4 && <div className="w-12 h-px bg-slate-200 mx-4" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
         <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h2 className="text-xl font-bold text-slate-800">
                {step === 1 && 'Step 1: Board Meeting Details'}
                {step === 2 && 'Step 2: Resolution Builder'}
                {step === 3 && 'Step 3: Fill Resolution Data'}
                {step === 4 && 'Step 4: Final Preview'}
             </h2>
         </div>

         <div className="p-8 flex-1">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2Builder()}
            {step === 3 && renderStep3Filler()}
            {step === 4 && (
               <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 overflow-auto max-h-[600px] flex justify-center">
                  <div 
                     ref={printRef}
                     className="bg-white shadow-lg p-[10mm] text-black w-[210mm] min-h-[297mm]"
                     dangerouslySetInnerHTML={{ __html: generateFinalHTML() }} 
                  />
               </div>
            )}
         </div>

         {/* Navigation Footer */}
         <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50">
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
                     <button onClick={handleDownloadPDF} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center shadow-md">
                        <Download className="w-5 h-5 mr-2" /> Download PDF
                     </button>
                     <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-md">
                        {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save to Cloud</>}
                     </button>
                  </>
               ) : (
                  <button 
                     onClick={() => setStep(s => Math.min(4, s + 1))}
                     disabled={step === 1 && !companyDetails.companyName}
                     className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-md disabled:opacity-50"
                  >
                     {step === 2 && resolutions.length === 0 ? 'Define Resolutions First' : 'Next'} 
                     <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PersonalizedResolution;