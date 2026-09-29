export type UserRole = 'CITIZEN' | 'POLICE' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  dateOfBirth?: string;
  gender?: string;
  officerId?: string; // If Police/Admin
  badgeNumber?: string;
  rank?: string;
  policeStation?: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Theft'
  | 'Burglary'
  | 'Cybercrime'
  | 'Assault'
  | 'Financial Fraud'
  | 'Missing Person'
  | 'Harassment'
  | 'Public Disturbance'
  | 'Narcotics'
  | 'Property Dispute'
  | 'Vehicle Theft'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Approved'
  | 'Rejected'
  | 'FIR Registered'
  | 'Investigation'
  | 'Case Closed';

export interface Complaint {
  id: string; // CMP-2026-XXXX
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  city: string;
  state: string;
  suspectDetails?: string;
  witnessDetails?: string;
  supportingDocuments?: string[];
  status: ComplaintStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  verificationRemarks?: string;
  firNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type FirStatus =
  | 'FIR Registered'
  | 'Investigation'
  | 'Under Review'
  | 'Rework'
  | 'Case Closed';

export interface Fir {
  id: string; // FIR-2026-XXXX
  complaintId: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenAddress: string;
  policeStation: string;
  registrationDate: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  offenceType: string;
  actAndSections: string; // e.g. "IPC Section 379 / BNS Section 303(2)"
  description: string;
  investigatingOfficerId: string;
  investigatingOfficerName: string;
  investigatingOfficerRank: string;
  status: FirStatus;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export type InvestigationStatus =
  | 'Initiated'
  | 'In Progress'
  | 'Witness Interrogated'
  | 'Forensic Analysis'
  | 'Charge Sheet Prepared'
  | 'Completed';

export interface InvestigationNote {
  id: string;
  date: string;
  officerName: string;
  note: string;
}

export interface Investigation {
  id: string; // INV-2026-XXX
  firNumber: string;
  officerId: string;
  officerName: string;
  startDate: string;
  status: InvestigationStatus;
  findings: string;
  notes: InvestigationNote[];
  completionDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceType =
  | 'Document'
  | 'Image'
  | 'Video'
  | 'Physical Weapon'
  | 'Forensic Report'
  | 'Digital Audio/Call Record'
  | 'Other';

export interface Evidence {
  id: string; // EVD-2026-XXX
  firNumber: string;
  evidenceType: EvidenceType;
  description: string;
  collectedDate: string;
  collectedLocation: string;
  collectedBy: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isCitizenVisible: boolean;
  chainOfCustodyRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoliceOfficer {
  id: string; // OFF-XXX
  userId?: string;
  fullName: string;
  badgeNumber: string;
  rank: 'Inspector' | 'Sub-Inspector' | 'Assistant Sub-Inspector' | 'Head Constable' | 'Constable';
  policeStation: string;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Transferred' | 'Inactive';
  assignedCasesCount: number;
}

export interface CaseStatusHistory {
  id: string;
  firNumber: string;
  complaintId?: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  updatedByRole: string;
  remarks: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // target user or undefined for role-broadcast
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'COMPLAINT' | 'FIR' | 'INVESTIGATION' | 'STATUS' | 'SYSTEM';
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}
