import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CustomField, CustomFieldType } from '../types';
import { saveUserTemplate } from '../services/storage';
import { Plus, Trash2, Save, ChevronRight, Check, LayoutTemplate, Copy, Globe, Tag } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const CreateTemplate: React.FC<Props> = ({ onComplete }) => {
  const { user, isAdmin } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Styles
  const inputClass = "w-full px-4 py-3 bg-[#F8F9FB] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-800 text-sm";
  const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

  // State
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [draftText, setDraftText] = useState('RESOLVED THAT pursuant to the provisions of Section ... of the Companies Act, 2013, consent of the Board be and is hereby accorded to ...\n\nFURTHER RESOLVED THAT ...');
  const [isSystemTemplate, setIsSystemTemplate] = useState(false);

  // Actions
  const addField = (preset?: Partial<CustomField>) => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: preset?.label || 'New Field',
      type: preset?.type || 'text',
      required: true,
      ...preset
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const insertPlaceholder = (label: string) => {
    const placeholder = `{{${label}}}`;
    setDraftText(prev => prev + ' ' + placeholder);
  };

  const handleSave = () => {
    if (!user || !templateName) return;
    setLoading(true);
    saveUserTemplate({
      userId: user.id,
      name: templateName,
      fields,
      draftText,
      isSystemTemplate: isAdmin && isSystemTemplate,
      isActive: true
    });
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 500);
  };

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6">
        <label className={labelClass}>Template Name *</label>
        <input 
          type="text" 
          value={templateName} 
          onChange={(e) => setTemplateName(e.target.value)} 
          className={inputClass} 
          placeholder="e.g. Approval for Purchase of Vehicle"
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2">This name will appear in the template list.</p>
      </div>

      {isAdmin && (
         <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center gap-3">
            <input 
               type="checkbox" 
               checked={isSystemTemplate} 
               onChange={(e) => setIsSystemTemplate(e.target.checked)}
               className="w-5 h-5 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
            />
            <div>
               <p className="text-sm font-medium text-purple-900 flex items-center gap-1"><Globe className="w-3 h-3"/> Publish as System Template</p>
               <p className="text-xs text-purple-700">If checked, this template will be visible to ALL users on the platform.</p>
            </div>
         </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-lg font-semibold text-slate-800">Define Input Fields</h3>
            <p className="text-sm text-slate-500">Choose variable data fields required for this resolution.</p>
         </div>
         <button onClick={() => addField()} className="flex items-center text-sm bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors">
            <Plus className="w-4 h-4 mr-1" /> Add Custom Field
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 space-y-4">
            {fields.map((field, idx) => (
               <div key={field.id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
                  <div className="flex-1">
                     <label className="text-xs font-semibold text-slate-500 mb-1 block">Label</label>
                     <input 
                        type="text" 
                        value={field.label} 
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full text-sm border-b border-slate-200 focus:border-brand-500 outline-none py-1 bg-transparent" 
                     />
                  </div>
                  <div className="w-32">
                     <label className="text-xs font-semibold text-slate-500 mb-1 block">Type</label>
                     <select 
                        value={field.type} 
                        onChange={(e) => updateField(field.id, { type: e.target.value as CustomFieldType })}
                        className="w-full text-sm border-b border-slate-200 focus:border-brand-500 outline-none py-1 bg-transparent"
                     >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="currency">Currency</option>
                        <option value="textarea">Long Text</option>
                     </select>
                  </div>
                  <div className="pt-6">
                     <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            ))}
            {fields.length === 0 && (
               <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm">No custom fields added yet.</p>
               </div>
            )}
         </div>

         {/* Quick Add Library */}
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Field Library</h4>
            
            <div>
               <p className="text-xs font-semibold text-slate-400 mb-2">Text Fields</p>
               <div className="flex flex-wrap gap-2">
                  {['Bank Name', 'Branch', 'Person Name', 'Designation', 'Property Address', 'Purpose'].map(label => (
                     <button key={label} onClick={() => addField({ label, type: 'text' })} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:border-brand-300 hover:text-brand-600 transition-colors">
                        + {label}
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <p className="text-xs font-semibold text-slate-400 mb-2">Dates</p>
               <div className="flex flex-wrap gap-2">
                  {['Effective Date', 'Expiry Date', 'Agreement Date', 'DoB'].map(label => (
                     <button key={label} onClick={() => addField({ label, type: 'date' })} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:border-brand-300 hover:text-brand-600 transition-colors">
                        + {label}
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <p className="text-xs font-semibold text-slate-400 mb-2">Numbers / Currency</p>
               <div className="flex flex-wrap gap-2">
                  {['Amount', 'Interest Rate', 'Share Quantity', 'Loan No'].map(label => (
                     <button key={label} onClick={() => addField({ label, type: label === 'Amount' ? 'currency' : 'number' })} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:border-brand-300 hover:text-brand-600 transition-colors">
                        + {label}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto py-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
          <div className="md:col-span-2 flex flex-col">
             <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Resolution Draft Text</label>
                <span className="text-xs text-slate-400">Standard formatting applied automatically</span>
             </div>
             <textarea 
               value={draftText}
               onChange={(e) => setDraftText(e.target.value)}
               className="flex-1 w-full p-4 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none font-serif text-sm leading-relaxed"
             />
          </div>

          <div className="flex flex-col gap-4">
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Insert Placeholders</h4>
                <p className="text-xs text-blue-600 mb-3">Click to append variables to your draft.</p>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-48">
                   {fields.map(f => (
                      <button 
                        key={f.id} 
                        onClick={() => insertPlaceholder(f.label)}
                        className="text-left text-xs bg-white px-3 py-2 rounded border border-blue-100 hover:border-blue-300 hover:text-blue-700 transition-colors flex justify-between group"
                      >
                         <span>{f.label}</span>
                         <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </button>
                   ))}
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">System Variables</h4>
                <div className="flex flex-col gap-2">
                   {['Company_Name', 'CIN', 'Chairman_Name', 'Meeting_Date', 'Meeting_Place'].map(v => (
                      <button 
                        key={v}
                        onClick={() => insertPlaceholder(v)}
                        className="text-left text-xs text-slate-600 hover:text-brand-600"
                      >
                         {`{{${v}}}`}
                      </button>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
         <div className="bg-brand-100 p-2 rounded-lg text-brand-700">
            <LayoutTemplate className="w-6 h-6" />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Resolution Template</h1>
            <p className="text-slate-500 text-sm">Design reusable templates for your specific corporate needs.</p>
         </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
         {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= i ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                  {step > i ? <Check className="w-4 h-4" /> : i}
               </div>
               <span className={`ml-2 text-sm font-medium ${step >= i ? 'text-slate-900' : 'text-slate-400'}`}>
                  {i === 1 ? 'Name Template' : i === 2 ? 'Define Fields' : 'Draft Content'}
               </span>
               {i < 3 && <div className="w-16 h-px bg-slate-200 mx-4" />}
            </div>
         ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
         <div className="flex-1 p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
         </div>

         <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
            {step > 1 ? (
               <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                  Back
               </button>
            ) : <div />}
            
            {step < 3 ? (
               <button 
                  onClick={() => setStep(s => s + 1)} 
                  disabled={step === 1 && !templateName}
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center disabled:opacity-50"
               >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
               </button>
            ) : (
               <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center shadow-md"
               >
                  {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Template</>}
               </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default CreateTemplate;