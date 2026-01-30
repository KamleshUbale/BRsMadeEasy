
export enum UserType {
  MT = 'MT', // Management Tool (Professional)
  MU = 'MU', // My Unit (Company)
}

/**
 * Roles for system access control.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Represents a user within the workspace.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  userType: UserType;
  role: UserRole;
  isActive: boolean;
  canCreateTemplate: boolean;
}

export interface DirectorInfo {
  name: string;
  din: string;
}

export interface ClientProfile {
  id: string;
  cin: string;
  companyName: string;
  address: string;
  companyEmail: string;
  directors: DirectorInfo[]; 
  updatedAt: string;
}

export enum MeetingType {
  BOARD = 'Board Meeting',
  EGM = 'Extraordinary General Meeting',
  AGM = 'Annual General Meeting',
}

export enum ResolutionType {
  CUSTOM = 'CUSTOM',
  PERSONALIZED = 'PERSONALIZED',
  AI_GENERATED = 'AI_GENERATED'
}

export type DocCategory = 'RESOLUTION' | 'NOC' | 'INCORPORATION' | 'RESIGNATION' | 'DIR2';
export type DocSubType = 'SPECIMEN_SIGNATURE' | 'INC_NOC' | 'GENERAL';

export interface CompanyDetails {
  cin: string;
  companyName: string;
  address: string;
  companyEmail: string; 
  meetingDate: string;
  meetingTime: string;
  meetingPlace: string;
  financialYear: string;
  meetingType: MeetingType;
  chairmanName: string;
  chairmanDin: string; 
  directorsPresent: string; 
  quorumPresent: boolean; 
}

export interface ResolutionItemData {
  id: string;
  templateId?: string;
  templateName: string;
  customValues: Record<string, string>;
  draftText: string;
  type?: ResolutionType;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'textarea' | 'currency';

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  value?: string;
}

export interface PersonalizedResolutionItem {
  id: string;
  title: string;
  draftText: string;
  fields: CustomField[];
}

export interface HeaderFooterConfig {
  showHeader: boolean;
  headerTitle: string;
  headerSubtitle: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatoryDin: string;
}

export interface ResolutionData {
  id: string;
  userId: string;
  clientId?: string;
  createdAt: string;
  companyDetails: CompanyDetails;
  items: ResolutionItemData[];
  finalContent: string; 
  docType: DocCategory;
  subType?: DocSubType;
  type: ResolutionType;
  personalizedData?: PersonalizedResolutionItem[];
  headerFooter?: HeaderFooterConfig;
}

export interface UserTemplate {
  id: string;
  userId: string;
  name: string;
  category: DocCategory;
  fields: CustomField[];
  draftText: string;
  createdAt: string;
  isSystemTemplate: boolean;
  isActive: boolean;
}
