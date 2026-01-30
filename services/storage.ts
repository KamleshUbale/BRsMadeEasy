
import { ResolutionData, UserType, UserTemplate, ClientProfile, CompanyDetails, User, UserRole, DocCategory, DirectorInfo } from '../types';

const RESOLUTIONS_KEY = 'patron_workspace_resolutions';
const TEMPLATES_KEY = 'patron_workspace_templates';
const CLIENTS_KEY = 'patron_workspace_clients';
const WORKSPACE_MODE_KEY = 'patron_workspace_mode';
const USERS_KEY = 'patron_workspace_users';

export const GLOBAL_USER_ID = 'default-workspace-user';

const PRE_SEEDED_TEMPLATES: Partial<UserTemplate>[] = [
  {
    name: 'Standard Resignation Letter',
    category: 'RESIGNATION' as DocCategory,
    isSystemTemplate: true,
    isActive: true,
    fields: [
      { id: 'f1', label: 'Resignation Date', type: 'date', required: true },
      { id: 'f2', label: 'Resigning Director Name', type: 'text', required: true },
      { id: 'f3', label: 'Resigning Director DIN', type: 'text', required: true },
    ],
    draftText: `<div style="text-align: right; margin-bottom: 20px;">Date: {{Resignation Date}}</div>
<div style="text-align: left; margin-bottom: 20px;">
To,<br/>
The Board of Directors,<br/>
<strong>{{Company_Name}}</strong><br/>
{{Company_Address}}
</div>

<p style="font-weight: bold; margin-bottom: 20px;">Subject: Resignation from the position of Director.</p>

<p>Dear Sir(s),</p>

<p style="text-align: justify; margin-bottom: 15px;">
I Mr./Mrs. <strong>{{Resigning Director Name}}</strong> (DIN: <strong>{{Resigning Director DIN}}</strong>), Director of the company, would like to inform the board that due to some personal and unavoidable circumstances, I hereby tender my resignation from the Directorship of the Company with immediate effect. Kindly accept this letter as my resignation with immediate effect and relieve me of my duties.
</p>

<p style="text-align: justify; margin-bottom: 25px;">
Kindly acknowledge the receipt of this resignation letter and arrange to submit the necessary forms with the office of the Registrar of Companies, to that effect.
</p>

<div style="margin-top: 40px;">
  <p style="font-weight: bold;">{{Resigning Director Name}}</p>
  <p>(DIN: {{Resigning Director DIN}})</p>
  <p>Director</p>
</div>`
  },
  {
    name: 'Standard NOC Template',
    category: 'INCORPORATION' as DocCategory,
    isSystemTemplate: true,
    isActive: true,
    fields: [
      { id: 'n1', label: 'Property Owner Name', type: 'text', required: true },
      { id: 'n2', label: 'Property Address', type: 'textarea', required: true },
      { id: 'n3', label: 'Signing Date', type: 'date', required: true },
      { id: 'n4', label: 'Signing Place', type: 'text', required: true },
    ],
    draftText: `<div style="text-align: center; margin-bottom: 40px;">
  <h2 style="text-decoration: underline; font-weight: bold; font-size: 16pt; margin: 0;">NO OBJECTION CERTIFICATE</h2>
  <p style="font-weight: bold; margin-top: 10px;">TO WHOMSOEVER IT MAY CONCERN</p>
</div>

<p style="text-align: justify; line-height: 2; font-size: 12pt;">
  I <strong>{{Property Owner Name}}</strong>, the owner of the premises situated at <strong>{{Property Address}}</strong>. I agree to give the said premises to <strong>{{Company_Name}}</strong> and have no objection in using the said premises as the registered office of the proposed company.
</p>

<div style="margin-top: 60px; line-height: 1.8;">
  <p>Date: <strong>{{Signing Date}}</strong></p>
  <p>Name: <strong>{{Property Owner Name}}</strong></p>
  <p>Place: <strong>{{Signing Place}}</strong></p>
  <br/><br/>
  <p>Signature: __________________________</p>
</div>`
  },
  {
    name: 'Form DIR-2 Consent',
    category: 'DIR2' as DocCategory,
    isSystemTemplate: true,
    isActive: true,
    fields: [
      { id: 'd1', label: 'Full Name', type: 'text', required: true },
      { id: 'd2', label: 'DIN', type: 'text', required: true },
      { id: 'd3', label: 'Father Name', type: 'text', required: true },
      { id: 'd4', label: 'Residential Address', type: 'textarea', required: true },
      { id: 'd5', label: 'Email ID', type: 'text', required: true },
      { id: 'd6', label: 'Mobile No', type: 'text', required: true },
      { id: 'd7', label: 'PAN', type: 'text', required: true },
      { id: 'd8', label: 'Occupation', type: 'text', required: true },
      { id: 'd9', label: 'DOB', type: 'date', required: true },
      { id: 'd10', label: 'Nationality', type: 'text', required: true },
      { id: 'd11', label: 'Other Directorships Details', type: 'textarea', required: false },
      { id: 'd12', label: 'Professional Membership No', type: 'text', required: false },
    ],
    draftText: `<div style="text-align: center; margin-bottom: 30px;">
  <h2 style="font-weight: bold; font-size: 14pt; margin: 0;">Form DIR-2</h2>
  <p style="font-weight: bold; margin: 5px 0;">Consent to act as a director of a company</p>
  <p style="font-size: 9pt;">[Pursuant to section 152(5) and rule 8 of Companies (Appointment and Qualification of Directors) Rules, 2014]</p>
</div>

<div style="margin-bottom: 20px;">
  To,<br/>
  <strong>{{Company_Name}}</strong><br/>
  {{Company_Address}}
</div>

<p style="font-weight: bold; margin-bottom: 15px;">Subject: Consent to act as director.</p>

<p style="text-align: justify; margin-bottom: 20px;">
  I, <strong>{{Full Name}}</strong>, pursuant to sub-section (5) of section 152 of the Companies Act, 2013 and certify that I am not disqualified to become a director under the Companies Act, 2013.
</p>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt;">
  <tr><td style="width: 5%; vertical-align: top;">1.</td><td style="width: 45%; vertical-align: top;">Director Identification Number (DIN):</td><td style="font-weight: bold;">{{DIN}}</td></tr>
  <tr><td style="vertical-align: top;">2.</td><td style="vertical-align: top;">Name (in full):</td><td style="font-weight: bold;">{{Full Name}}</td></tr>
  <tr><td style="vertical-align: top;">3.</td><td style="vertical-align: top;">Father’s Name (in full):</td><td style="font-weight: bold;">{{Father Name}}</td></tr>
  <tr><td style="vertical-align: top;">4.</td><td style="vertical-align: top;">Address:</td><td style="font-weight: bold;">{{Residential Address}}</td></tr>
  <tr><td style="vertical-align: top;">5.</td><td style="vertical-align: top;">E-mail id:</td><td style="font-weight: bold;">{{Email ID}}</td></tr>
  <tr><td style="vertical-align: top;">6.</td><td style="vertical-align: top;">Mobile no.:</td><td style="font-weight: bold;">{{Email ID}}</td></tr>
  <tr><td style="vertical-align: top;">7.</td><td style="vertical-align: top;">Income-tax PAN:</td><td style="font-weight: bold;">{{PAN}}</td></tr>
  <tr><td style="vertical-align: top;">8.</td><td style="vertical-align: top;">Occupation:</td><td style="font-weight: bold;">{{Occupation}}</td></tr>
  <tr><td style="vertical-align: top;">9.</td><td style="vertical-align: top;">Date of birth:</td><td style="font-weight: bold;">{{DOB}}</td></tr>
  <tr><td style="vertical-align: top;">10.</td><td style="vertical-align: top;">Nationality:</td><td style="font-weight: bold;">{{Nationality}}</td></tr>
  <tr><td style="vertical-align: top;">11.</td><td colspan="2" style="padding-top: 10px; text-align: justify;">
    No. of companies/ LLP in which I am already a director/Designated Partner and out of such companies/LLP the names of the companies/LLP in which I am a Managing Director, Chief Executive Officer, Whole time Director, Secretary, Chief Financial Officer, and Manager:<br/>
    <strong>{{Other Directorships Details}}</strong>
  </td></tr>
  <tr><td style="vertical-align: top;">12.</td><td colspan="2" style="padding-top: 10px;">
    Particulars of membership No. and Certificate of practice No. if the applicant is a member of any professional Institute:<br/>
    <strong>{{Professional Membership No}}</strong>
  </td></tr>
</table>

<p style="font-weight: bold; margin-bottom: 10px;">Declaration</p>
<p style="text-align: justify; margin-bottom: 40px;">
  I declare that I have not been convicted of any offence in connection with the promotion, formation or management of any company or LLP and have not been found guilty of any fraud or misfeasance or of any breach of duty to any company under this Act or any previous company law in the last five years. I further declare that if appointed my total Directorship in all the companies shall not exceed the prescribed number of companies in which a person can be appointed as a Director.
</p>

<div style="margin-top: 40px;">
  <p style="font-weight: bold;">{{Full Name}}</p>
  <p>Director</p>
  <p>DIN: {{DIN}}</p>
</div>`
  },
  {
    name: 'Specimen Signature Card',
    category: 'INCORPORATION' as DocCategory,
    isSystemTemplate: true,
    isActive: true,
    fields: [
      { id: 's1', label: 'Signatory Names (Comma Separated)', type: 'text', required: true },
      { id: 's2', label: 'Signatory Designations (Comma Separated)', type: 'text', required: true }
    ],
    draftText: `<div style="text-align: center; margin-bottom: 30px;">
  <p style="font-weight: bold; font-size: 11pt; margin: 0;">SPECIMEN SIGNATURE CARD FOR UPLOAD WITH THE ONLINE APPLICATION FOR REGISTRATION WITH EMPLOYEES’ PROVIDENT FUND ORGANISATION</p>
  <p style="font-size: 8pt; margin-top: 5px;">(This card is for the specimen signature of the employers of the establishment at the time of registration of the establishment with the Employees’ P F Organization)</p>
</div>

<div style="margin-bottom: 20px;">
  <p>NAME OF ESTABLISHMENT: <strong>{{Company_Name}}</strong></p>
  <p>ADDRESS OF THE ESTABLISHMENT: <strong>{{Company_Address}}</strong></p>
</div>

<p style="font-size: 9pt; font-style: italic; margin-bottom: 20px;">(Please upload for all employers and for Authorized Signatory if any)</p>

{{DYNAMIC_SIGNATORY_BOXES}}

<div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-size: 10pt;">
  For P F Office Use: Code Number Allotted: ____________________
</div>`
  }
];

