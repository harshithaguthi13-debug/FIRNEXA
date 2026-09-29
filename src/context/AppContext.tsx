import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Complaint,
  Fir,
  Investigation,
  Evidence,
  PoliceOfficer,
  CaseStatusHistory,
  AppNotification,
  FirStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_OFFICERS,
  INITIAL_COMPLAINTS,
  INITIAL_FIRS,
  INITIAL_INVESTIGATIONS,
  INITIAL_EVIDENCE,
  INITIAL_STATUS_HISTORY,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  complaints: Complaint[];
  firs: Fir[];
  investigations: Investigation[];
  evidence: Evidence[];
  officers: PoliceOfficer[];
  statusHistory: CaseStatusHistory[];
  notifications: AppNotification[];
  unreadNotificationCount: number;

  // Auth actions
  login: (email: string, role: UserRole) => { success: boolean; message?: string };
  registerCitizen: (data: Partial<User> & { password?: string }) => { success: boolean; message?: string; user?: User };
  registerPoliceOrAdmin: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: 'POLICE' | 'ADMIN';
    badgeNumber: string;
    rank: string;
    policeStation: string;
    department: string;
    password?: string;
  }) => { success: boolean; message?: string; user?: User };
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void;

  // Complaint actions
  submitComplaint: (complaintData: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  verifyComplaint: (
    complaintId: string,
    status: 'Approved' | 'Rejected' | 'Under Verification',
    remarks: string,
    assignedOfficerId?: string
  ) => void;

  // FIR actions
  registerFir: (firData: Omit<Fir, 'id' | 'createdAt' | 'updatedAt'> & { customFirNumber?: string }) => string;
  assignOfficerToFir: (firNumber: string, officerId: string) => void;

  // Investigation actions
  createOrUpdateInvestigation: (firNumber: string, update: Partial<Investigation>) => void;
  addInvestigationNote: (firNumber: string, noteText: string) => void;

  // Evidence actions
  addEvidence: (evidenceData: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => string;
  deleteEvidence: (evidenceId: string) => void;
  toggleEvidenceCitizenVisibility: (evidenceId: string) => void;

  // Case Status actions
  updateCaseStatus: (firNumber: string, newStatus: FirStatus, remarks: string) => void;

  // Officer management actions
  addOfficer: (officerData: Omit<PoliceOfficer, 'id' | 'assignedCasesCount'>) => string;
  updateOfficer: (officerId: string, data: Partial<PoliceOfficer>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Reset
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'police_fir_current_user',
  USERS: 'police_fir_users',
  COMPLAINTS: 'police_fir_complaints',
  FIRS: 'police_fir_firs',
  INVESTIGATIONS: 'police_fir_investigations',
  EVIDENCE: 'police_fir_evidence',
  OFFICERS: 'police_fir_officers',
  HISTORY: 'police_fir_history',
  NOTIFICATIONS: 'police_fir_notifications',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = loadStorage<User | null>(STORAGE_KEYS.USER, null);
    return stored || null;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    loadStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS)
  );
  const [firs, setFirs] = useState<Fir[]>(() => loadStorage(STORAGE_KEYS.FIRS, INITIAL_FIRS));
  const [investigations, setInvestigations] = useState<Investigation[]>(() =>
    loadStorage(STORAGE_KEYS.INVESTIGATIONS, INITIAL_INVESTIGATIONS)
  );
  const [evidence, setEvidence] = useState<Evidence[]>(() =>
    loadStorage(STORAGE_KEYS.EVIDENCE, INITIAL_EVIDENCE)
  );
  const [officers, setOfficers] = useState<PoliceOfficer[]>(() =>
    loadStorage(STORAGE_KEYS.OFFICERS, INITIAL_OFFICERS)
  );
  const [statusHistory, setStatusHistory] = useState<CaseStatusHistory[]>(() =>
    loadStorage(STORAGE_KEYS.HISTORY, INITIAL_STATUS_HISTORY)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // Sync state to localStorage
  useEffect(() => saveStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveStorage(STORAGE_KEYS.USER, currentUser), [currentUser]);
  useEffect(() => saveStorage(STORAGE_KEYS.COMPLAINTS, complaints), [complaints]);
  useEffect(() => saveStorage(STORAGE_KEYS.FIRS, firs), [firs]);
  useEffect(() => saveStorage(STORAGE_KEYS.INVESTIGATIONS, investigations), [investigations]);
  useEffect(() => saveStorage(STORAGE_KEYS.EVIDENCE, evidence), [evidence]);
  useEffect(() => saveStorage(STORAGE_KEYS.OFFICERS, officers), [officers]);
  useEffect(() => saveStorage(STORAGE_KEYS.HISTORY, statusHistory), [statusHistory]);
  useEffect(() => saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);

  // Auth
  const login = (email: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, message: 'Account not found with this email. Please check your credentials.' };
    }

    if (role === 'CITIZEN' && user.role !== 'CITIZEN') {
      return { success: false, message: 'This account belongs to Police/Admin staff. Please switch to Admin / Police login.' };
    }

    if ((role === 'POLICE' || role === 'ADMIN') && user.role === 'CITIZEN') {
      return { success: false, message: 'Citizen accounts cannot access Police/Admin management. Please switch to User / Citizen login.' };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const registerCitizen = (data: Partial<User> & { password?: string }) => {
    const email = data.email?.trim().toLowerCase();
    if (!email) return { success: false, message: 'Email address is required.' };

    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please login.' };
    }

    const newUser: User = {
      id: `USR-CIT-${String(users.length + 1).padStart(3, '0')}`,
      fullName: data.fullName || 'Citizen User',
      email: data.email || '',
      phone: data.phone || '',
      role: 'CITIZEN',
      address: data.address || '',
      city: data.city || 'Bangalore',
      state: data.state || 'Karnataka',
      pinCode: data.pinCode || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || 'Not Specified',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // Welcome notification
    const welcomeNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to Police FIR Management Portal',
      message: 'Your citizen registration is confirmed. You can now submit complaints and track case statuses in real-time.',
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    return { success: true, user: newUser };
  };

  const registerPoliceOrAdmin = (data: {
    fullName: string;
    email: string;
    phone: string;
    role: 'POLICE' | 'ADMIN';
    badgeNumber: string;
    rank: string;
    policeStation: string;
    department: string;
    password?: string;
  }) => {
    const email = data.email?.trim().toLowerCase();
    if (!email) return { success: false, message: 'Official email address is required.' };

    const existingUser = users.find((u) => u.email.toLowerCase() === email);
    if (existingUser) {
      return { success: false, message: 'An account with this email address already exists. Please login.' };
    }

    const badgeClean = data.badgeNumber.trim().toUpperCase();
    const existingBadge = officers.find((o) => o.badgeNumber.toUpperCase() === badgeClean);
    if (existingBadge) {
      return { success: false, message: `Badge / Service Number ${badgeClean} is already registered to another officer.` };
    }

    const newOfficerId = `OFF-${String(officers.length + 101).padStart(3, '0')}`;
    const newUserId = `USR-${data.role === 'ADMIN' ? 'ADM' : 'POL'}-${String(users.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: newUserId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      officerId: newOfficerId,
      badgeNumber: badgeClean,
      rank: data.rank,
      policeStation: data.policeStation,
      createdAt: now,
    };

    const newOfficer: PoliceOfficer = {
      id: newOfficerId,
      userId: newUserId,
      fullName: data.fullName,
      badgeNumber: badgeClean,
      rank: data.rank as any,
      policeStation: data.policeStation,
      department: data.department,
      phone: data.phone,
      email: data.email,
      joiningDate: now.split('T')[0],
      status: 'Active',
      assignedCasesCount: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    setOfficers((prev) => [...prev, newOfficer]);
    setCurrentUser(newUser);

    // Official enrollment notification
    const enrollNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: newUserId,
      targetRole: data.role,
      title: `${data.role === 'ADMIN' ? 'Administrator' : 'Police Officer'} Service Account Enrolled`,
      message: `Welcome, ${data.rank} ${data.fullName}. Your official badge ${badgeClean} is registered at ${data.policeStation}. You now have full operational privileges.`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: now,
    };
    setNotifications((prev) => [enrollNotif, ...prev]);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserRole = (targetRole: UserRole) => {
    const candidate = users.find((u) => u.role === targetRole);
    if (candidate) {
      setCurrentUser(candidate);
    }
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  // Complaint actions
  const submitComplaint = (data: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>): string => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `CMP-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      ...data,
      id: newId,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Send notification to citizen
    const citizenNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: data.citizenId,
      title: 'Complaint Submitted Successfully',
      message: `Your complaint "${data.title}" was submitted with ID ${newId}. It is currently queued for police verification.`,
      type: 'COMPLAINT',
      isRead: false,
      referenceId: newId,
      createdAt: now,
    };

    // Send notification to Police
    const policeNotif: AppNotification = {
      id: `NOTIF-${Date.now() + 1}`,
      targetRole: 'POLICE',
      title: 'New Complaint Submitted for Verification',
      message: `New complaint ${newId} (${data.category}) received from ${data.citizenName}. Awaiting initial verification.`,
      type: 'COMPLAINT',
      isRead: false,
      referenceId: newId,
      createdAt: now,
    };

    setNotifications((prev) => [citizenNotif, policeNotif, ...prev]);
    return newId;
  };

  const verifyComplaint = (
    complaintId: string,
    status: 'Approved' | 'Rejected' | 'Under Verification',
    remarks: string,
    assignedOfficerId?: string
  ) => {
    const now = new Date().toISOString();
    const officer = officers.find((o) => o.id === assignedOfficerId);

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            verificationRemarks: remarks,
            assignedOfficerId: assignedOfficerId || c.assignedOfficerId,
            assignedOfficerName: officer ? officer.fullName : c.assignedOfficerName,
            updatedAt: now,
          };
        }
        return c;
      })
    );

    const targetComplaint = complaints.find((c) => c.id === complaintId);
    if (targetComplaint) {
      const notif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: targetComplaint.citizenId,
        title: `Complaint Status: ${status}`,
        message: `Your complaint ${complaintId} has been marked as "${status}". Note: ${remarks}`,
        type: 'COMPLAINT',
        isRead: false,
        referenceId: complaintId,
        createdAt: now,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // FIR actions
  const registerFir = (
    firData: Omit<Fir, 'id' | 'createdAt' | 'updatedAt'> & { customFirNumber?: string }
  ): string => {
    const now = new Date().toISOString();
    const firNumber =
      firData.customFirNumber || `FIR-2026-${String(firs.length + 43).padStart(4, '0')}`;

    const newFir: Fir = {
      ...firData,
      id: firNumber,
      createdAt: now,
      updatedAt: now,
    };

    setFirs((prev) => [newFir, ...prev]);

    // Update parent complaint if linked
    if (firData.complaintId) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === firData.complaintId
            ? {
                ...c,
                status: 'FIR Registered',
                firNumber: firNumber,
                assignedOfficerId: firData.investigatingOfficerId,
                assignedOfficerName: firData.investigatingOfficerName,
                updatedAt: now,
              }
            : c
        )
      );
    }

    // Auto-create initial investigation record
    const newInv: Investigation = {
      id: `INV-2026-${String(investigations.length + 43).padStart(3, '0')}`,
      firNumber: firNumber,
      officerId: firData.investigatingOfficerId,
      officerName: firData.investigatingOfficerName,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Initiated',
      findings: 'Initial case files opened. Formal crime scene analysis and complainant deposition pending.',
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          officerName: firData.investigatingOfficerName,
          note: `FIR registered under ${firData.actAndSections}. Preliminary docket created.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    setInvestigations((prev) => [newInv, ...prev]);

    // Add status history
    const historyEntry: CaseStatusHistory = {
      id: `CSH-${Date.now()}`,
      firNumber: firNumber,
      complaintId: firData.complaintId,
      previousStatus: 'Approved',
      newStatus: 'FIR Registered',
      updatedBy: currentUser?.fullName || 'Police Officer',
      updatedByRole: currentUser?.role || 'POLICE',
      remarks: `FIR registered officially at ${firData.policeStation}. Investigating officer assigned: ${firData.investigatingOfficerName}.`,
      timestamp: now,
    };
    setStatusHistory((prev) => [historyEntry, ...prev]);

    // Update officer assigned cases count
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === firData.investigatingOfficerId
          ? { ...o, assignedCasesCount: o.assignedCasesCount + 1 }
          : o
      )
    );

    // Notify Citizen
    if (firData.citizenId) {
      const citizenNotif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: firData.citizenId,
        title: 'FIR Registered Officially',
        message: `Your case has been registered under First Information Report ${firNumber}. Investigating officer: ${firData.investigatingOfficerName}.`,
        type: 'FIR',
        isRead: false,
        referenceId: firNumber,
        createdAt: now,
      };
      setNotifications((prev) => [citizenNotif, ...prev]);
    }

    return firNumber;
  };

  const assignOfficerToFir = (firNumber: string, officerId: string) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    const now = new Date().toISOString();

    setFirs((prev) =>
      prev.map((f) =>
        f.id === firNumber
          ? {
              ...f,
              investigatingOfficerId: officer.id,
              investigatingOfficerName: officer.fullName,
              investigatingOfficerRank: officer.rank,
              updatedAt: now,
            }
          : f
      )
    );

    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.firNumber === firNumber
          ? {
              ...inv,
              officerId: officer.id,
              officerName: officer.fullName,
              updatedAt: now,
              notes: [
                ...inv.notes,
                {
                  id: `NOTE-${Date.now()}`,
                  date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  officerName: officer.fullName,
                  note: `Assigned as new Investigating Officer by administration.`,
                },
              ],
            }
          : inv
      )
    );

    // Notify complainant
    const targetFir = firs.find((f) => f.id === firNumber);
    if (targetFir?.citizenId) {
      const notif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: targetFir.citizenId,
        title: 'Investigating Officer Updated',
        message: `${officer.rank} ${officer.fullName} has been assigned to FIR ${firNumber}.`,
        type: 'INVESTIGATION',
        isRead: false,
        referenceId: firNumber,
        createdAt: now,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Investigation actions
  const createOrUpdateInvestigation = (firNumber: string, update: Partial<Investigation>) => {
    const now = new Date().toISOString();
    setInvestigations((prev) => {
      const exists = prev.some((i) => i.firNumber === firNumber);
      if (exists) {
        return prev.map((i) =>
          i.firNumber === firNumber ? { ...i, ...update, updatedAt: now } : i
        );
      } else {
        const targetFir = firs.find((f) => f.id === firNumber);
        const newInv: Investigation = {
          id: `INV-2026-${String(prev.length + 45).padStart(3, '0')}`,
          firNumber,
          officerId: targetFir?.investigatingOfficerId || 'OFF-101',
          officerName: targetFir?.investigatingOfficerName || 'Inspector Rajesh Kumar',
          startDate: new Date().toISOString().split('T')[0],
          status: 'In Progress',
          findings: update.findings || 'Investigation active.',
          notes: [],
          createdAt: now,
          updatedAt: now,
          ...update,
        };
        return [newInv, ...prev];
      }
    });
  };

  const addInvestigationNote = (firNumber: string, noteText: string) => {
    const now = new Date().toISOString();
    const formattedDate = now.replace('T', ' ').substring(0, 16);
    const officerName = currentUser?.fullName || 'Investigating Officer';

    setInvestigations((prev) =>
      prev.map((inv) => {
        if (inv.firNumber === firNumber) {
          return {
            ...inv,
            notes: [
              ...inv.notes,
              {
                id: `NOTE-${Date.now()}`,
                date: formattedDate,
                officerName,
                note: noteText,
              },
            ],
            updatedAt: now,
          };
        }
        return inv;
      })
    );
  };

  // Evidence actions
  const addEvidence = (
    data: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>
  ): string => {
    const now = new Date().toISOString();
    const newId = `EVD-2026-${String(evidence.length + 107).padStart(3, '0')}`;

    const newEvidence: Evidence = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    setEvidence((prev) => [newEvidence, ...prev]);

    // Add note to investigation
    addInvestigationNote(
      data.firNumber,
      `New physical/digital evidence added: [${data.evidenceType}] ${data.description.substring(0, 60)}... (ID: ${newId})`
    );

    return newId;
  };

  const deleteEvidence = (evidenceId: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
  };

  const toggleEvidenceCitizenVisibility = (evidenceId: string) => {
    setEvidence((prev) =>
      prev.map((e) => (e.id === evidenceId ? { ...e, isCitizenVisible: !e.isCitizenVisible } : e))
    );
  };

  // Case Status actions
  const updateCaseStatus = (firNumber: string, newStatus: FirStatus, remarks: string) => {
    const now = new Date().toISOString();
    const targetFir = firs.find((f) => f.id === firNumber);
    if (!targetFir) return;

    const previousStatus = targetFir.status;

    setFirs((prev) =>
      prev.map((f) => (f.id === firNumber ? { ...f, status: newStatus, remarks, updatedAt: now } : f))
    );

    // If case is closed, update investigation status as well
    if (newStatus === 'Case Closed') {
      setInvestigations((prev) =>
        prev.map((inv) =>
          inv.firNumber === firNumber
            ? { ...inv, status: 'Completed', completionDate: now.split('T')[0], updatedAt: now }
            : inv
        )
      );

      // Also mark linked complaint as closed
      if (targetFir.complaintId) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === targetFir.complaintId ? { ...c, status: 'Case Closed', updatedAt: now } : c
          )
        );
      }
    }

    // Add audit history
    const historyEntry: CaseStatusHistory = {
      id: `CSH-${Date.now()}`,
      firNumber: firNumber,
      complaintId: targetFir.complaintId,
      previousStatus: previousStatus,
      newStatus: newStatus,
      updatedBy: currentUser?.fullName || 'Police Officer',
      updatedByRole: currentUser?.role || 'POLICE',
      remarks: remarks || `Status transitioned to ${newStatus}.`,
      timestamp: now,
    };
    setStatusHistory((prev) => [historyEntry, ...prev]);

    // Send notification to complainant
    if (targetFir.citizenId) {
      const notif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: targetFir.citizenId,
        title: `Case Status Update: ${newStatus}`,
        message: `Your FIR ${firNumber} has transitioned from "${previousStatus}" to "${newStatus}". Remarks: ${remarks}`,
        type: 'STATUS',
        isRead: false,
        referenceId: firNumber,
        createdAt: now,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Officer actions
  const addOfficer = (
    data: Omit<PoliceOfficer, 'id' | 'assignedCasesCount'>
  ): string => {
    const newId = `OFF-${String(officers.length + 106).padStart(3, '0')}`;
    const newOfficer: PoliceOfficer = {
      ...data,
      id: newId,
      assignedCasesCount: 0,
    };
    setOfficers((prev) => [...prev, newOfficer]);
    return newId;
  };

  const updateOfficer = (officerId: string, data: Partial<PoliceOfficer>) => {
    setOfficers((prev) =>
      prev.map((o) => (o.id === officerId ? { ...o, ...data } : o))
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Reset to default
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setComplaints(INITIAL_COMPLAINTS);
    setFirs(INITIAL_FIRS);
    setInvestigations(INITIAL_INVESTIGATIONS);
    setEvidence(INITIAL_EVIDENCE);
    setOfficers(INITIAL_OFFICERS);
    setStatusHistory(INITIAL_STATUS_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.clear();
  };

  // Compute unread count for current user
  const unreadNotificationCount = notifications.filter((n) => {
    if (n.isRead) return false;
    if (currentUser?.role === 'CITIZEN') {
      return n.userId === currentUser.id;
    }
    if (currentUser?.role === 'POLICE' || currentUser?.role === 'ADMIN') {
      return n.targetRole === currentUser.role || n.targetRole === 'POLICE' || n.userId === currentUser.id;
    }
    return false;
  }).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        complaints,
        firs,
        investigations,
        evidence,
        officers,
        statusHistory,
        notifications,
        unreadNotificationCount,
        login,
        registerCitizen,
        registerPoliceOrAdmin,
        logout,
        switchUserRole,
        updateUserProfile,
        submitComplaint,
        verifyComplaint,
        registerFir,
        assignOfficerToFir,
        createOrUpdateInvestigation,
        addInvestigationNote,
        addEvidence,
        deleteEvidence,
        toggleEvidenceCitizenVisibility,
        updateCaseStatus,
        addOfficer,
        updateOfficer,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
