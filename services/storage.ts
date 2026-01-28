import { ResolutionData, User, UserRole, UserTemplate, ClientProfile, CompanyDetails } from '../types';

const USERS_KEY = 'corpreso_users';
const RESOLUTIONS_KEY = 'corpreso_resolutions';
const TEMPLATES_KEY = 'corpreso_templates';
const CLIENTS_KEY = 'corpreso_clients';
const CURRENT_USER_KEY = 'corpreso_current_user';

// --- Auth & User Management ---

const seedAdmin = () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (!users.find(u => u.email === 'admin@patron.com')) {
    const adminUser: User = {
      id: 'admin-001',
      email: 'admin@patron.com',
      name: 'Super Admin',
      password: 'admin@3214',
      role: UserRole.ADMIN,
      isActive: true,
      canCreateTemplate: true,
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
seedAdmin();

export const registerUser = (user: Pick<User, 'id'|'email'|'name'|'password'>): boolean => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find(u => u.email === user.email)) {
    return false; // User exists
  }
  
  const newUser: User = {
    ...user,
    role: UserRole.USER,
    isActive: true, // Default active
    canCreateTemplate: false, // Default false, admin must grant
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const loginUser = (email: string, password: string): User | null => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    if (!user.isActive) return null; // Blocked user
    const { password, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return safeUser;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// --- Client Profile Management ---

export const saveClientProfile = (details: CompanyDetails) => {
  const clientsStr = localStorage.getItem(CLIENTS_KEY);
  let clients: ClientProfile[] = clientsStr ? JSON.parse(clientsStr) : [];
  
  // Check if client exists by CIN
  const existingIndex = clients.findIndex(c => c.cin === details.cin);
  
  const profile: ClientProfile = {
    id: existingIndex >= 0 ? clients[existingIndex].id : crypto.randomUUID(),
    cin: details.cin,
    companyName: details.companyName,
    address: details.address,
    companyEmail: details.companyEmail,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    clients[existingIndex] = profile;
  } else {
    clients.push(profile);
  }
  
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const getClientProfiles = (): ClientProfile[] => {
  const clientsStr = localStorage.getItem(CLIENTS_KEY);
  return clientsStr ? JSON.parse(clientsStr) : [];
};

// --- Resolution Data ---

export const saveResolution = (data: Omit<ResolutionData, 'id' | 'createdAt'>): ResolutionData => {
  // 1. Save Resolution
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  const resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  
  const newResolution: ResolutionData = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  resolutions.push(newResolution);
  localStorage.setItem(RESOLUTIONS_KEY, JSON.stringify(resolutions));

  // 2. Auto-update Client Profile
  saveClientProfile(data.companyDetails);

  return newResolution;
};

export const getResolutionsByUser = (userId: string): ResolutionData[] => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  const resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  return resolutions.filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getAllResolutions = (): ResolutionData[] => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  const resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  return resolutions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteResolution = (id: string) => {
  const resolutionsStr = localStorage.getItem(RESOLUTIONS_KEY);
  let resolutions: ResolutionData[] = resolutionsStr ? JSON.parse(resolutionsStr) : [];
  resolutions = resolutions.filter(r => r.id !== id);
  localStorage.setItem(RESOLUTIONS_KEY, JSON.stringify(resolutions));
};

// --- User & System Templates ---

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

export const getUserTemplates = (userId: string): UserTemplate[] => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  const templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  // Return templates owned by user OR system templates
  return templates.filter(t => (t.userId === userId || t.isSystemTemplate) && t.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getAllTemplates = (): UserTemplate[] => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  const templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteUserTemplate = (id: string) => {
  const templatesStr = localStorage.getItem(TEMPLATES_KEY);
  let templates: UserTemplate[] = templatesStr ? JSON.parse(templatesStr) : [];
  templates = templates.filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// --- Admin ---

export const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  return users.map(({password, ...u}) => u as User);
};

export const updateUserStatus = (userId: string, isActive: boolean) => {
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  users = users.map(u => u.id === userId ? { ...u, isActive } : u);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUserPermission = (userId: string, canCreateTemplate: boolean) => {
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  users = users.map(u => u.id === userId ? { ...u, canCreateTemplate } : u);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};