// --- Workspace Mode ---

export const getWorkspaceMode = (): UserType => {
  return UserType.MT; // Always MT
};

export const setWorkspaceMode = (mode: UserType) => {
  localStorage.setItem(WORKSPACE_MODE_KEY, UserType.MT);
};

// --- Client Profile Management ---

export const saveClientProfile = (details: CompanyDetails | Partial<ClientProfile>) => {
  const clientsStr = localStorage.getItem(CLIENTS_KEY);
  let clients: ClientProfile[] = clientsStr ? JSON.parse(clientsStr) : [];
  
  const cin = 'cin' in details ? details.cin : (details as ClientProfile).cin;
  const existingIndex = clients.findIndex(c => c.cin === cin);
  
  let directors: DirectorInfo[] = [];
  
  if ('directorsPresent' in details) {
    directors = (details as CompanyDetails).directorsPresent.split(',').map(d => ({
      name: d.trim(),
      din: ''
    })).filter(d => d.name !== '');
  } else if ('directors' in details) {
    directors = (details as ClientProfile).directors || [];
  }

  const profile: ClientProfile = {
    id: existingIndex >= 0 ? clients[existingIndex].id : crypto.randomUUID(),
    cin: cin || '',
    companyName: 'companyName' in details ? details.companyName! : (details as ClientProfile).companyName,
    address: 'address' in details ? details.address! : (details as ClientProfile).address,
    companyEmail: 'companyEmail' in details ? details.companyEmail! : (details as ClientProfile).companyEmail,
    directors: directors,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    clients[existingIndex] = profile;
  } else {
    clients.push(profile);
  }
  
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  return profile;
};

