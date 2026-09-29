import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintCategory, Fir } from '../../types';
import { StatusBadge } from '../Badge';
import { StatusTimeline } from '../StatusTimeline';
import { FirPrintModal } from '../FirPrintModal';
import { FirLiveProgressionModal } from '../FirLiveProgressionModal';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  ShieldCheck,
  Search,
  Bell,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Eye,
  MapPin,
  Calendar,
  Building2,
  Printer,
  ChevronRight,
  Filter,
  Play,
  Sparkles,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    firs,
    investigations,
    evidence,
    officers,
    statusHistory,
    notifications,
    submitComplaint,
    registerFir,
    updateUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'submit' | 'complaints' | 'firs' | 'track' | 'notifications' | 'profile'
  >('dashboard');

  // Filter records belonging strictly to logged-in citizen
  const citizenComplaints = complaints.filter((c) => c.citizenId === currentUser?.id);
  const citizenFirs = firs.filter((f) => f.citizenId === currentUser?.id);
  const citizenNotifications = notifications.filter((n) => n.userId === currentUser?.id);

  // Stats calculation
  const totalComplaints = citizenComplaints.length;
  const pendingComplaints = citizenComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Verification'
  ).length;
  const registeredFirsCount = citizenFirs.length;
  const closedCasesCount = citizenComplaints.filter((c) => c.status === 'Case Closed').length;

  // Track case active selection
  const [selectedCaseForTracking, setSelectedCaseForTracking] = useState<Complaint | null>(
    citizenComplaints[0] || null
  );

  // Complaint details modal
  const [selectedComplaintModal, setSelectedComplaintModal] = useState<Complaint | null>(null);

  // FIR print modal
  const [selectedFirForPrint, setSelectedFirForPrint] = useState<Fir | null>(null);

  // Live progressive milestone modal
  const [liveProgressionModalData, setLiveProgressionModalData] = useState<{
    firNumber: string;
    complaintId?: string;
    offenceType: string;
    citizenName: string;
    investigatingOfficerName?: string;
    policeStation?: string;
  } | null>(null);

  // Real-time submission state & progress feedback ("take some time")
  const [submissionPhase, setSubmissionPhase] = useState<{
    text: string;
    progress: number;
  } | null>(null);

  // New Complaint & e-FIR Form state
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: 'Theft' as ComplaintCategory,
    submissionType: 'FIR' as 'FIR' | 'COMPLAINT',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '10:00 AM',
    incidentLocation: '',
    city: currentUser?.city || 'Bangalore',
    state: currentUser?.state || 'Karnataka',
    description: '',
    suspectDetails: '',
    witnessDetails: '',
    supportingDocs: [] as string[],
    isSubmitting: false,
    submittedId: null as string | null,
    registeredFirId: null as string | null,
  });

  // Complaint filters
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('ALL');

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pinCode: currentUser?.pinCode || '',
    saved: false,
  });

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Phase 1: Initiation with realistic server processing ("take some time")
    setComplaintForm((prev) => ({ ...prev, isSubmitting: true }));
    setSubmissionPhase({
      text: 'Connecting to FIRNEXA State Police Crime Records Server...',
      progress: 25,
    });

    // Phase 2: Jurisdiction & Legal Offence validation
    setTimeout(() => {
      setSubmissionPhase({
        text: 'Validating Citizen Identity, Incident Geolocation & Legal IPC/BNS Sections...',
        progress: 60,
      });
    }, 650);

    // Phase 3: Crime Ledger Docketing & IO Detail
    setTimeout(() => {
      setSubmissionPhase({
        text: 'Docketing Crime Register, Linking Evidence Vault & Assigning Investigating Officer...',
        progress: 90,
      });
    }, 1350);

    // Phase 4: Finalize submission & award tick marks to tracking case
    setTimeout(() => {
      const generatedId = submitComplaint({
        citizenId: currentUser.id,
        citizenName: currentUser.fullName,
        citizenEmail: currentUser.email,
        citizenPhone: currentUser.phone,
        title: complaintForm.title,
        description: complaintForm.description,
        category: complaintForm.category,
        incidentDate: complaintForm.incidentDate,
        incidentTime: complaintForm.incidentTime,
        incidentLocation: complaintForm.incidentLocation,
        city: complaintForm.city,
        state: complaintForm.state,
        suspectDetails: complaintForm.suspectDetails,
        witnessDetails: complaintForm.witnessDetails,
        supportingDocuments: complaintForm.supportingDocs.length > 0
          ? complaintForm.supportingDocs
          : ['Complainant_Statement_Affidavit.pdf'],
      });

      let generatedFirNumber: string | null = null;
      const assignedOfficer = officers[0] || {
        id: 'OFF-001',
        fullName: 'Inspector Rajesh Kumar',
        rank: 'Inspector',
      };

      // When submitted as an e-FIR, register official FIR docket immediately
      if (complaintForm.submissionType === 'FIR') {
        const legalSections =
          complaintForm.category === 'Theft' || complaintForm.category === 'Vehicle Theft'
            ? 'Section 379 IPC / Section 303(2) BNS'
            : complaintForm.category === 'Cybercrime'
            ? 'Section 66C & 66D IT Act 2000'
            : complaintForm.category === 'Burglary'
            ? 'Section 457 & 380 IPC / Section 305 & 331 BNS'
            : complaintForm.category === 'Assault'
            ? 'Section 323 & 352 IPC / Section 115(2) & 131 BNS'
            : 'Section 420 IPC / Section 318(4) BNS';

        generatedFirNumber = registerFir({
          complaintId: generatedId,
          citizenId: currentUser.id,
          citizenName: currentUser.fullName,
          citizenPhone: currentUser.phone,
          citizenAddress: `${complaintForm.incidentLocation}, ${complaintForm.city}, ${complaintForm.state}`,
          policeStation: currentUser?.policeStation || 'Central Metropolitan Station - Sector 4',
          registrationDate: new Date().toISOString(),
          incidentDate: complaintForm.incidentDate,
          incidentTime: complaintForm.incidentTime,
          incidentLocation: complaintForm.incidentLocation,
          offenceType: complaintForm.category,
          actAndSections: legalSections,
          description: complaintForm.description,
          investigatingOfficerId: assignedOfficer.id,
          investigatingOfficerName: assignedOfficer.fullName,
          investigatingOfficerRank: assignedOfficer.rank,
          status: 'Investigation',
          remarks: 'Official e-FIR registered via FIRNEXA Citizen Portal with digital verification seal.',
        });
      }

      setComplaintForm((prev) => ({
        ...prev,
        isSubmitting: false,
        submittedId: generatedId,
        registeredFirId: generatedFirNumber,
      }));
      setSubmissionPhase(null);

      // Pre-select the case for tracking
      const createdComplaintItem: Complaint = {
        id: generatedId,
        citizenId: currentUser.id,
        citizenName: currentUser.fullName,
        citizenEmail: currentUser.email,
        citizenPhone: currentUser.phone,
        title: complaintForm.title,
        description: complaintForm.description,
        category: complaintForm.category,
        incidentDate: complaintForm.incidentDate,
        incidentTime: complaintForm.incidentTime,
        incidentLocation: complaintForm.incidentLocation,
        city: complaintForm.city,
        state: complaintForm.state,
        suspectDetails: complaintForm.suspectDetails,
        witnessDetails: complaintForm.witnessDetails,
        status: generatedFirNumber ? 'FIR Registered' : 'Submitted',
        firNumber: generatedFirNumber || undefined,
        assignedOfficerId: assignedOfficer.id,
        assignedOfficerName: assignedOfficer.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedCaseForTracking(createdComplaintItem);

      // Automatically launch live milestone tick progression!
      const targetFirNumber =
        generatedFirNumber || `FIR-2026-${String(firs.length + 44).padStart(4, '0')}`;

      setLiveProgressionModalData({
        firNumber: targetFirNumber,
        complaintId: generatedId,
        offenceType: complaintForm.category,
        citizenName: currentUser.fullName,
        investigatingOfficerName: assignedOfficer.fullName,
        policeStation: 'Central Metropolitan Station - Sector 4',
      });
    }, 2000);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    updateUserProfile(currentUser.id, {
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      address: profileForm.address,
      city: profileForm.city,
      state: profileForm.state,
      pinCode: profileForm.pinCode,
    });
    setProfileForm((prev) => ({ ...prev, saved: true }));
    setTimeout(() => setProfileForm((prev) => ({ ...prev, saved: false })), 3000);
  };

  // Filtered complaints
  const filteredComplaints = citizenComplaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.incidentLocation.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchesCat =
      complaintCategoryFilter === 'ALL' || c.category === complaintCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner Greeting */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Citizen Account
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentUser?.id}</span>
          </div>
          <h2 className="text-xl font-bold">Welcome, {currentUser?.fullName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Submit complaints, monitor police docket verification, track FIR investigation progress, and access official reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setComplaintForm((prev) => ({ ...prev, submittedId: null }));
              setActiveTab('submit');
            }}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs transition flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            Submit New Complaint
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-1 no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'submit', label: 'Submit Complaint', icon: FilePlus },
          { id: 'complaints', label: `My Complaints (${totalComplaints})`, icon: FileText },
          { id: 'firs', label: `My FIRs (${registeredFirsCount})`, icon: ShieldCheck },
          { id: 'track', label: 'Track Case Status', icon: Clock },
          { id: 'notifications', label: `Notifications (${citizenNotifications.length})`, icon: Bell },
          { id: 'profile', label: 'Citizen Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-900 text-blue-900 font-semibold bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Complaints</span>
                <FileText className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {totalComplaints}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Logged by your profile</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Pending Verification</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {pendingComplaints}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Under preliminary check</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">FIRs Registered</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-900 tabular-nums">
                {registeredFirsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active police FIR records</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Cases Closed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {closedCasesCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Resolved or charge-sheeted</p>
            </div>
          </div>

          {/* Active Case Quick Tracking Widget */}
          {citizenComplaints.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Most Recent Case Status: {citizenComplaints[0].id}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {citizenComplaints[0].title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCaseForTracking(citizenComplaints[0]);
                    setActiveTab('track');
                  }}
                  className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
                >
                  Full Tracking Timeline <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <StatusTimeline
                currentStatus={citizenComplaints[0].status}
                hasFir={!!citizenComplaints[0].firNumber}
                hasOfficer={!!citizenComplaints[0].assignedOfficerName}
                hasInvestigation={!!citizenComplaints[0].firNumber}
                hasEvidence={evidence.some((e) => e.firNumber === citizenComplaints[0].firNumber)}
                history={statusHistory.filter(
                  (h) =>
                    h.firNumber === citizenComplaints[0].firNumber ||
                    h.complaintId === citizenComplaints[0].id
                )}
              />
            </div>
          )}

          {/* Recent Complaints Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Recent Submitted Complaints</h3>
                <p className="text-xs text-slate-500">Track preliminary police review</p>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs text-blue-900 font-semibold hover:underline"
              >
                View All Complaints ({totalComplaints})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Title & Category</th>
                    <th className="py-3 px-4">Incident Date & Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">FIR Ref</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {citizenComplaints.slice(0, 4).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-medium text-blue-900">{c.id}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-500">{c.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{c.incidentDate}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.incidentLocation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {c.firNumber || 'Pending'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedComplaintModal(c)}
                          className="px-2.5 py-1 text-[11px] text-blue-900 font-medium hover:bg-blue-50 rounded border border-blue-200"
                        >
                          View Details
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

      {/* TAB 2: SUBMIT COMPLAINT */}
      {activeTab === 'submit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs max-w-3xl mx-auto">
          {complaintForm.submittedId ? (
            /* Successful submission confirmation */
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Complaint Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Your complaint has been registered in the digital police intake queue. An official Complaint ID has been generated for tracking.
              </p>

              <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-sm mx-auto text-center">
                <span className="text-[11px] uppercase tracking-wider text-blue-700 block font-semibold">
                  Assigned Complaint ID
                </span>
                <span className="text-xl font-bold font-mono text-blue-950 block mt-1">
                  {complaintForm.submittedId}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Status: Submitted / Pending Verification
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const created = complaints.find((c) => c.id === complaintForm.submittedId);
                    if (created) {
                      setSelectedCaseForTracking(created);
                      setLiveProgressionModalData({
                        firNumber: created.firNumber || `FIR-2026-${String(firs.length + 43).padStart(4, '0')}`,
                        complaintId: created.id,
                        offenceType: created.category,
                        citizenName: created.citizenName,
                        investigatingOfficerName: 'Inspector Rajesh Kumar',
                        policeStation: 'Central Metropolitan Station - Sector 4',
                      });
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-md shadow-xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Watch Live Police Docketing & Milestone Ticks
                </button>
                <button
                  onClick={() => {
                    const created = complaints.find((c) => c.id === complaintForm.submittedId);
                    if (created) setSelectedCaseForTracking(created);
                    setActiveTab('track');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-xs transition"
                >
                  Track This Complaint
                </button>
                <button
                  onClick={() => {
                    setComplaintForm({
                      title: '',
                      category: 'Theft',
                      submissionType: 'FIR',
                      incidentDate: new Date().toISOString().split('T')[0],
                      incidentTime: '10:00 AM',
                      incidentLocation: '',
                      city: currentUser?.city || 'Bangalore',
                      state: currentUser?.state || 'Karnataka',
                      description: '',
                      suspectDetails: '',
                      witnessDetails: '',
                      supportingDocs: [],
                      isSubmitting: false,
                      submittedId: null,
                      registeredFirId: null,
                    });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleComplaintSubmit} className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Citizen Official Crime Registration & FIR Portal
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300 w-fit">
                    FIRNEXA STATUTORY INTAKE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Provide factual information regarding the incident. Official FIR registrations are digitally timestamped with live milestone tracking.
                </p>
              </div>

              {/* Registration Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Submission Filing Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setComplaintForm({ ...complaintForm, submissionType: 'FIR' })}
                    className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                      complaintForm.submissionType === 'FIR'
                        ? 'border-blue-700 bg-blue-50/70 ring-2 ring-blue-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Official e-FIR (Direct Docket)</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Statutory criminal docketing with official FIR number, IPC/BNS penal code allocation, and live step-by-step milestone tick marks.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaintForm({ ...complaintForm, submissionType: 'COMPLAINT' })}
                    className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                      complaintForm.submissionType === 'COMPLAINT'
                        ? 'border-blue-700 bg-blue-50/70 ring-2 ring-blue-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <FileText className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Preliminary Police Complaint</span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        General police complaint docket submitted for preliminary precinct verification and inspection before formal FIR conversion.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Informant auto-filled meta */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block">Complainant:</span>
                  <span className="font-semibold text-slate-900">{currentUser?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span className="font-mono text-slate-900">{currentUser?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registered Email:</span>
                  <span className="text-slate-900 truncate block">{currentUser?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Complaint Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theft of two-wheeler vehicle from apartment parking lot"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Offence / Complaint Category *
                  </label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, category: e.target.value as ComplaintCategory })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="Theft">Theft / Larceny</option>
                    <option value="Burglary">Burglary / Break-in</option>
                    <option value="Vehicle Theft">Vehicle Theft</option>
                    <option value="Cybercrime">Cybercrime / Online Fraud</option>
                    <option value="Assault">Physical Assault / Threat</option>
                    <option value="Financial Fraud">Financial Fraud / Cheating</option>
                    <option value="Missing Person">Missing Person</option>
                    <option value="Harassment">Harassment / Stalking</option>
                    <option value="Public Disturbance">Public Disturbance / Noise</option>
                    <option value="Narcotics">Narcotics / Illicit Substances</option>
                    <option value="Property Dispute">Property / Land Dispute</option>
                    <option value="Other">Other Cognizable Offence</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Incident Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={complaintForm.incidentDate}
                      onChange={(e) =>
                        setComplaintForm({ ...complaintForm, incidentDate: e.target.value })
                      }
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Incident Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 02:45 AM"
                      value={complaintForm.incidentTime}
                      onChange={(e) =>
                        setComplaintForm({ ...complaintForm, incidentTime: e.target.value })
                      }
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Incident Location & Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basement Parking 2, Royal Palms Residency, 12th Main Road"
                  value={complaintForm.incidentLocation}
                  onChange={(e) =>
                    setComplaintForm({ ...complaintForm, incidentLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={complaintForm.city}
                    onChange={(e) => setComplaintForm({ ...complaintForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={complaintForm.state}
                    onChange={(e) => setComplaintForm({ ...complaintForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed Description of Incident *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Narrate the complete chain of events, stolen items with serial/model numbers, vehicle registration numbers, financial account details, etc."
                  value={complaintForm.description}
                  onChange={(e) =>
                    setComplaintForm({ ...complaintForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Suspect Details (if known/sighted)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Two men in dark jackets and helmets on black motorcycle"
                    value={complaintForm.suspectDetails}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, suspectDetails: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Witness Details (if available)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Building Night Guard Mr. Suresh (+91 98221 00412)"
                    value={complaintForm.witnessDetails}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, witnessDetails: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Supporting Document Simulation */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-medium text-slate-700">
                  Supporting Document / Evidence Upload
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Attach invoices, photos, CCTV clips, or transaction statements (PDF, JPG, PNG, MP4 up to 50MB)
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleName = `Incident_Proof_${Date.now().toString().slice(-4)}.pdf`;
                      setComplaintForm((prev) => ({
                        ...prev,
                        supportingDocs: [...prev.supportingDocs, sampleName],
                      }));
                    }}
                    className="px-3 py-1 text-xs font-medium text-blue-900 bg-white border border-blue-300 rounded hover:bg-blue-50"
                  >
                    + Attach Sample Document
                  </button>
                </div>
                {complaintForm.supportingDocs.length > 0 && (
                  <div className="mt-3 text-xs text-left max-w-sm mx-auto space-y-1">
                    {complaintForm.supportingDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between"
                      >
                        <span className="font-mono text-[11px] text-slate-700 truncate">{doc}</span>
                        <span className="text-[10px] text-emerald-600 font-medium">Ready</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission processing state banner ("take some time") */}
              {complaintForm.isSubmitting && submissionPhase && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in duration-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-blue-950 font-mono tracking-tight">
                        FIRNEXA CENTRAL DOCKETING IN PROGRESS
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-900">
                      {submissionPhase.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 font-medium">
                    {submissionPhase.text}
                  </p>
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 transition-all duration-500 ease-out"
                      style={{ width: `${submissionPhase.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Please wait while cryptographic seals and legal section codes are verified. You will be directed to live case tracking tick marks automatically.
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={complaintForm.isSubmitting}
                  className="w-full py-3.5 px-4 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {complaintForm.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{submissionPhase?.text || 'Submitting FIR to Central Records...'}</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>
                        {complaintForm.submissionType === 'FIR'
                          ? 'Submit Official e-FIR & Launch Live Case Tracking'
                          : 'Submit Complaint for Police Verification'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: MY COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Complaint ID, title, or location..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={complaintCategoryFilter}
                onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5"
              >
                <option value="ALL">All Categories</option>
                <option value="Theft">Theft</option>
                <option value="Burglary">Burglary</option>
                <option value="Vehicle Theft">Vehicle Theft</option>
                <option value="Cybercrime">Cybercrime</option>
                <option value="Assault">Assault</option>
                <option value="Financial Fraud">Financial Fraud</option>
                <option value="Public Disturbance">Public Disturbance</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Complaint Title</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">FIR Number</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No complaints matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-medium text-blue-900">{c.id}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900">{c.title}</div>
                          <div className="text-[11px] text-slate-500">{c.category}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div>{c.incidentDate}</div>
                          <div className="text-[10px] text-slate-400">{c.incidentTime}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">{c.incidentLocation}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {c.firNumber ? (
                            <span className="text-indigo-900 font-semibold">{c.firNumber}</span>
                          ) : (
                            <span className="text-slate-400 italic">Not Generated</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {c.assignedOfficerName || (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedComplaintModal(c)}
                            className="px-2.5 py-1 text-xs text-blue-900 font-medium hover:bg-blue-50 rounded border border-blue-200 mr-2"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCaseForTracking(c);
                              setActiveTab('track');
                            }}
                            className="px-2.5 py-1 text-xs text-slate-700 font-medium hover:bg-slate-100 rounded border border-slate-200"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MY FIRS */}
      {activeTab === 'firs' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 block">Registered First Information Reports (FIRs)</strong>
              <span>
                These are formal criminal case dockets registered under statutory police law. Confidential investigative records remain restricted.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {citizenFirs.length === 0 ? (
              <div className="col-span-full bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
                No FIRs registered yet under your profile. As police officers verify and approve your complaints, FIRs will appear here automatically.
              </div>
            ) : (
              citizenFirs.map((fir) => {
                const linkedComplaint = complaints.find((c) => c.id === fir.complaintId);
                const inv = investigations.find((i) => i.firNumber === fir.id);

                return (
                  <div
                    key={fir.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">
                            First Information Report
                          </span>
                          <span className="text-base font-bold font-mono text-blue-950">
                            {fir.id}
                          </span>
                        </div>
                        <StatusBadge status={fir.status} />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Police Station:</span>
                          <span className="font-semibold text-slate-900">{fir.policeStation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Registration Date:</span>
                          <span className="font-mono text-slate-800">
                            {new Date(fir.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Legal Sections:</span>
                          <span className="font-mono text-slate-900 text-right truncate max-w-xs">
                            {fir.actAndSections}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Investigating Officer:</span>
                          <span className="font-medium text-slate-900">
                            {fir.investigatingOfficerName} ({fir.investigatingOfficerRank})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Investigation Status:</span>
                          <span className="font-semibold text-blue-900">
                            {inv?.status || 'Initiated'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded mt-3 text-slate-700">
                          <span className="font-semibold block mb-0.5 text-[11px] text-slate-800">
                            Offence Summary:
                          </span>
                          <p className="line-clamp-2 leading-relaxed">{fir.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (linkedComplaint) {
                            setSelectedCaseForTracking(linkedComplaint);
                            setActiveTab('track');
                          }
                        }}
                        className="text-xs text-blue-900 font-semibold hover:underline"
                      >
                        Track Status Timeline &rarr;
                      </button>

                      <button
                        onClick={() => setSelectedFirForPrint(fir)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        Print / Download FIR
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TRACK CASE STATUS */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Case selector dropdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Complaint / FIR to Track:
              </label>
              <select
                value={selectedCaseForTracking?.id || ''}
                onChange={(e) => {
                  const found = citizenComplaints.find((c) => c.id === e.target.value);
                  if (found) setSelectedCaseForTracking(found);
                }}
                className="text-xs bg-white border border-slate-300 rounded-md px-3 py-2 font-mono min-w-[280px]"
              >
                {citizenComplaints.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.title.substring(0, 35)}... ({c.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedCaseForTracking && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setLiveProgressionModalData({
                      firNumber: selectedCaseForTracking.firNumber || 'FIR-2026-0042',
                      complaintId: selectedCaseForTracking.id,
                      offenceType: selectedCaseForTracking.category,
                      citizenName: selectedCaseForTracking.citizenName,
                      investigatingOfficerName: selectedCaseForTracking.assignedOfficerName || 'Inspector Rajesh Kumar',
                      policeStation: 'Central Metropolitan Station - Sector 4',
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition flex items-center gap-1.5 shadow-2xs"
                  title="Watch step-by-step milestone progression ticks"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Watch Live Milestone Ticks
                </button>
                <button
                  onClick={() => setSelectedComplaintModal(selectedCaseForTracking)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
                >
                  View Details
                </button>
                {selectedCaseForTracking.firNumber && (
                  <button
                    onClick={() => {
                      const targetFir = firs.find(
                        (f) => f.id === selectedCaseForTracking.firNumber
                      );
                      if (targetFir) setSelectedFirForPrint(targetFir);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300"
                  >
                    View Official FIR
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedCaseForTracking ? (
            <div className="space-y-6">
              {/* Timeline */}
              <StatusTimeline
                currentStatus={selectedCaseForTracking.status}
                hasFir={!!selectedCaseForTracking.firNumber}
                hasOfficer={!!selectedCaseForTracking.assignedOfficerName}
                hasInvestigation={!!selectedCaseForTracking.firNumber}
                hasEvidence={evidence.some((e) => e.firNumber === selectedCaseForTracking.firNumber)}
                history={statusHistory.filter(
                  (h) =>
                    h.firNumber === selectedCaseForTracking.firNumber ||
                    h.complaintId === selectedCaseForTracking.id
                )}
              />

              {/* Case details snapshot */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Case Docket Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Complaint Reference:</span>
                    <span className="font-mono font-medium text-blue-950">
                      {selectedCaseForTracking.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">FIR Number:</span>
                    <span className="font-mono font-bold text-indigo-900">
                      {selectedCaseForTracking.firNumber || 'Pending FIR Registration'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Investigating Officer:</span>
                    <span className="font-medium text-slate-900">
                      {selectedCaseForTracking.assignedOfficerName || 'Awaiting Officer Detail'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Incident Location:</span>
                    <span className="text-slate-800">{selectedCaseForTracking.incidentLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date Reported:</span>
                    <span className="font-mono text-slate-800">
                      {new Date(selectedCaseForTracking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Status Update:</span>
                    <span className="font-mono text-slate-800">
                      {new Date(selectedCaseForTracking.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedCaseForTracking.verificationRemarks && (
                  <div className="mt-4 p-3 bg-blue-50/60 border border-blue-200 rounded text-xs">
                    <span className="font-semibold text-blue-900 block mb-0.5">
                      Police Verification Note:
                    </span>
                    <p className="text-slate-800">{selectedCaseForTracking.verificationRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
              No complaint available to track. Please submit a complaint first.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Citizen Case Notifications</h3>
              <p className="text-xs text-slate-500">
                Official alerts generated upon complaint verification, FIR generation and status updates
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              {citizenNotifications.length} Total
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {citizenNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No notifications logged for your account.
              </div>
            ) : (
              citizenNotifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-slate-50/80 transition flex gap-3">
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
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: CITIZEN PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Citizen Profile Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official contact details linked to your submitted legal complaints
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-semibold">
              Role: CITIZEN
            </span>
          </div>

          {profileForm.saved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Citizen Identification ID
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.id || ''}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded font-mono text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone / Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Permanent / Residential Address
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={profileForm.pinCode}
                  onChange={(e) => setProfileForm({ ...profileForm, pinCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="py-2.5 px-4 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-xs transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPLAINT DETAILS MODAL */}
      {selectedComplaintModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 text-xs text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Complaint Dossier
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {selectedComplaintModal.id}
                </h3>
              </div>
              <StatusBadge status={selectedComplaintModal.status} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block mb-0.5">Subject / Title:</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedComplaintModal.title}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-medium">{selectedComplaintModal.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Occurrence:</span>
                  <span className="font-mono">
                    {selectedComplaintModal.incidentDate} at {selectedComplaintModal.incidentTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Place of Occurrence:</span>
                  <span>{selectedComplaintModal.incidentLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Officer:</span>
                  <span className="font-medium text-blue-900">
                    {selectedComplaintModal.assignedOfficerName || 'Pending Allocation'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Incident Narrative:</span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed">
                  {selectedComplaintModal.description}
                </p>
              </div>

              {selectedComplaintModal.suspectDetails && (
                <div>
                  <span className="text-slate-500 block mb-1">Suspect Description:</span>
                  <p className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    {selectedComplaintModal.suspectDetails}
                  </p>
                </div>
              )}

              {selectedComplaintModal.witnessDetails && (
                <div>
                  <span className="text-slate-500 block mb-1">Witness Information:</span>
                  <p className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    {selectedComplaintModal.witnessDetails}
                  </p>
                </div>
              )}

              {selectedComplaintModal.verificationRemarks && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="font-semibold text-blue-900 block mb-0.5">
                    Police Station Remarks:
                  </span>
                  <p>{selectedComplaintModal.verificationRemarks}</p>
                </div>
              )}

              {selectedComplaintModal.firNumber && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-between">
                  <div>
                    <span className="text-indigo-900 font-semibold block">
                      Registered FIR: {selectedComplaintModal.firNumber}
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Case docket opened in crime records repository.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const f = firs.find((item) => item.id === selectedComplaintModal.firNumber);
                      if (f) {
                        setSelectedComplaintModal(null);
                        setSelectedFirForPrint(f);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-900 text-white rounded font-medium hover:bg-indigo-800"
                  >
                    View FIR Docket
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedComplaintModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded font-medium hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIR PRINT MODAL */}
      {selectedFirForPrint && (
        <FirPrintModal
          fir={selectedFirForPrint}
          complaint={complaints.find((c) => c.id === selectedFirForPrint.complaintId)}
          investigation={investigations.find((i) => i.firNumber === selectedFirForPrint.id)}
          evidenceList={evidence.filter(
            (e) => e.firNumber === selectedFirForPrint.id && e.isCitizenVisible
          )}
          onClose={() => setSelectedFirForPrint(null)}
        />
      )}

      {/* LIVE PROGRESSION & MILESTONE TICK MARKS MODAL */}
      {liveProgressionModalData && (
        <FirLiveProgressionModal
          isOpen={!!liveProgressionModalData}
          firNumber={liveProgressionModalData.firNumber}
          complaintId={liveProgressionModalData.complaintId}
          offenceType={liveProgressionModalData.offenceType}
          citizenName={liveProgressionModalData.citizenName}
          investigatingOfficerName={liveProgressionModalData.investigatingOfficerName}
          policeStation={liveProgressionModalData.policeStation}
          onComplete={() => {
            const foundComplaint =
              complaints.find((c) => c.id === liveProgressionModalData.complaintId) ||
              citizenComplaints[0];
            if (foundComplaint) setSelectedCaseForTracking(foundComplaint);
            setLiveProgressionModalData(null);
            setActiveTab('track');
          }}
          onViewPrint={() => {
            const targetFir = firs.find(
              (f) =>
                f.id === liveProgressionModalData.firNumber ||
                f.complaintId === liveProgressionModalData.complaintId
            );
            setLiveProgressionModalData(null);
            if (targetFir) setSelectedFirForPrint(targetFir);
          }}
          onClose={() => {
            const foundComplaint =
              complaints.find((c) => c.id === liveProgressionModalData.complaintId) ||
              citizenComplaints[0];
            if (foundComplaint) setSelectedCaseForTracking(foundComplaint);
            setLiveProgressionModalData(null);
            setActiveTab('track');
          }}
        />
      )}
    </div>
  );
};
