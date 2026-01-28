export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  canCreateTemplate: boolean;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  cin: string;
  companyName: string;
  address: string;
  companyEmail: string;
  updatedAt: string;
}

export enum MeetingType {
  BOARD = 'Board Meeting',
  COMMITTEE = 'Committee Meeting',
}

export enum ResolutionType {
  // Auditor Types
  APPOINTMENT_FIRST_AUDITOR = 'APPOINTMENT_FIRST_AUDITOR',
  RESIGNATION_AUDITOR = 'RESIGNATION_AUDITOR',
  APPOINTMENT_CASUAL_VACANCY = 'APPOINTMENT_CASUAL_VACANCY',
  APPOINTMENT_SUBSEQUENT_AUDITOR = 'APPOINTMENT_SUBSEQUENT_AUDITOR',
  // Custom User Template
  CUSTOM = 'CUSTOM_TEMPLATE',
  // Personalized Resolution
  PERSONALIZED = 'PERSONALIZED_RESOLUTION',
}

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

// Data for a single resolution item within a meeting
export interface ResolutionItemData {
  id: string;
  type: ResolutionType;
  templateId?: string;
  templateName: string;
  customValues: Record<string, string>; // Stores values for fields
  draftText: string; // The specific text for this resolution
}

export interface HeaderFooterConfig {
  showHeader: boolean;
  headerTitle?: string; // e.g. Company Name override
  headerSubtitle?: string; // e.g. Regd Office
  signatoryName: string;
  signatoryDesignation: string;
  signatoryDin?: string;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'currency' | 'textarea';

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  value?: string;
}

export interface UserTemplate {
  id: string;
  userId: string;
  name: string;
  fields: CustomField[];
  draftText: string;
  createdAt: string;
  isSystemTemplate: boolean; // True if created by Admin for global use
  isActive: boolean;
}

export interface PersonalizedResolutionItem {
  id: string;
  title: string;
  draftText: string;
  fields: CustomField[];
}

export interface ResolutionData {
  id: string;
  userId: string;
  createdAt: string;
  companyDetails: CompanyDetails;
  items?: ResolutionItemData[]; // Multiple resolutions - Optional
  personalizedData?: PersonalizedResolutionItem[]; // For personalized resolutions
  headerFooter?: HeaderFooterConfig; // Optional
  finalContent: string; 
  type: ResolutionType;
}