export const getClientProfiles = (): ClientProfile[] => {
  const clientsStr = localStorage.getItem(CLIENTS_KEY);
  const profiles: ClientProfile[] = clientsStr ? JSON.parse(clientsStr) : [];
  return profiles.map(p => ({
    ...p,
    directors: Array.isArray(p.directors) 
      ? p.directors.map(d => typeof d === 'string' ? { name: d, din: '' } : d)
      : []
  }));
};

export const deleteClientProfile = (id: string) => {
  const clientsStr = localStorage.getItem(CLIENTS_KEY);
  let clients: ClientProfile[] = clientsStr ? JSON.parse(clientsStr) : [];
  clients = clients.filter(c => c.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

// --- Resolution Data ---

export const saveResolution = (data: Omit<ResolutionData, 'id' | 'createdAt'>): ResolutionData => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  const resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  
  const newResolution: ResolutionData = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  resolutions.push(newResolution);
  localStorage.setItem(RESOLUTIONS_KEY, JSON.stringify(resolutions));
  saveClientProfile(data.companyDetails);
  return newResolution;
};

export const getResolutions = (): ResolutionData[] => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  const resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  return resolutions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getAllResolutions = getResolutions;

export const deleteResolution = (id: string) => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  let resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  resolutions = resolutions.filter(r => r.id !== id);
  localStorage.setItem(RESOLUTIONS_KEY, JSON.stringify(resolutions));
};

// --- Templates ---

export const saveUserTemplate = (template: Omit<UserTemplate, 'id' | 'createdAt'>): UserTemplate => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  const templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  
  const newTemplate: UserTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
}

export const getAllTemplates = (): UserTemplate[] => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  let templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  
  if (templates.length === 0) {
    const seeded = PRE_SEEDED_TEMPLATES.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      userId: 'system',
      createdAt: new Date().toISOString(),
    })) as UserTemplate[];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(seeded));
    templates = seeded;
  }
  
  return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteUserTemplate = (id: string) => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  let templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  templates = templates.filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// --- User Management ---

export const registerUser = (userData: Partial<User>): boolean => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  if (users.find(u => u.email === userData.email)) return false;
  
  const newUser: User = {
    id: userData.id || crypto.randomUUID(),
    email: userData.email || '',
    name: userData.name || '',
    password: userData.password || '',
    userType: UserType.MT,
    role: UserRole.USER,
    isActive: true,
    canCreateTemplate: true
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const updateUserStatus = (id: string, isActive: boolean) => {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx >= 0) {
    users[idx].isActive = isActive;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const updateUserPermission = (id: string, canCreateTemplate: boolean) => {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx >= 0) {
    users[idx].canCreateTemplate = canCreateTemplate;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
