import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Complaint,
  Fir,
  Investigation,
  Evidence,
  PoliceOfficer,
  FirStatus,
  InvestigationStatus,
  ComplaintCategory,
  EvidenceType,
} from '../../types';
import { StatusBadge } from '../Badge';
import { StatusTimeline } from '../StatusTimeline';
import { FirPrintModal } from '../FirPrintModal';
import { FirLiveProgressionModal } from '../FirLiveProgressionModal';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Search,
  Plus,
  Users,
  FolderOpen,
  Camera,
  Activity,
  BarChart3,
  Bell,
  UserCheck,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  FileCheck2,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Award,
  Archive,
  Check,
  ArrowRight,
} from 'lucide-react';

export const PoliceDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    firs,
    investigations,
    evidence,
    officers,
    statusHistory,
    notifications,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'complaints'
    | 'firs'
    | 'investigations'
    | 'evidence'
    | 'officers'
    | 'status'
    | 'reports'
    | 'notifications'
    | 'profile'
    | 'completed'
  >('dashboard');

  // Stats
  const totalComplaints = complaints.length;
  const pendingVerification = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Verification'
  ).length;
  const totalFirs = firs.length;
  const activeInvestigations = investigations.filter((i) => i.status !== 'Completed').length;
  const completedInvestigations = investigations.filter((i) => i.status === 'Completed').length;
  const completedComplaints = complaints.filter((c) => c.status === 'Approved').length;
  const totalEvidence = evidence.length;
  const closedCases = firs.filter((f) => f.status === 'Case Closed').length;
  const totalOfficers = officers.length;

  // Selected modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [verifyModalComplaint, setVerifyModalComplaint] = useState<Complaint | null>(null);
  const [firConversionComplaint, setFirConversionComplaint] = useState<Complaint | null>(null);
  const [selectedFirForPrint, setSelectedFirForPrint] = useState<Fir | null>(null);
  const [newFirModalOpen, setNewFirModalOpen] = useState(false);
  const [addEvidenceModalOpen, setAddEvidenceModalOpen] = useState(false);
  const [addOfficerModalOpen, setAddOfficerModalOpen] = useState(false);
  const [editOfficerModal, setEditOfficerModal] = useState<PoliceOfficer | null>(null);
  const [liveProgressionData, setLiveProgressionData] = useState<{
    firNumber: string;
    complaintId?: string;
    offenceType: string;
    citizenName: string;
    investigatingOfficerName?: string;
    policeStation?: string;
  } | null>(null);
  const [isSubmittingFir, setIsSubmittingFir] = useState(false);
  const [firSubmitStepText, setFirSubmitStepText] = useState('');

  // Verification Form
  const [verifyForm, setVerifyForm] = useState({
    action: 'Approved' as 'Approved' | 'Rejected' | 'Under Verification',
    remarks: '',
    assignedOfficerId: officers[0]?.id || '',
  });

  // FIR Conversion/Creation Form
  const [firForm, setFirForm] = useState({
    complaintId: '',
    citizenName: '',
    citizenPhone: '',
    citizenAddress: '',
    citizenId: '',
    policeStation: currentUser?.policeStation || 'Central Metropolitan Station - Sector 4',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '12:00 PM',
    incidentLocation: '',
    offenceType: 'Theft of Motor Vehicle',
    actAndSections: 'Section 379 IPC / Section 303(2) BNS',
    description: '',
    investigatingOfficerId: officers[0]?.id || '',
    remarks: 'Cognizable offence verified. Formal FIR docket registered.',
  });

  // Evidence Form
  const [evidenceForm, setEvidenceForm] = useState({
    firNumber: firs[0]?.id || '',
    evidenceType: 'Document' as EvidenceType,
    description: '',
    collectedDate: new Date().toISOString().split('T')[0],
    collectedLocation: '',
    collectedBy: `${currentUser?.rank || 'Inspector'} ${currentUser?.fullName || 'Officer'}`,
    fileName: 'Seized_Exhibit_Document.pdf',
    fileSize: '4.5 MB',
    isCitizenVisible: false,
    chainOfCustodyRemarks: 'Stored in secure police precinct property locker.',
  });

  // Status Update Form
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    firNumber: firs[0]?.id || '',
    newStatus: 'Investigation' as FirStatus,
    remarks: '',
  });

  // New Officer Form
  const [officerForm, setOfficerForm] = useState({
    fullName: '',
    badgeNumber: '',
    rank: 'Sub-Inspector' as PoliceOfficer['rank'],
    policeStation: 'Central Metropolitan Station - Sector 4',
    department: 'Crime Branch & General Investigation',
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as PoliceOfficer['status'],
  });

  // Investigation Note Form
  const [newNoteFir, setNewNoteFir] = useState<string>(firs[0]?.id || '');
  const [newNoteText, setNewNoteText] = useState('');

  // Search & Filters
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('ALL');
  const [complaintFilterTab, setComplaintFilterTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FIR' | 'CLOSED'>('ALL');
  const [firSearch, setFirSearch] = useState('');
  const [firStatusFilter, setFirStatusFilter] = useState('ALL');
  const [firFilterTab, setFirFilterTab] = useState<'ALL' | 'ACTIVE' | 'REVIEW' | 'COMPLETED'>('ALL');
  const [investigationFilterTab, setInvestigationFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [statusFilterTab, setStatusFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [completedArchiveTab, setCompletedArchiveTab] = useState<'ALL' | 'FIRS' | 'INVESTIGATIONS' | 'COMPLAINTS'>('ALL');
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');

  // Complete Action Confirmation Modal
  const [completeConfirmModal, setCompleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'COMPLAINT' | 'FIR' | 'INVESTIGATION';
    id: string;
    title: string;
    defaultRemarks: string;
    actionLabel: string;
    onConfirm: (remarks: string) => void;
  } | null>(null);
  const [completionRemarksInput, setCompletionRemarksInput] = useState('');

  // Official Case Completion & Disposal Certificate Modal
  const [selectedClosedCaseForCert, setSelectedClosedCaseForCert] = useState<Fir | null>(null);

  // Fast completion helper functions
  const handleMarkComplaintCompleted = (c: Complaint) => {
    verifyComplaint(
      c.id,
      'Approved',
      'Verified and completed by station command authority.',
      c.assignedOfficerId || officers[0]?.id
    );
    if (selectedComplaint?.id === c.id) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: 'Approved' } : null));
    }
  };

  const handleMarkFirCompleted = (firId: string, remarks?: string) => {
    updateCaseStatus(
      firId,
      'Case Closed',
      remarks || 'Investigation formally concluded, charge sheet submitted, and case docket closed.'
    );
  };

  const handleMarkInvestigationCompleted = (firId: string, remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    createOrUpdateInvestigation(firId, {
      status: 'Completed',
      completionDate: today,
    });
    addInvestigationNote(
      firId,
      `[INVESTIGATION COMPLETED] ${remarks || 'Statutory investigation concluded, evidence compiled, and charge sheet prepared.'}`
    );
  };

  const handleBatchCompletePendingComplaints = () => {
    const pendingList = complaints.filter(
      (c) => c.status === 'Submitted' || c.status === 'Under Verification'
    );
    pendingList.forEach((c) => {
      verifyComplaint(
        c.id,
        'Approved',
        'Bulk verified and marked completed by station supervisory authority.',
        c.assignedOfficerId || officers[0]?.id
      );
    });
  };

  // Reports State
  const [reportType, setReportType] = useState<
    'COMPLAINTS' | 'FIRS' | 'INVESTIGATIONS' | 'EVIDENCE' | 'OFFICERS' | 'STATUS_HISTORY'
  >('FIRS');
  const [reportDateFrom, setReportDateFrom] = useState('2026-08-01');
  const [reportDateTo, setReportDateTo] = useState('2026-10-31');

  // Helper to open FIR register from complaint
  const handleOpenFirFromComplaint = (c: Complaint) => {
    setFirConversionComplaint(c);
    setFirForm({
      complaintId: c.id,
      citizenName: c.citizenName,
      citizenPhone: c.citizenPhone,
      citizenAddress: `${c.city}, ${c.state}`,
      citizenId: c.citizenId,
      policeStation: currentUser?.policeStation || 'Central Metropolitan Station - Sector 4',
      incidentDate: c.incidentDate,
      incidentTime: c.incidentTime,
      incidentLocation: c.incidentLocation,
      offenceType: c.category,
      actAndSections:
        c.category === 'Theft' || c.category === 'Vehicle Theft'
          ? 'Section 379 IPC / Section 303(2) BNS'
          : c.category === 'Cybercrime'
          ? 'Section 66C & 66D IT Act 2000'
          : c.category === 'Burglary'
          ? 'Section 457 & 380 IPC / Section 305 & 331 BNS'
          : 'Section 420 IPC / Section 318(4) BNS',
      description: c.description,
      investigatingOfficerId: c.assignedOfficerId || officers[0]?.id || '',
      remarks: `FIR converted from verified complaint ${c.id}.`,
    });
    setNewFirModalOpen(true);
  };

  // Submit FIR creation with realistic docketing delay & milestone progression
  const handleFirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedOfficer = officers.find((o) => o.id === firForm.investigatingOfficerId);

    setIsSubmittingFir(true);
    setFirSubmitStepText('Submitting FIR to FIRNEXA State Police Database...');

    setTimeout(() => {
      setFirSubmitStepText('Docketing Official Criminal Ledger & Notifying Investigating Officer...');
    }, 700);

    setTimeout(() => {
      const generatedFirNumber = registerFir({
        complaintId: firForm.complaintId,
        citizenId: firForm.citizenId || 'USR-CIT-001',
        citizenName: firForm.citizenName,
        citizenPhone: firForm.citizenPhone,
        citizenAddress: firForm.citizenAddress,
        policeStation: firForm.policeStation,
        registrationDate: new Date().toISOString(),
        incidentDate: firForm.incidentDate,
        incidentTime: firForm.incidentTime,
        incidentLocation: firForm.incidentLocation,
        offenceType: firForm.offenceType,
        actAndSections: firForm.actAndSections,
        description: firForm.description,
        investigatingOfficerId: firForm.investigatingOfficerId,
        investigatingOfficerName: assignedOfficer?.fullName || 'Inspector Rajesh Kumar',
        investigatingOfficerRank: assignedOfficer?.rank || 'Inspector',
        status: 'Investigation',
        remarks: firForm.remarks,
      });

      setIsSubmittingFir(false);
      setNewFirModalOpen(false);
      setFirConversionComplaint(null);

      // Pre-select this FIR for the status workflow tab
      setStatusUpdateForm((prev) => ({
        ...prev,
        firNumber: generatedFirNumber,
        newStatus: 'Investigation',
      }));

      // Automatically launch the live progression milestone tick marks modal!
      setLiveProgressionData({
        firNumber: generatedFirNumber,
        complaintId: firForm.complaintId,
        offenceType: firForm.offenceType,
        citizenName: firForm.citizenName,
        investigatingOfficerName: assignedOfficer?.fullName || 'Inspector Rajesh Kumar',
        policeStation: firForm.policeStation,
      });
    }, 1500);
  };

  // Submit Complaint verification
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalComplaint) return;

    verifyComplaint(
      verifyModalComplaint.id,
      verifyForm.action,
      verifyForm.remarks || `Marked ${verifyForm.action} by station authority.`,
      verifyForm.assignedOfficerId
    );

    setVerifyModalComplaint(null);
  };

  // Submit Evidence
  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvidence({
      firNumber: evidenceForm.firNumber,
      evidenceType: evidenceForm.evidenceType,
      description: evidenceForm.description,
      collectedDate: evidenceForm.collectedDate,
      collectedLocation: evidenceForm.collectedLocation,
      collectedBy: evidenceForm.collectedBy,
      fileName: evidenceForm.fileName,
      fileSize: evidenceForm.fileSize,
      isCitizenVisible: evidenceForm.isCitizenVisible,
      chainOfCustodyRemarks: evidenceForm.chainOfCustodyRemarks,
    });

    setAddEvidenceModalOpen(false);
    setActiveTab('evidence');
  };

  // Submit Case Status update
  const handleStatusUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateForm.firNumber) return;

    updateCaseStatus(
      statusUpdateForm.firNumber,
      statusUpdateForm.newStatus,
      statusUpdateForm.remarks || `Case status shifted to ${statusUpdateForm.newStatus}.`
    );

    setStatusUpdateForm((prev) => ({ ...prev, remarks: '' }));
  };

  // Submit Officer
  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOfficer({
      fullName: officerForm.fullName,
      badgeNumber: officerForm.badgeNumber,
      rank: officerForm.rank,
      policeStation: officerForm.policeStation,
      department: officerForm.department,
      phone: officerForm.phone,
      email: officerForm.email,
      joiningDate: officerForm.joiningDate,
      status: officerForm.status,
    });
    setAddOfficerModalOpen(false);
  };

  // CSV Export utility
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'COMPLAINTS') {
      csvContent += 'Complaint ID,Citizen Name,Title,Category,Date,Location,Status,FIR Number\n';
      complaints.forEach((c) => {
        csvContent += `"${c.id}","${c.citizenName}","${c.title}","${c.category}","${c.incidentDate}","${c.incidentLocation}","${c.status}","${c.firNumber || ''}"\n`;
      });
    } else if (reportType === 'FIRS') {
      csvContent += 'FIR Number,Complaint ID,Complainant,Police Station,Date,Offence,Sections,Officer,Status\n';
      firs.forEach((f) => {
        csvContent += `"${f.id}","${f.complaintId}","${f.citizenName}","${f.policeStation}","${f.incidentDate}","${f.offenceType}","${f.actAndSections}","${f.investigatingOfficerName}","${f.status}"\n`;
      });
    } else if (reportType === 'INVESTIGATIONS') {
      csvContent += 'Investigation ID,FIR Number,Officer,Start Date,Status,Findings\n';
      investigations.forEach((i) => {
        csvContent += `"${i.id}","${i.firNumber}","${i.officerName}","${i.startDate}","${i.status}","${i.findings.replace(/"/g, '""')}"\n`;
      });
    } else if (reportType === 'EVIDENCE') {
      csvContent += 'Evidence ID,FIR Number,Type,Description,Collected Date,Collected By,Citizen Visible\n';
      evidence.forEach((e) => {
        csvContent += `"${e.id}","${e.firNumber}","${e.evidenceType}","${e.description}","${e.collectedDate}","${e.collectedBy}","${e.isCitizenVisible}"\n`;
      });
    } else if (reportType === 'OFFICERS') {
      csvContent += 'Officer ID,Name,Badge,Rank,Station,Department,Phone,Status,Cases Assigned\n';
      officers.forEach((o) => {
        csvContent += `"${o.id}","${o.fullName}","${o.badgeNumber}","${o.rank}","${o.policeStation}","${o.department}","${o.phone}","${o.status}","${o.assignedCasesCount}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Police_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Police Command Banner */}
      <div className="bg-slate-950 text-white rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentUser?.role === 'ADMIN' ? 'Command Administration' : 'Police Officer Console'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Badge #{currentUser?.badgeNumber || 'POL-IND-8821'} · {currentUser?.policeStation}
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {currentUser?.fullName} ({currentUser?.rank || 'Inspector'})
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Centralized FIR registration docket, statutory case verification, forensic evidence custodian, and status management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFirConversionComplaint(null);
              setFirForm({
                complaintId: '',
                citizenName: 'Direct Informant',
                citizenPhone: '+91 98000 00000',
                citizenAddress: 'Station Jurisdiction Precinct',
                citizenId: 'USR-CIT-001',
                policeStation: currentUser?.policeStation || 'Central Metropolitan Station - Sector 4',
                incidentDate: new Date().toISOString().split('T')[0],
                incidentTime: '12:00 PM',
                incidentLocation: 'Sector 4 Junction',
                offenceType: 'Theft / Criminal Trespass',
                actAndSections: 'Section 379/447 IPC',
                description: 'Direct FIR registration under station in-charge supervision.',
                investigatingOfficerId: officers[0]?.id || '',
                remarks: 'Registered directly under CrPC 154.',
              });
              setNewFirModalOpen(true);
            }}
            className="px-3 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Register New FIR
          </button>

          <button
            onClick={() => setAddEvidenceModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            Add Evidence
          </button>
        </div>
      </div>

      {/* Main Admin / Police Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-1 no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'complaints', label: `Complaints (${pendingVerification} pending)`, icon: FileText },
          { id: 'firs', label: `FIR Management (${totalFirs})`, icon: Shield },
          { id: 'investigations', label: `Investigations (${activeInvestigations})`, icon: FolderOpen },
          { id: 'evidence', label: `Evidence (${totalEvidence})`, icon: Camera },
          { id: 'officers', label: `Police Officers (${totalOfficers})`, icon: Users },
          { id: 'status', label: 'Case Status & Close', icon: Activity },
          { id: 'completed', label: `Completed & Archives (${closedCases + completedComplaints})`, icon: CheckCircle2 },
          { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'profile', label: 'Officer Profile', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-900 text-blue-900 font-semibold bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: POLICE DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total Complaints', value: totalComplaints, icon: FileText, color: 'text-slate-900' },
              { label: 'Pending Verify', value: pendingVerification, icon: Clock, color: 'text-amber-600' },
              { label: 'Total FIRs', value: totalFirs, icon: Shield, color: 'text-indigo-900' },
              { label: 'Active Inv.', value: activeInvestigations, icon: FolderOpen, color: 'text-blue-800' },
              { label: 'Evidence Logs', value: totalEvidence, icon: Camera, color: 'text-emerald-700' },
              { label: 'Cases Closed', value: closedCases, icon: CheckCircle, color: 'text-teal-700' },
              { label: 'Officers Roster', value: totalOfficers, icon: Users, color: 'text-purple-700' },
              {
                label: 'Clearance Rate',
                value: `${totalFirs > 0 ? Math.round((closedCases / totalFirs) * 100) : 0}%`,
                icon: Activity,
                color: 'text-emerald-800',
              },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] font-medium uppercase truncate">{m.label}</span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className={`text-xl font-bold font-mono tabular-nums ${m.color}`}>
                    {m.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Pending Verification Action Queue */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Priority Action: Complaints Awaiting Police Verification ({pendingVerification})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs text-blue-900 font-semibold hover:underline"
              >
                Go to Verification Table &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Complaint ID</th>
                    <th className="py-2.5 px-4">Complainant</th>
                    <th className="py-2.5 px-4">Offence Title</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Date Reported</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints
                    .filter((c) => c.status === 'Submitted' || c.status === 'Under Verification')
                    .slice(0, 4)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-amber-50/20 transition">
                        <td className="py-2.5 px-4 font-mono font-medium text-blue-900">{c.id}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{c.citizenName}</td>
                        <td className="py-2.5 px-4 max-w-xs truncate">{c.title}</td>
                        <td className="py-2.5 px-4 text-slate-500">{c.category}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{c.incidentDate}</td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setVerifyModalComplaint(c);
                              setVerifyForm({
                                action: 'Approved',
                                remarks: 'Verified by inspecting police personnel.',
                                assignedOfficerId: officers[0]?.id || '',
                              });
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300"
                          >
                            Verify / Approve
                          </button>
                          <button
                            onClick={() => handleOpenFirFromComplaint(c)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300"
                          >
                            Convert to FIR
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent FIRs & Active Investigations split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Registered FIRs */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Active FIR Dockets
                </h4>
                <button
                  onClick={() => setActiveTab('firs')}
                  className="text-xs text-blue-900 font-semibold hover:underline"
                >
                  View All FIRs ({totalFirs})
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {firs.slice(0, 3).map((f) => (
                  <div key={f.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-950">{f.id}</span>
                        <StatusBadge status={f.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-800 mt-1">{f.offenceType}</p>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        IO: {f.investigatingOfficerName} · Station: {f.policeStation}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFirForPrint(f)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded"
                    >
                      Print Form
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Officer Duty Load */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Investigating Officers Workload
                </h4>
                <button
                  onClick={() => setActiveTab('officers')}
                  className="text-xs text-blue-900 font-semibold hover:underline"
                >
                  Manage Roster ({totalOfficers})
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {officers.slice(0, 4).map((o) => (
                  <div key={o.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{o.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {o.badgeNumber} · {o.rank}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-blue-100 text-blue-900">
                        {o.assignedCasesCount} active {o.assignedCasesCount === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLAINTS MANAGEMENT */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Quick Filter Buttons including Pending Verify & Completed */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All Complaints (${complaints.length})` },
              { id: 'PENDING', label: `Pending Verify (${pendingVerification})`, highlight: 'bg-amber-100 text-amber-900 border-amber-300' },
              { id: 'COMPLETED', label: `Completed / Approved (${complaints.filter((c) => c.status === 'Approved').length})`, highlight: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
              { id: 'FIR', label: `FIR Registered (${complaints.filter((c) => c.status === 'FIR Registered').length})` },
              { id: 'CLOSED', label: `Case Closed (${complaints.filter((c) => c.status === 'Case Closed').length})` },
            ].map((fTab) => {
              const isSelected = complaintFilterTab === fTab.id;
              return (
                <button
                  key={fTab.id}
                  onClick={() => {
                    setComplaintFilterTab(fTab.id as any);
                    if (fTab.id === 'ALL') setComplaintStatusFilter('ALL');
                    else if (fTab.id === 'PENDING') setComplaintStatusFilter('Under Verification');
                    else if (fTab.id === 'COMPLETED') setComplaintStatusFilter('Approved');
                    else if (fTab.id === 'FIR') setComplaintStatusFilter('FIR Registered');
                    else if (fTab.id === 'CLOSED') setComplaintStatusFilter('Case Closed');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : fTab.highlight || 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {fTab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Complaint ID, citizen name, location, or offence..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={complaintStatusFilter}
                onChange={(e) => {
                  setComplaintStatusFilter(e.target.value);
                  setComplaintFilterTab('ALL');
                }}
                className="text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted (New)</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Approved">Approved (Completed)</option>
                <option value="Rejected">Rejected</option>
                <option value="FIR Registered">FIR Registered</option>
                <option value="Case Closed">Case Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Citizen Name</th>
                    <th className="py-3 px-4">Complaint Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned IO</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {complaints
                    .filter((c) => {
                      const matchesSearch =
                        c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        c.citizenName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        c.incidentLocation.toLowerCase().includes(complaintSearch.toLowerCase());
                      
                      let matchesFilter = true;
                      if (complaintFilterTab === 'PENDING') {
                        matchesFilter = c.status === 'Submitted' || c.status === 'Under Verification';
                      } else if (complaintFilterTab === 'COMPLETED') {
                        matchesFilter = c.status === 'Approved';
                      } else if (complaintFilterTab === 'FIR') {
                        matchesFilter = c.status === 'FIR Registered';
                      } else if (complaintFilterTab === 'CLOSED') {
                        matchesFilter = c.status === 'Case Closed';
                      } else if (complaintStatusFilter !== 'ALL') {
                        matchesFilter = c.status === complaintStatusFilter;
                      }

                      return matchesSearch && matchesFilter;
                    })
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-medium text-blue-900">{c.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{c.citizenName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.citizenPhone}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-900 truncate">{c.title}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{c.category}</td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap">{c.incidentDate}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{c.incidentLocation}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4">
                          {c.assignedOfficerName || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                          >
                            View
                          </button>
                          {c.status !== 'FIR Registered' && c.status !== 'Case Closed' && (
                            <>
                              {/* Direct Completed button */}
                              {c.status !== 'Approved' && (
                                <button
                                  onClick={() => handleMarkComplaintCompleted(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-2xs transition"
                                  title="Mark Complaint Verification as Completed and Approved"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Completed</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setVerifyModalComplaint(c);
                                  setVerifyForm({
                                    action: 'Approved',
                                    remarks: c.verificationRemarks || '',
                                    assignedOfficerId: c.assignedOfficerId || officers[0]?.id || '',
                                  });
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleOpenFirFromComplaint(c)}
                                className="px-2 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300"
                              >
                                Convert to FIR
                              </button>
                            </>
                          )}
                          {c.status === 'Approved' && !c.firNumber && (
                            <button
                              onClick={() => handleOpenFirFromComplaint(c)}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-300"
                            >
                              Register FIR
                            </button>
                          )}
                          {c.firNumber && (
                            <span className="text-[11px] font-mono text-indigo-900 font-bold ml-1">
                              {c.firNumber}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPLETED COMPLAINTS BOTTOM CONSOLE BAR */}
          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Complaints Verification Bottom Console
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                    {Math.round((complaints.filter((c) => c.status === 'Approved' || c.status === 'FIR Registered' || c.status === 'Case Closed').length / (complaints.length || 1)) * 100)}% Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-white">{complaints.filter((c) => c.status === 'Approved').length} Completed / Approved</strong> · {pendingVerification} Pending Verification · {complaints.filter((c) => c.status === 'FIR Registered').length} Converted to FIR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setComplaintFilterTab('COMPLETED');
                  setComplaintStatusFilter('Approved');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-md transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>View Completed Complaints</span>
              </button>

              {pendingVerification > 0 && (
                <button
                  type="button"
                  onClick={handleBatchCompletePendingComplaints}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-md transition shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Batch Complete Pending ({pendingVerification})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIR MANAGEMENT */}
      {activeTab === 'firs' && (
        <div className="space-y-4">
          {/* Quick Filter Buttons including Completed */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All FIRs (${totalFirs})` },
              { id: 'ACTIVE', label: `Active Investigation (${firs.filter((f) => f.status === 'Investigation').length})` },
              { id: 'REVIEW', label: `Under Review (${firs.filter((f) => f.status === 'Under Review').length})` },
              { id: 'COMPLETED', label: `Completed / Case Closed (${closedCases})`, highlight: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
            ].map((fTab) => {
              const isSelected = firFilterTab === fTab.id;
              return (
                <button
                  key={fTab.id}
                  onClick={() => {
                    setFirFilterTab(fTab.id as any);
                    if (fTab.id === 'ALL') setFirStatusFilter('ALL');
                    else if (fTab.id === 'ACTIVE') setFirStatusFilter('Investigation');
                    else if (fTab.id === 'REVIEW') setFirStatusFilter('Under Review');
                    else if (fTab.id === 'COMPLETED') setFirStatusFilter('Case Closed');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : fTab.highlight || 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {fTab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search FIR by number, complainant, police station, or IPC/BNS section..."
                value={firSearch}
                onChange={(e) => setFirSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={firStatusFilter}
                onChange={(e) => {
                  setFirStatusFilter(e.target.value);
                  setFirFilterTab('ALL');
                }}
                className="text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5"
              >
                <option value="ALL">All Case Stages</option>
                <option value="FIR Registered">FIR Registered</option>
                <option value="Investigation">Investigation Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Rework">Rework</option>
                <option value="Case Closed">Case Closed (Completed)</option>
              </select>

              <button
                onClick={() => {
                  setFirConversionComplaint(null);
                  setNewFirModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded hover:bg-blue-800 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                New FIR
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firs
              .filter((f) => {
                const matchesSearch =
                  f.id.toLowerCase().includes(firSearch.toLowerCase()) ||
                  f.citizenName.toLowerCase().includes(firSearch.toLowerCase()) ||
                  f.policeStation.toLowerCase().includes(firSearch.toLowerCase()) ||
                  f.actAndSections.toLowerCase().includes(firSearch.toLowerCase()) ||
                  f.offenceType.toLowerCase().includes(firSearch.toLowerCase());
                
                let matchesStatus = true;
                if (firFilterTab === 'ACTIVE') {
                  matchesStatus = f.status === 'Investigation';
                } else if (firFilterTab === 'REVIEW') {
                  matchesStatus = f.status === 'Under Review';
                } else if (firFilterTab === 'COMPLETED') {
                  matchesStatus = f.status === 'Case Closed';
                } else if (firStatusFilter !== 'ALL') {
                  matchesStatus = f.status === firStatusFilter;
                }

                return matchesSearch && matchesStatus;
              })
              .map((f) => {
                const inv = investigations.find((i) => i.firNumber === f.id);
                const evCount = evidence.filter((e) => e.firNumber === f.id).length;

                return (
                  <div
                    key={f.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 pb-2.5 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">
                            State Criminal Register
                          </span>
                          <span className="text-base font-bold font-mono text-blue-950">
                            {f.id}
                          </span>
                        </div>
                        <StatusBadge status={f.status} />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Offence / Sections:</span>
                          <span className="font-semibold text-slate-900 block">{f.offenceType}</span>
                          <span className="font-mono text-blue-900 text-[11px]">{f.actAndSections}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-slate-500 block text-[11px]">Complainant:</span>
                            <span className="font-medium text-slate-800">{f.citizenName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Date Reg:</span>
                            <span className="font-mono text-slate-700">
                              {new Date(f.registrationDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Investigating Officer (I.O.):</span>
                          <span className="font-medium text-slate-900">
                            {f.investigatingOfficerName} ({f.investigatingOfficerRank})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                          <span>Evidence Recorded: <strong className="text-slate-800">{evCount}</strong></span>
                          <span>Inv. Diary: <strong className="text-slate-800">{inv?.notes.length || 0} entries</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* FIR CARD BOTTOM ACTION AREA */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setStatusUpdateForm({
                                firNumber: f.id,
                                newStatus: f.status,
                                remarks: '',
                              });
                              setActiveTab('status');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => {
                              setNewNoteFir(f.id);
                              setActiveTab('investigations');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                          >
                            Add Diary
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedFirForPrint(f)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 rounded border border-slate-300"
                          title="Print Official FIR Document Form"
                        >
                          <Printer className="w-3 h-3 text-slate-600" />
                          Print
                        </button>
                      </div>

                      {/* Prominent Completed Bottom Action Bar */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                        {f.status !== 'Case Closed' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCompleteConfirmModal({
                                isOpen: true,
                                type: 'FIR',
                                id: f.id,
                                title: `Complete & Close FIR Docket: ${f.id}`,
                                defaultRemarks: `Statutory investigation concluded for ${f.offenceType}. All evidence secured, charge sheet prepared and submitted to court. Docket formally closed.`,
                                actionLabel: 'Complete & Close FIR Docket',
                                onConfirm: (remarks) => handleMarkFirCompleted(f.id, remarks),
                              });
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md transition shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Mark Completed / Close Case</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-[11px]">
                            <span className="font-bold text-emerald-900 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✓ Case Completed & Closed</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedClosedCaseForCert(f)}
                              className="font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                            >
                              <Award className="w-3 h-3" />
                              <span>Disposal Cert</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* COMPLETED FIRS BOTTOM CONSOLE BAR */}
          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    FIR Clearance & Case Closure Bottom Console
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                    {totalFirs > 0 ? Math.round((closedCases / totalFirs) * 100) : 0}% Disposal Rate
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-white">{closedCases} Closed / Completed FIRs</strong> · {totalFirs - closedCases} Active Dockets in Roster
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFirFilterTab('COMPLETED');
                  setFirStatusFilter('Case Closed');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-md transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Show Completed Cases ({closedCases})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-md transition shadow-2xs flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Open Completed Archives</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVESTIGATIONS MANAGEMENT */}
      {activeTab === 'investigations' && (
        <div className="space-y-6">
          {/* Quick Filter Buttons including Completed */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: `All Investigations (${investigations.length})` },
                { id: 'ACTIVE', label: `Active / In Progress (${activeInvestigations})`, highlight: 'bg-blue-100 text-blue-900 border-blue-300' },
                { id: 'COMPLETED', label: `Completed Dockets (${completedInvestigations})`, highlight: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
              ].map((fTab) => {
                const isSelected = investigationFilterTab === fTab.id;
                return (
                  <button
                    key={fTab.id}
                    onClick={() => setInvestigationFilterTab(fTab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : fTab.highlight || 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {fTab.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {investigations.filter((i) => investigationFilterTab === 'ALL' || (investigationFilterTab === 'ACTIVE' ? i.status !== 'Completed' : i.status === 'Completed')).length} Investigation Files
            </div>
          </div>

          {/* Quick Add Diary Note Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-900" />
              Add Investigation Diary Entry / Forensic Note
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target FIR Docket
                </label>
                <select
                  value={newNoteFir}
                  onChange={(e) => setNewNoteFir(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                >
                  {firs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} - {f.offenceType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Investigating Officer Notes / Statements
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conducted site interrogation of witness Suresh; seized local security logs..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newNoteText.trim()) return;
                    addInvestigationNote(newNoteFir, newNoteText);
                    setNewNoteText('');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded transition shrink-0"
                >
                  Append Note
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Investigation Dockets */}
          <div className="space-y-4">
            {investigations
              .filter((inv) => {
                if (investigationFilterTab === 'ACTIVE') return inv.status !== 'Completed';
                if (investigationFilterTab === 'COMPLETED') return inv.status === 'Completed';
                return true;
              })
              .map((inv) => {
              const linkedFir = firs.find((f) => f.id === inv.firNumber);

              return (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-blue-950">{inv.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-xs font-semibold text-indigo-900">
                          FIR: {inv.firNumber}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-600">{linkedFir?.offenceType}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Assigned IO: <strong className="text-slate-800">{inv.officerName}</strong> · Started: {inv.startDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.status} />
                      {inv.completionDate && (
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Concluded: {inv.completionDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      Key Findings & Forensic Synthesis:
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                      {inv.findings}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Official Investigation Case Diary ({inv.notes.length} log entries):
                    </span>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {inv.notes.map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5 font-mono">
                            <span className="font-semibold text-slate-700">{n.officerName}</span>
                            <span>{n.date}</span>
                          </div>
                          <p className="text-slate-800">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INVESTIGATION CARD BOTTOM ACTION BAR */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {inv.status !== 'Completed' ? (
                      <>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setCompleteConfirmModal({
                                isOpen: true,
                                type: 'INVESTIGATION',
                                id: inv.firNumber,
                                title: `Complete Investigation Docket: ${inv.id}`,
                                defaultRemarks: `Investigation under IO ${inv.officerName} successfully concluded. All evidence compiled, witness statements documented, and charge sheet prepared for prosecution.`,
                                actionLabel: 'Mark Investigation as Completed',
                                onConfirm: (remarks) => handleMarkInvestigationCompleted(inv.firNumber, remarks),
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md transition shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Mark Investigation Completed</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewNoteFir(inv.firNumber);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition"
                          >
                            + Add Diary Note
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Advance Stage:</span>
                          <select
                            value={inv.status}
                            onChange={(e) => {
                              const newSt = e.target.value as InvestigationStatus;
                              createOrUpdateInvestigation(inv.firNumber, {
                                status: newSt,
                                ...(newSt === 'Completed' ? { completionDate: new Date().toISOString().split('T')[0] } : {}),
                              });
                              addInvestigationNote(inv.firNumber, `Stage updated to ${newSt} by IO ${inv.officerName}.`);
                            }}
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
                          >
                            <option value="Initiated">Initiated</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Witness Interrogated">Witness Interrogated</option>
                            <option value="Forensic Analysis">Forensic Analysis</option>
                            <option value="Charge Sheet Prepared">Charge Sheet Prepared</option>
                            <option value="Completed">✓ Mark Completed</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-950">
                            ✓ Investigation Concluded & Completed on {inv.completionDate || '2026-09-28'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {linkedFir && (
                            <button
                              type="button"
                              onClick={() => setSelectedClosedCaseForCert(linkedFir)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 rounded transition flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Case Clearance Cert</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setNewNoteFir(inv.firNumber);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                          >
                            + Post-Closure Log
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COMPLETED INVESTIGATIONS BOTTOM CONSOLE BAR */}
          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Investigations Clearance & Completion Bottom Console
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                    {completedInvestigations} / {investigations.length} Completed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-white">{completedInvestigations} Formal Investigations Finalized</strong> · {activeInvestigations} Ongoing Inquiries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInvestigationFilterTab('COMPLETED')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-md transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Show Completed Investigations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-md transition shadow-2xs flex items-center gap-1.5"
              >
                <span>Proceed to Case Closure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EVIDENCE MANAGEMENT */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Evidence Repository & Chain of Custody Log
              </h4>
              <p className="text-xs text-slate-500">
                Strict access control prevents unauthorized disclosure of forensic documents to civilians.
              </p>
            </div>
            <button
              onClick={() => setAddEvidenceModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded hover:bg-blue-800 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Evidence Record
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Evidence ID</th>
                    <th className="py-3 px-4">Linked FIR</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Collected Date & Location</th>
                    <th className="py-3 px-4">Collected By</th>
                    <th className="py-3 px-4">Citizen Visible</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {evidence.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{ev.id}</td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-900">
                        {ev.firNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 border border-slate-200">
                          {ev.evidenceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900">{ev.description}</div>
                        {ev.fileName && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            File: {ev.fileName} ({ev.fileSize || 'Attached'})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>{ev.collectedDate}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {ev.collectedLocation}
                        </div>
                      </td>
                      <td className="py-3 px-4">{ev.collectedBy}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleEvidenceCitizenVisibility(ev.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                            ev.isCitizenVisible
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title="Click to toggle visibility in citizen portal"
                        >
                          {ev.isCitizenVisible ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-500" />
                              Confidential
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove evidence record ${ev.id}?`)) {
                              deleteEvidence(ev.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete evidence record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: POLICE OFFICERS */}
      {activeTab === 'officers' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Registered Police Officers & Station Personnel
              </h4>
              <p className="text-xs text-slate-500">
                Manage service numbers, rank hierarchy, department squads, and case allocations
              </p>
            </div>
            <button
              onClick={() => setAddOfficerModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded hover:bg-blue-800 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Police Officer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {officer.rank}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{officer.fullName}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        officer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {officer.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Badge / Service ID:</span>
                      <span className="font-mono font-medium text-slate-900">
                        {officer.badgeNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Police Station:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">
                        {officer.policeStation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="truncate max-w-[180px]">{officer.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Official Contact:</span>
                      <span className="font-mono">{officer.phone}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Assigned Active Cases:</span>
                      <span className="font-mono font-bold text-blue-900">
                        {officer.assignedCasesCount} FIRs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Joined: {officer.joiningDate}
                  </span>
                  <button
                    onClick={() => {
                      const newStatus = officer.status === 'Active' ? 'On Leave' : 'Active';
                      updateOfficer(officer.id, { status: newStatus });
                    }}
                    className="text-xs text-blue-900 hover:underline font-medium"
                  >
                    Toggle {officer.status === 'Active' ? 'Leave' : 'Active'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CASE STATUS WORKFLOW */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Quick Filter Buttons for Case Stages */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: `All Case Dockets (${firs.length})` },
                { id: 'ACTIVE', label: `Active Workflow (${firs.filter((f) => f.status !== 'Case Closed').length})`, highlight: 'bg-blue-100 text-blue-900 border-blue-300' },
                { id: 'COMPLETED', label: `Completed / Closed Cases (${closedCases})`, highlight: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
              ].map((fTab) => {
                const isSelected = statusFilterTab === fTab.id;
                return (
                  <button
                    key={fTab.id}
                    onClick={() => setStatusFilterTab(fTab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : fTab.highlight || 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {fTab.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Clearance Rate: <strong className="text-emerald-700 font-bold">{totalFirs > 0 ? Math.round((closedCases / totalFirs) * 100) : 0}%</strong> ({closedCases} Cases Disposed)
            </div>
          </div>

          {/* Active Case Timeline with Milestones & Tick Marks */}
          {(() => {
            const currentFir = firs.find((f) => f.id === statusUpdateForm.firNumber) || firs[0];
            if (!currentFir) return null;
            const parentComplaint = complaints.find((c) => c.id === currentFir.complaintId);
            const inv = investigations.find((i) => i.firNumber === currentFir.id);
            const ev = evidence.filter((e) => e.firNumber === currentFir.id);

            return (
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Active Case Tracking Timeline
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-blue-950">{currentFir.id}</span>
                      <span className="text-xs text-slate-500 font-medium">· {currentFir.offenceType} ({currentFir.citizenName})</span>
                      <StatusBadge status={currentFir.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentFir.status !== 'Case Closed' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCompleteConfirmModal({
                            isOpen: true,
                            type: 'FIR',
                            id: currentFir.id,
                            title: `Complete & Close Case Docket: ${currentFir.id}`,
                            defaultRemarks: `Investigation finalized for ${currentFir.offenceType}. Charge sheet filed and registered with Court of Judicial Magistrate. Matter closed.`,
                            actionLabel: 'Complete & Close Case Docket',
                            onConfirm: (remarks) => handleMarkFirCompleted(currentFir.id, remarks),
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Complete Case</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedClosedCaseForCert(currentFir)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Disposal Certificate</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setLiveProgressionData({
                          firNumber: currentFir.id,
                          complaintId: currentFir.complaintId,
                          offenceType: currentFir.offenceType,
                          citizenName: currentFir.citizenName,
                          investigatingOfficerName: currentFir.investigatingOfficerName,
                          policeStation: currentFir.policeStation,
                        });
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Replay Milestone Tick Marks</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFirForPrint(currentFir)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print FIR</span>
                    </button>
                  </div>
                </div>

                <StatusTimeline
                  currentStatus={currentFir.status}
                  hasFir={true}
                  hasOfficer={!!currentFir.investigatingOfficerName}
                  hasInvestigation={!!inv}
                  hasEvidence={ev.length > 0}
                  history={statusHistory.filter(
                    (h) => h.firNumber === currentFir.id || (parentComplaint && h.complaintId === parentComplaint.id)
                  )}
                />
              </div>
            );
          })()}

          {/* Quick Case Closure Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                Statutory Case Status Progression Console
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                Transition FIR investigation milestones. Every update creates an immutable audit trail entry and dispatches instant status notifications to the complainant.
              </p>

              <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target FIR Docket *
                  </label>
                  <select
                    value={statusUpdateForm.firNumber}
                    onChange={(e) => {
                      const selected = firs.find((f) => f.id === e.target.value);
                      setStatusUpdateForm({
                        firNumber: e.target.value,
                        newStatus: selected?.status || 'Investigation',
                        remarks: '',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                  >
                    {firs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.id} - {f.offenceType} ({f.citizenName}) [Current: {f.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Case Stage / Status *
                    </label>
                    <select
                      value={statusUpdateForm.newStatus}
                      onChange={(e) =>
                        setStatusUpdateForm({
                          ...statusUpdateForm,
                          newStatus: e.target.value as FirStatus,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-semibold"
                    >
                      <option value="FIR Registered">FIR Registered</option>
                      <option value="Investigation">Investigation (In Progress)</option>
                      <option value="Under Review">Under Review (Supervisory Check)</option>
                      <option value="Rework">Rework (Additional Evidence Needed)</option>
                      <option value="Case Closed">Case Closed (Disposed / Completed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transition Authorized By
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser?.rank || 'Inspector'} ${currentUser?.fullName}`}
                      className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Case Status Remarks / Reason for Transition *
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setStatusUpdateForm((prev) => ({
                            ...prev,
                            newStatus: 'Case Closed',
                            remarks: 'Charge sheet prepared and submitted to Judicial Magistrate 1st Class Court; all recovered property delivered under security bond. Case closed.',
                          }))
                        }
                        className="text-[10px] text-blue-900 font-semibold hover:underline"
                      >
                        Insert Charge Sheet Template
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Charge sheet prepared and submitted to Judicial Magistrate 1st Class Court; all recovered property delivered under security bond."
                    value={statusUpdateForm.remarks}
                    onChange={(e) =>
                      setStatusUpdateForm({ ...statusUpdateForm, remarks: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded transition"
                  >
                    Commit Case Status Transition & Notify Citizen
                  </button>

                  {statusUpdateForm.firNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = firs.find((f) => f.id === statusUpdateForm.firNumber);
                        if (target) {
                          setCompleteConfirmModal({
                            isOpen: true,
                            type: 'FIR',
                            id: target.id,
                            title: `Complete & Close Case Docket: ${target.id}`,
                            defaultRemarks: `Investigation finalized for ${target.offenceType}. Final police disposal report registered. Case file closed.`,
                            actionLabel: 'Complete & Close Case Docket',
                            onConfirm: (remarks) => handleMarkFirCompleted(target.id, remarks),
                          });
                        }
                      }}
                      className="py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>One-Click Complete & Close</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Fast Case Close Options Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    One-Click Case Closure Reasons
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Click any standard legal closure category to autofill official statutory remarks and mark the case as Closed.
                </p>

                <div className="space-y-2">
                  {[
                    {
                      label: 'Charge-sheet Filed (CrPC 173 / BNSS 193)',
                      text: 'Final Investigation Report & Charge sheet submitted to Jurisdictional Criminal Court. Cognizance taken. Police docket completed & closed.',
                    },
                    {
                      label: 'Accused Apprehended & Trial Disposed',
                      text: 'Principal accused apprehended and produced before court. Recovered assets restored to complainant. Investigation completed and case closed.',
                    },
                    {
                      label: 'Compounded / Mutual Settlement',
                      text: 'Parties reached voluntary statutory settlement under CrPC 320 before mediation cell. FIR closed as compounded.',
                    },
                    {
                      label: 'Final Untraced / Insufficient Evidence',
                      text: 'Exhaustive cyber forensic and field probe yielded no identifiable suspect leads despite maximal efforts. Final closure report submitted to magistrate.',
                    },
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setStatusUpdateForm((prev) => ({
                          ...prev,
                          newStatus: 'Case Closed',
                          remarks: cat.text,
                        }));
                      }}
                      className="w-full text-left p-2.5 bg-white border border-slate-200 hover:border-blue-900 rounded text-xs transition group"
                    >
                      <div className="font-semibold text-slate-800 group-hover:text-blue-900">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-500">
                <span>Note: Closing a case automatically marks its investigation as Completed and locks the file.</span>
              </div>
            </div>
          </div>

          {/* Audit History Log */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-sm">
                Case Status Transition Audit History ({statusHistory.length} recorded entries)
              </h4>
              <span className="text-xs text-slate-500 font-mono">Immutable Audit Log</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {statusHistory.map((h) => (
                <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-blue-900">{h.firNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700">{h.previousStatus}</span>
                      <span className="text-blue-600">&rarr;</span>
                      <StatusBadge status={h.newStatus} />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{h.remarks}</p>
                  </div>
                  <div className="text-right shrink-0 text-slate-500 font-mono text-[11px]">
                    <div className="font-semibold text-slate-700">{h.updatedBy}</div>
                    <div>{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLETED & CLOSED CASES REGISTRY CONSOLE */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Official Completed & Closed Cases Registry ({closedCases} Files Disposed)
                  </h4>
                  <p className="text-xs text-emerald-200">
                    Statutory completed FIRs archive with official disposal certificates and judicial closure records
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>View Full Completed Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">FIR Number</th>
                    <th className="py-3 px-4">Offence / Category</th>
                    <th className="py-3 px-4">Complainant</th>
                    <th className="py-3 px-4">Investigating Officer</th>
                    <th className="py-3 px-4">Police Station</th>
                    <th className="py-3 px-4">Closure Remarks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {firs
                    .filter((f) => f.status === 'Case Closed')
                    .map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{f.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{f.offenceType}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{f.actAndSections}</div>
                        </td>
                        <td className="py-3 px-4">{f.citizenName}</td>
                        <td className="py-3 px-4">{f.investigatingOfficerName}</td>
                        <td className="py-3 px-4">{f.policeStation}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-600">{f.remarks || 'Case formally concluded & closed.'}</td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedClosedCaseForCert(f)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Disposal Certificate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFirForPrint(f)}
                            className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                          >
                            Print FIR
                          </button>
                        </td>
                      </tr>
                    ))}
                  {closedCases === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No cases currently closed. Use the console above to mark cases as Completed / Closed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="text-xs bg-white border border-slate-300 rounded px-3 py-1.5 font-semibold text-slate-900"
                >
                  <option value="FIRS">First Information Reports (FIR)</option>
                  <option value="COMPLAINTS">Complaints Ledger</option>
                  <option value="INVESTIGATIONS">Investigation Progress Report</option>
                  <option value="EVIDENCE">Evidence Custody Register</option>
                  <option value="OFFICERS">Police Officers Roster</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-blue-900" />
                Export CSV Data
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Official Report
              </button>
            </div>
          </div>

          {/* Printable Report Table View */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-page p-6">
            <div className="text-center mb-6 pb-4 border-b border-slate-300">
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
                State Police Department · Departmental Crime Analysis Report
              </h3>
              <p className="text-xs text-slate-600 font-mono">
                Report Subject: {reportType} · Generated: {new Date().toLocaleString()} · Officer: {currentUser?.fullName}
              </p>
            </div>

            {reportType === 'FIRS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2">FIR Number</th>
                      <th className="p-2">Complainant</th>
                      <th className="p-2">Station</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Offence</th>
                      <th className="p-2">Legal Sections</th>
                      <th className="p-2">Investigating Officer</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {firs.map((f) => (
                      <tr key={f.id}>
                        <td className="p-2 font-mono font-bold text-blue-900">{f.id}</td>
                        <td className="p-2">{f.citizenName}</td>
                        <td className="p-2">{f.policeStation}</td>
                        <td className="p-2 font-mono">{f.incidentDate}</td>
                        <td className="p-2 font-medium">{f.offenceType}</td>
                        <td className="p-2 font-mono text-[11px]">{f.actAndSections}</td>
                        <td className="p-2">{f.investigatingOfficerName}</td>
                        <td className="p-2">
                          <StatusBadge status={f.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'COMPLAINTS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2">Complaint ID</th>
                      <th className="p-2">Citizen Name</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Incident Date</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">FIR Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2 font-mono font-bold text-blue-900">{c.id}</td>
                        <td className="p-2">{c.citizenName}</td>
                        <td className="p-2">{c.title}</td>
                        <td className="p-2">{c.category}</td>
                        <td className="p-2 font-mono">{c.incidentDate}</td>
                        <td className="p-2">{c.incidentLocation}</td>
                        <td className="p-2">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="p-2 font-mono">{c.firNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'INVESTIGATIONS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2">Inv ID</th>
                      <th className="p-2">FIR Ref</th>
                      <th className="p-2">Officer</th>
                      <th className="p-2">Start Date</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Findings Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {investigations.map((i) => (
                      <tr key={i.id}>
                        <td className="p-2 font-mono font-bold text-blue-900">{i.id}</td>
                        <td className="p-2 font-mono text-indigo-900">{i.firNumber}</td>
                        <td className="p-2">{i.officerName}</td>
                        <td className="p-2 font-mono">{i.startDate}</td>
                        <td className="p-2">
                          <StatusBadge status={i.status} />
                        </td>
                        <td className="p-2 leading-relaxed">{i.findings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'EVIDENCE' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2">Evidence ID</th>
                      <th className="p-2">FIR Ref</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Collected By</th>
                      <th className="p-2">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {evidence.map((e) => (
                      <tr key={e.id}>
                        <td className="p-2 font-mono font-bold text-blue-900">{e.id}</td>
                        <td className="p-2 font-mono text-indigo-900">{e.firNumber}</td>
                        <td className="p-2 font-medium">{e.evidenceType}</td>
                        <td className="p-2">{e.description}</td>
                        <td className="p-2 font-mono">{e.collectedDate}</td>
                        <td className="p-2">{e.collectedBy}</td>
                        <td className="p-2">
                          {e.isCitizenVisible ? 'Public / Visible' : 'Confidential / Police'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'OFFICERS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2">Officer ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Badge #</th>
                      <th className="p-2">Rank</th>
                      <th className="p-2">Station Precinct</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Active Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {officers.map((o) => (
                      <tr key={o.id}>
                        <td className="p-2 font-mono font-bold text-blue-900">{o.id}</td>
                        <td className="p-2 font-medium">{o.fullName}</td>
                        <td className="p-2 font-mono">{o.badgeNumber}</td>
                        <td className="p-2">{o.rank}</td>
                        <td className="p-2">{o.policeStation}</td>
                        <td className="p-2">{o.department}</td>
                        <td className="p-2 font-mono">{o.phone}</td>
                        <td className="p-2 font-mono font-bold">{o.assignedCasesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Police Command Broadcasts</h3>
              <p className="text-xs text-slate-500">
                System notifications triggered upon new citizen complaints, FIR registration and forensic entries
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              {notifications.length} Total
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-50 transition flex gap-3">
                <div className="mt-0.5 shrink-0 p-2 bg-blue-50 text-blue-900 rounded border border-blue-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-slate-900">{notif.title}</h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  {notif.referenceId && (
                    <span className="inline-block mt-1 text-[11px] font-mono text-blue-900 font-medium">
                      Ref: {notif.referenceId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: OFFICER PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Officer Service Record</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official credentials within State Police Roster
              </p>
            </div>
            <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-semibold">
              Role: {currentUser?.role}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold">Officer Identification:</span>
                <span className="font-mono text-slate-900 text-sm">{currentUser?.officerId || 'OFF-101'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Badge / Service Number:</span>
                <span className="font-mono text-slate-900 text-sm">{currentUser?.badgeNumber || 'POL-IND-8821'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold">Full Legal Name:</span>
                <span className="font-semibold text-slate-900 text-sm">{currentUser?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Rank / Designation:</span>
                <span className="font-medium text-slate-900 text-sm">{currentUser?.rank || 'Inspector of Police'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold">Station Precinct / Headquarters:</span>
              <span className="text-slate-900">{currentUser?.policeStation}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold">Official Email:</span>
                <span className="text-slate-900">{currentUser?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Official Wireless Contact:</span>
                <span className="font-mono text-slate-900">{currentUser?.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded mt-4">
              <span className="font-semibold text-slate-800 block mb-1">
                Authorization Scope:
              </span>
              <p className="text-slate-600 leading-relaxed">
                Full investigative authorization under Cr.P.C. Sec 156/157, crime docket registration, forensic evidence custody, and judicial court filing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: COMPLETED & ARCHIVED CASES */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {/* Header Command Banner */}
          <div className="bg-slate-950 text-white rounded-xl p-6 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Official Police Archival Custody
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  State Case Registry · All Disposed & Completed Dockets
                </span>
              </div>
              <h3 className="text-xl font-bold">
                Completed Dockets, Investigations & Closed Cases
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Centrally verified complaints, finalized investigation files with court charge-sheets, and statutory closed FIR dockets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportType('FIRS');
                  setActiveTab('reports');
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Export Archival Report</span>
              </button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Closed FIR Dockets</div>
              <div className="text-2xl font-bold font-mono text-emerald-800">{closedCases}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Court disposed & charge-sheeted</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Completed Investigations</div>
              <div className="text-2xl font-bold font-mono text-blue-900">{completedInvestigations}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Full forensic inquiry sealed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Verified Complaints</div>
              <div className="text-2xl font-bold font-mono text-indigo-900">{completedComplaints}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Approved by station authority</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Overall Clearance</div>
              <div className="text-2xl font-bold font-mono text-teal-800">
                {totalFirs > 0 ? Math.round((closedCases / totalFirs) * 100) : 0}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Resolved case quotient</div>
            </div>
          </div>

          {/* Sub-tabs and Search */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'ALL', label: `All Completed Matters (${closedCases + completedInvestigations + completedComplaints})` },
                { id: 'FIRS', label: `Closed FIRs (${closedCases})` },
                { id: 'INVESTIGATIONS', label: `Completed Investigations (${completedInvestigations})` },
                { id: 'COMPLAINTS', label: `Verified Complaints (${completedComplaints})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCompletedArchiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    completedArchiveTab === tab.id
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search completed files..."
                value={completedSearchQuery}
                onChange={(e) => setCompletedSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Records Display */}
          <div className="space-y-4">
            {/* SECTION 1: CLOSED FIRS */}
            {(completedArchiveTab === 'ALL' || completedArchiveTab === 'FIRS') && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Closed FIR Dockets ({closedCases})
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Disposed Cases
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">FIR Number</th>
                        <th className="py-2.5 px-4">Offence & Sections</th>
                        <th className="py-2.5 px-4">Complainant</th>
                        <th className="py-2.5 px-4">Investigating Officer</th>
                        <th className="py-2.5 px-4">Disposal Resolution</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {firs
                        .filter((f) => f.status === 'Case Closed')
                        .filter(
                          (f) =>
                            !completedSearchQuery ||
                            f.id.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                            f.citizenName.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                            f.offenceType.toLowerCase().includes(completedSearchQuery.toLowerCase())
                        )
                        .map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-blue-900">{f.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{f.offenceType}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{f.actAndSections}</div>
                            </td>
                            <td className="py-3 px-4">{f.citizenName}</td>
                            <td className="py-3 px-4">{f.investigatingOfficerName} ({f.investigatingOfficerRank})</td>
                            <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                              {f.remarks || 'Case closed upon full judicial filing.'}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedClosedCaseForCert(f)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition"
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Certificate</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLiveProgressionData({
                                    firNumber: f.id,
                                    complaintId: f.complaintId,
                                    offenceType: f.offenceType,
                                    citizenName: f.citizenName,
                                    investigatingOfficerName: f.investigatingOfficerName,
                                    policeStation: f.policeStation,
                                  });
                                }}
                                className="px-2 py-1 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition"
                              >
                                Replay Ticks
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedFirForPrint(f)}
                                className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                              >
                                Print FIR
                              </button>
                            </td>
                          </tr>
                        ))}
                      {closedCases === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No closed FIRs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 2: COMPLETED INVESTIGATIONS */}
            {(completedArchiveTab === 'ALL' || completedArchiveTab === 'INVESTIGATIONS') && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-900" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Completed Investigations ({completedInvestigations})
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    Formal Charge Sheets Finalized
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {investigations
                    .filter((i) => i.status === 'Completed')
                    .filter(
                      (i) =>
                        !completedSearchQuery ||
                        i.id.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                        i.firNumber.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                        i.officerName.toLowerCase().includes(completedSearchQuery.toLowerCase())
                    )
                    .map((inv) => {
                      const linkedFir = firs.find((f) => f.id === inv.firNumber);
                      return (
                        <div key={inv.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-950">{inv.id}</span>
                              <span className="text-slate-400">·</span>
                              <span className="font-mono font-semibold text-indigo-900">FIR: {inv.firNumber}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-600">{linkedFir?.offenceType}</span>
                              <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
                                Completed: {inv.completionDate || '2026-09-28'}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 line-clamp-1">{inv.findings}</p>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              IO: {inv.officerName} · Diary Entries: {inv.notes.length} logs
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {linkedFir && (
                              <button
                                type="button"
                                onClick={() => setSelectedClosedCaseForCert(linkedFir)}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Disposal Certificate</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNewNoteFir(inv.firNumber);
                                setActiveTab('investigations');
                              }}
                              className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                            >
                              View Docket
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  {completedInvestigations === 0 && (
                    <div className="p-6 text-center text-slate-400">
                      No completed investigations recorded yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3: VERIFIED COMPLAINTS */}
            {(completedArchiveTab === 'ALL' || completedArchiveTab === 'COMPLAINTS') && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-900" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Verified & Completed Complaints ({completedComplaints})
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                    Approved Citizen Filings
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Complaint ID</th>
                        <th className="py-2.5 px-4">Complainant</th>
                        <th className="py-2.5 px-4">Offence Title</th>
                        <th className="py-2.5 px-4">Date Incident</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {complaints
                        .filter((c) => c.status === 'Approved')
                        .filter(
                          (c) =>
                            !completedSearchQuery ||
                            c.id.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                            c.citizenName.toLowerCase().includes(completedSearchQuery.toLowerCase()) ||
                            c.title.toLowerCase().includes(completedSearchQuery.toLowerCase())
                        )
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                            <td className="py-3 px-4 font-medium">{c.citizenName}</td>
                            <td className="py-3 px-4 max-w-xs truncate">{c.title}</td>
                            <td className="py-3 px-4 font-mono">{c.incidentDate}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                ✓ Verified & Completed
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedComplaint(c)}
                                className="px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                              >
                                View File
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenFirFromComplaint(c)}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300"
                              >
                                Register FIR
                              </button>
                            </td>
                          </tr>
                        ))}
                      {completedComplaints === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No verified complaints found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Archival Bottom Console */}
          <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  State Police Department · Central Disposal Archive Repository
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  All cases marked as Completed or Closed are secured in immutable departmental audit archives with full chain-of-custody retention.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded-md transition shadow-2xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Archive Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY COMPLAINT MODAL */}
      {verifyModalComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Verify Complaint: {verifyModalComplaint.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{verifyModalComplaint.title}</p>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Decision *
                </label>
                <select
                  value={verifyForm.action}
                  onChange={(e) =>
                    setVerifyForm({
                      ...verifyForm,
                      action: e.target.value as 'Approved' | 'Rejected' | 'Under Verification',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-semibold"
                >
                  <option value="Approved">Approve (Proceed to FIR Registration)</option>
                  <option value="Under Verification">Under Verification (Keep Pending)</option>
                  <option value="Rejected">Reject (Non-Cognizable or False Complaint)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Investigating Officer (I.O.)
                </label>
                <select
                  value={verifyForm.assignedOfficerId}
                  onChange={(e) =>
                    setVerifyForm({ ...verifyForm, assignedOfficerId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.rank} {o.fullName} ({o.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Remarks & Police Assessment *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State reason for approval or rejection. This note will be sent directly to the citizen."
                  value={verifyForm.remarks}
                  onChange={(e) => setVerifyForm({ ...verifyForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalComplaint(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Save Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW FIR MODAL */}
      {newFirModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 text-xs text-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="pb-3 border-b border-slate-200 mb-4">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Official Law Enforcement Register
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {firConversionComplaint
                  ? `Convert Complaint ${firConversionComplaint.id} to FIR`
                  : 'Register First Information Report (FIR)'}
              </h3>
            </div>

            <form onSubmit={handleFirSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complainant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firForm.citizenName}
                    onChange={(e) => setFirForm({ ...firForm, citizenName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={firForm.citizenPhone}
                    onChange={(e) => setFirForm({ ...firForm, citizenPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Police Station Precinct *
                </label>
                <input
                  type="text"
                  required
                  value={firForm.policeStation}
                  onChange={(e) => setFirForm({ ...firForm, policeStation: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={firForm.incidentDate}
                    onChange={(e) => setFirForm({ ...firForm, incidentDate: e.target.value })}
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incident Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={firForm.incidentTime}
                    onChange={(e) => setFirForm({ ...firForm, incidentTime: e.target.value })}
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Offence Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={firForm.offenceType}
                    onChange={(e) => setFirForm({ ...firForm, offenceType: e.target.value })}
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Place of Occurrence *
                </label>
                <input
                  type="text"
                  required
                  value={firForm.incidentLocation}
                  onChange={(e) => setFirForm({ ...firForm, incidentLocation: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Acts and Statutory Sections *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section 379 IPC / Section 303(2) BNS"
                  value={firForm.actAndSections}
                  onChange={(e) => setFirForm({ ...firForm, actAndSections: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono font-semibold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Substance of First Information *
                </label>
                <textarea
                  rows={4}
                  required
                  value={firForm.description}
                  onChange={(e) => setFirForm({ ...firForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detail Investigating Officer (I.O.) *
                </label>
                <select
                  value={firForm.investigatingOfficerId}
                  onChange={(e) =>
                    setFirForm({ ...firForm, investigatingOfficerId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.rank} {o.fullName} ({o.badgeNumber}) - {o.assignedCasesCount} active cases
                    </option>
                  ))}
                </select>
              </div>

              {/* Submission loader banner */}
              {isSubmittingFir && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2.5 text-xs text-blue-900 font-semibold animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{firSubmitStepText || 'Submitting FIR to State Central Database...'}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSubmittingFir}
                  onClick={() => {
                    setNewFirModalOpen(false);
                    setFirConversionComplaint(null);
                  }}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFir}
                  className="px-4 py-2 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingFir ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting FIR...</span>
                    </>
                  ) : (
                    <span>Issue & Register FIR Docket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EVIDENCE MODAL */}
      {addEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Add Physical or Digital Evidence Record
            </h3>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Linked FIR Docket *
                </label>
                <select
                  value={evidenceForm.firNumber}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, firNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                >
                  {firs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} - {f.offenceType} ({f.citizenName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evidence Category *
                  </label>
                  <select
                    value={evidenceForm.evidenceType}
                    onChange={(e) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        evidenceType: e.target.value as EvidenceType,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  >
                    <option value="Document">Document / Paper Affidavit</option>
                    <option value="Image">Photographic Evidence</option>
                    <option value="Video">CCTV / Video Footage</option>
                    <option value="Physical Weapon">Physical Weapon / Seized Asset</option>
                    <option value="Forensic Report">Forensic Analysis Report</option>
                    <option value="Digital Audio/Call Record">Digital Audio / CDR Log</option>
                    <option value="Other">Other Material Exhibit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date Seized / Collected *
                  </label>
                  <input
                    type="date"
                    required
                    value={evidenceForm.collectedDate}
                    onChange={(e) =>
                      setEvidenceForm({ ...evidenceForm, collectedDate: e.target.value })
                    }
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Place of Seizure / Collection *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Palms Residency Basement Exit"
                  value={evidenceForm.collectedLocation}
                  onChange={(e) =>
                    setEvidenceForm({ ...evidenceForm, collectedLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description & Condition *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed description of physical condition, serial marks, or digital hash..."
                  value={evidenceForm.description}
                  onChange={(e) =>
                    setEvidenceForm({ ...evidenceForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={evidenceForm.isCitizenVisible}
                    onChange={(e) =>
                      setEvidenceForm({ ...evidenceForm, isCitizenVisible: e.target.checked })
                    }
                    className="rounded text-blue-900 border-slate-300"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">
                      Permit Citizen Visibility in Tracking Portal
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Keep unchecked for confidential police evidence, forensic lab notes, and suspect tracking.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddEvidenceModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Record into Evidence Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD OFFICER MODAL */}
      {addOfficerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 text-xs text-slate-800">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Add Police Officer to Roster
            </h3>

            <form onSubmit={handleOfficerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sub-Inspector Meera Rao"
                    value={officerForm.fullName}
                    onChange={(e) => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge / Service Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="POL-IND-9912"
                    value={officerForm.badgeNumber}
                    onChange={(e) =>
                      setOfficerForm({ ...officerForm, badgeNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rank *</label>
                  <select
                    value={officerForm.rank}
                    onChange={(e) =>
                      setOfficerForm({ ...officerForm, rank: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  >
                    <option value="Inspector">Inspector</option>
                    <option value="Sub-Inspector">Sub-Inspector</option>
                    <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Constable">Constable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Squad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cyber Crime / Crime Branch"
                    value={officerForm.department}
                    onChange={(e) =>
                      setOfficerForm({ ...officerForm, department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Police Station Precinct *
                </label>
                <input
                  type="text"
                  required
                  value={officerForm.policeStation}
                  onChange={(e) =>
                    setOfficerForm({ ...officerForm, policeStation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 00000"
                    value={officerForm.phone}
                    onChange={(e) => setOfficerForm({ ...officerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@police.gov.in"
                    value={officerForm.email}
                    onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddOfficerModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Enroll Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COMPLAINT DETAILS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Citizen Complaint File
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {selectedComplaint.id}
                </h3>
              </div>
              <StatusBadge status={selectedComplaint.status} />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block">Title:</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedComplaint.title}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="text-slate-400 block">Complainant:</span>
                  <span className="font-medium text-slate-900">
                    {selectedComplaint.citizenName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-mono text-slate-800">
                    {selectedComplaint.citizenPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Incident Date/Time:</span>
                  <span className="font-mono">
                    {selectedComplaint.incidentDate} {selectedComplaint.incidentTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category:</span>
                  <span className="font-medium">{selectedComplaint.category}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Description:</span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.suspectDetails && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Suspect Details:</span>
                  <p className="p-2 bg-slate-50 border border-slate-200 rounded">
                    {selectedComplaint.suspectDetails}
                  </p>
                </div>
              )}

              {selectedComplaint.witnessDetails && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Witness Details:</span>
                  <p className="p-2 bg-slate-50 border border-slate-200 rounded">
                    {selectedComplaint.witnessDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedComplaint.status !== 'Approved' && selectedComplaint.status !== 'FIR Registered' && selectedComplaint.status !== 'Case Closed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkComplaintCompleted(selectedComplaint);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>✓ Mark Completed & Approved</span>
                  </button>
                )}

                {selectedComplaint.status !== 'FIR Registered' && selectedComplaint.status !== 'Case Closed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyModalComplaint(selectedComplaint);
                        setVerifyForm({
                          action: 'Approved',
                          remarks: selectedComplaint.verificationRemarks || '',
                          assignedOfficerId: selectedComplaint.assignedOfficerId || officers[0]?.id || '',
                        });
                        setSelectedComplaint(null);
                      }}
                      className="px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300"
                    >
                      Formal Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenFirFromComplaint(selectedComplaint);
                        setSelectedComplaint(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300"
                    >
                      Convert to FIR
                    </button>
                  </>
                )}
                {selectedComplaint.status === 'Approved' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded border border-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ Verified & Approved</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded font-medium hover:bg-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT OFFICIAL FIR MODAL */}
      {selectedFirForPrint && (
        <FirPrintModal
          fir={selectedFirForPrint}
          complaint={complaints.find((c) => c.id === selectedFirForPrint.complaintId)}
          investigation={investigations.find((i) => i.firNumber === selectedFirForPrint.id)}
          evidenceList={evidence.filter((e) => e.firNumber === selectedFirForPrint.id)}
          onClose={() => setSelectedFirForPrint(null)}
        />
      )}

      {/* LIVE PROGRESSION & TICK-MARK MODAL AFTER FIR SUBMISSION */}
      {liveProgressionData && (
        <FirLiveProgressionModal
          isOpen={!!liveProgressionData}
          firNumber={liveProgressionData.firNumber}
          complaintId={liveProgressionData.complaintId}
          offenceType={liveProgressionData.offenceType}
          citizenName={liveProgressionData.citizenName}
          investigatingOfficerName={liveProgressionData.investigatingOfficerName}
          policeStation={liveProgressionData.policeStation}
          onComplete={() => {
            setLiveProgressionData(null);
            setActiveTab('status');
          }}
          onViewPrint={() => {
            const targetFir = firs.find((f) => f.id === liveProgressionData.firNumber);
            setLiveProgressionData(null);
            if (targetFir) setSelectedFirForPrint(targetFir);
          }}
          onClose={() => {
            setLiveProgressionData(null);
            setActiveTab('firs');
          }}
        />
      )}

      {/* FAST COMPLETE ACTION CONFIRMATION MODAL */}
      {completeConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs text-slate-800 border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                  Police Department Statutory Closure
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {completeConfirmModal.title}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm formal resolution and mark this docket as <strong>Completed / Closed</strong>. This will generate an official audit log entry, lock the investigation record, and dispatch a real-time status update to the citizen.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Completion & Resolution Remarks:
                </label>
                <textarea
                  rows={3}
                  value={completionRemarksInput !== '' ? completionRemarksInput : completeConfirmModal.defaultRemarks}
                  onChange={(e) => setCompletionRemarksInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Authorized by Station Inspector <strong>{currentUser?.fullName}</strong>. This status is permanent and records judicial disposal compliance.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-5">
              <button
                type="button"
                onClick={() => {
                  setCompleteConfirmModal(null);
                  setCompletionRemarksInput('');
                }}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalRemarks = completionRemarksInput !== '' ? completionRemarksInput : completeConfirmModal.defaultRemarks;
                  completeConfirmModal.onConfirm(finalRemarks);
                  setCompleteConfirmModal(null);
                  setCompletionRemarksInput('');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Check className="w-4 h-4" />
                <span>{completeConfirmModal.actionLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL POLICE CASE COMPLETION & DISPOSAL CERTIFICATE MODAL */}
      {selectedClosedCaseForCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-xs text-slate-800 max-h-[92vh] overflow-y-auto print-page border border-slate-200">
            {/* Certificate Header with State Emblem styling */}
            <div className="text-center pb-6 border-b-2 border-slate-800 mb-6 relative">
              <div className="inline-flex p-3 bg-slate-900 text-amber-400 rounded-full mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
                Government of India · Ministry of Home Affairs
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-950 mt-1">
                State Police Department · Criminal Investigation Bureau
              </h2>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 mt-1 underline decoration-2 underline-offset-4">
                Official Case Completion & Disposal Certificate
              </h3>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Disposal Ledger Record #{selectedClosedCaseForCert.id} · Issued under Cr.P.C. Sec 173 / B.N.S.S. Sec 193
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 leading-relaxed">
              <p className="text-xs text-slate-700 text-justify">
                This is to officially certify that the criminal inquiry in respect of First Information Report docket{' '}
                <strong className="font-mono text-slate-950">{selectedClosedCaseForCert.id}</strong>, registered at{' '}
                <strong>{selectedClosedCaseForCert.policeStation}</strong> on date{' '}
                <strong>{new Date(selectedClosedCaseForCert.registrationDate).toLocaleDateString()}</strong>, has been exhaustively investigated and formally concluded by the assigned Investigating Officer.
              </p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Complainant / Informant</span>
                  <span className="font-bold text-slate-900">{selectedClosedCaseForCert.citizenName}</span>
                  <div className="text-[11px] text-slate-500 font-mono">{selectedClosedCaseForCert.citizenPhone}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Cognizable Offence</span>
                  <span className="font-bold text-slate-900">{selectedClosedCaseForCert.offenceType}</span>
                  <div className="text-[11px] font-mono text-blue-900 font-semibold">{selectedClosedCaseForCert.actAndSections}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Investigating Officer</span>
                  <span className="font-bold text-slate-900">{selectedClosedCaseForCert.investigatingOfficerName}</span>
                  <div className="text-[11px] text-slate-500">{selectedClosedCaseForCert.investigatingOfficerRank}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Case Disposition Status</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-900 rounded border border-emerald-300 inline-block">
                    ✓ CASE CLOSED & DISPOSED
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block text-xs mb-1">
                  Final Police Investigation Summary & Disposal Grounds:
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                  {selectedClosedCaseForCert.remarks || 'Statutory investigation concluded, evidence compiled, and formal charge-sheet submitted to court of competent criminal jurisdiction.'}
                </p>
              </div>

              {/* Legal Undertaking */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded text-[11px] text-emerald-950 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Statutory Declaration:</strong> The evidence repository exhibits and forensic reports linked to this docket are securely impounded and transmitted to Judicial Court Records Custody.
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-300">
                <div className="text-center">
                  <div className="font-serif italic text-slate-800 text-sm mb-1">
                    {selectedClosedCaseForCert.investigatingOfficerName}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedClosedCaseForCert.investigatingOfficerRank}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">
                    Investigating Officer Seal
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-serif italic text-slate-800 text-sm mb-1">
                    {currentUser?.fullName}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Station House Officer (S.H.O.)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">
                    State Police Precinct Stamp
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => setSelectedClosedCaseForCert(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
