import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Shield, Eye, EyeOff, Lock, Mail, User, Phone, MapPin, CheckCircle, AlertTriangle, ArrowRight, KeyRound } from 'lucide-react';

interface AuthScreenProps {
  onOpenJavaModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenJavaModal }) => {
  const { login, registerCitizen, registerPoliceOrAdmin } = useApp();

  // Selected Login Type: 'ADMIN_POLICE' or 'CITIZEN'
  const [activeRoleType, setActiveRoleType] = useState<'ADMIN_POLICE' | 'CITIZEN'>('ADMIN_POLICE');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('police@example.com');
  const [password, setPassword] = useState('police123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  // Register form state (Citizen)
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pinCode: '',
    dateOfBirth: '',
    gender: 'Female',
    idProofNumber: '',
    acceptTerms: false,
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Register form state (Police / Admin)
  const [policeRegData, setPoliceRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'POLICE' as 'POLICE' | 'ADMIN',
    badgeNumber: `POL-IND-${Math.floor(1000 + Math.random() * 9000)}`,
    rank: 'Sub-Inspector',
    policeStation: 'Central Metropolitan Station - Sector 4',
    department: 'Crime Branch & General Investigation',
    authCode: 'POLICE2026',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [policeRegError, setPoliceRegError] = useState<string | null>(null);

  // Sync default credentials when role selector changes
  const handleRoleTypeChange = (type: 'ADMIN_POLICE' | 'CITIZEN') => {
    setActiveRoleType(type);
    setLoginError(null);
    setRegError(null);
    setPoliceRegError(null);
    setForgotPasswordMsg(false);
    if (type === 'ADMIN_POLICE') {
      setEmail('police@example.com');
      setPassword('police123');
    } else {
      setEmail('citizen@example.com');
      setPassword('citizen123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    setTimeout(() => {
      const requiredRole: UserRole = activeRoleType === 'CITIZEN' ? 'CITIZEN' : 'POLICE';
      const result = login(email, requiredRole);
      setIsLoading(false);

      if (!result.success) {
        setLoginError(result.message || 'Authentication failed. Please verify credentials.');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validation
    if (!regData.fullName.trim()) return setRegError('Please enter your full legal name.');
    if (!regData.email.trim() || !regData.email.includes('@'))
      return setRegError('Please enter a valid email address.');
    if (!regData.phone.trim() || regData.phone.length < 10)
      return setRegError('Please provide a valid 10-digit mobile number.');
    if (!regData.password || regData.password.length < 6)
      return setRegError('Password must be at least 6 characters.');
    if (regData.password !== regData.confirmPassword)
      return setRegError('Passwords do not match.');
    if (!regData.acceptTerms)
      return setRegError('You must acknowledge the legal terms of complaint submission.');

    setIsLoading(true);
    setTimeout(() => {
      const res = registerCitizen({
        fullName: regData.fullName,
        email: regData.email,
        phone: regData.phone,
        address: regData.address,
        city: regData.city,
        state: regData.state,
        pinCode: regData.pinCode,
        dateOfBirth: regData.dateOfBirth,
        gender: regData.gender,
      });
      setIsLoading(false);

      if (!res.success) {
        setRegError(res.message || 'Registration failed.');
      } else {
        setRegSuccess(true);
      }
    }, 500);
  };

  const handlePoliceRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPoliceRegError(null);

    if (!policeRegData.fullName.trim()) return setPoliceRegError('Please enter full officer / administrator name.');
    if (!policeRegData.email.trim() || !policeRegData.email.includes('@'))
      return setPoliceRegError('Please enter a valid official email address.');
    if (!policeRegData.phone.trim() || policeRegData.phone.length < 10)
      return setPoliceRegError('Please provide a valid 10-digit phone number.');
    if (!policeRegData.badgeNumber.trim())
      return setPoliceRegError('Please provide a valid badge / service ID.');
    if (policeRegData.authCode.trim() !== 'POLICE2026' && policeRegData.authCode.trim() !== 'ADMIN2026') {
      return setPoliceRegError('Invalid departmental security passkey. Please use POLICE2026 or ADMIN2026.');
    }
    if (!policeRegData.password || policeRegData.password.length < 6)
      return setPoliceRegError('Password must be at least 6 characters.');
    if (policeRegData.password !== policeRegData.confirmPassword)
      return setPoliceRegError('Passwords do not match.');
    if (!policeRegData.acceptTerms)
      return setPoliceRegError('You must affirm departmental authorization before registering.');

    setIsLoading(true);
    setTimeout(() => {
      const res = registerPoliceOrAdmin({
        fullName: policeRegData.fullName,
        email: policeRegData.email,
        phone: policeRegData.phone,
        role: policeRegData.role,
        badgeNumber: policeRegData.badgeNumber,
        rank: policeRegData.rank,
        policeStation: policeRegData.policeStation,
        department: policeRegData.department,
        password: policeRegData.password,
      });
      setIsLoading(false);

      if (!res.success) {
        setPoliceRegError(res.message || 'Officer enrollment failed.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Banner / Gov Header */}
      <header className="bg-slate-950 border-b border-slate-800 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 border border-blue-700 flex items-center justify-center text-white">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-wider block font-mono">
                  FIRNEXA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-800 text-blue-200 border border-blue-600">
                  POLICE
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Police FIR Management System · Redressal & Docket Portal
              </span>
            </div>
          </div>
          <button
            onClick={onOpenJavaModal}
            className="text-xs text-amber-300 hover:text-amber-200 border border-amber-800 bg-amber-950/40 px-3 py-1.5 rounded transition flex items-center gap-1.5 font-medium"
          >
            <span>View Java Backend & UML</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header Title Section */}
          <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
            <div className="inline-flex p-2.5 rounded-full bg-blue-900/60 border border-blue-700 mb-3">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase font-mono">FIRNEXA</h1>
            <h2 className="text-sm font-semibold text-slate-200 mt-0.5">Police FIR Management System</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Secure Centralized Portal for Complaint Submission, FIR Docketing, and Case Tracking
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Step 1: Select Login Type (Admin / Police vs User / Citizen) */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 text-center">
                Select Login Type
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleTypeChange('ADMIN_POLICE')}
                  className={`py-2.5 px-4 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeRoleType === 'ADMIN_POLICE'
                      ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-950'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  Admin / Police
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTypeChange('CITIZEN')}
                  className={`py-2.5 px-4 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeRoleType === 'CITIZEN'
                      ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-950'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  User / Citizen
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700">
                <span>Quick Demo Accounts:</span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Fill</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeRoleType === 'ADMIN_POLICE' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('police@example.com');
                        setPassword('police123');
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-mono hover:bg-blue-50 hover:border-blue-300 text-blue-900"
                    >
                      police@example.com (Inspector)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@example.com');
                        setPassword('admin123');
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-mono hover:bg-blue-50 hover:border-blue-300 text-blue-900"
                    >
                      admin@example.com (Admin)
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('citizen@example.com');
                      setPassword('citizen123');
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-mono hover:bg-emerald-50 hover:border-emerald-300 text-emerald-900"
                  >
                    citizen@example.com (Demo Citizen)
                  </button>
                )}
              </div>
            </div>

            {/* Auth Mode Tabs (Both Citizen and Admin/Police can toggle Login & Register) */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className={`pb-2.5 text-xs font-semibold mr-6 border-b-2 transition ${
                  authMode === 'LOGIN'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {activeRoleType === 'CITIZEN' ? 'Citizen Login' : 'Admin / Police Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                  authMode === 'REGISTER'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {activeRoleType === 'CITIZEN'
                  ? 'New Citizen Registration'
                  : 'Enroll Police / Admin'}
              </button>
            </div>

            {/* LOGIN FORM */}
            {authMode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {forgotPasswordMsg && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    For security in this demonstration system, use demo credentials:
                    <strong className="block mt-1 font-mono">
                      {activeRoleType === 'CITIZEN' ? 'citizen@example.com / citizen123' : 'police@example.com / police123'}
                    </strong>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address / Official ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMsg(true)}
                      className="text-[11px] text-blue-800 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span>Remember this station console</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as {activeRoleType === 'CITIZEN' ? 'Citizen' : 'Police / Admin'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {activeRoleType === 'CITIZEN' ? (
                  <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
                    Don't have a registered citizen profile?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('REGISTER')}
                      className="font-semibold text-blue-900 hover:underline"
                    >
                      Register Citizen Account
                    </button>
                  </div>
                ) : (
                  <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
                    New Law Enforcement Officer or Admin?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('REGISTER')}
                      className="font-semibold text-blue-900 hover:underline"
                    >
                      Enroll Police Officer / Admin Account
                    </button>
                  </div>
                )}
              </form>
            ) : activeRoleType === 'CITIZEN' ? (
              /* CITIZEN REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Varma"
                      value={regData.fullName}
                      onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ramesh@example.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={regData.gender}
                      onChange={(e) => setRegData({ ...regData, gender: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="House/Flat number, Street name, Area"
                    value={regData.address}
                    onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={regData.city}
                      onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={regData.state}
                      onChange={(e) => setRegData({ ...regData, state: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      placeholder="560034"
                      value={regData.pinCode}
                      onChange={(e) => setRegData({ ...regData, pinCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regData.acceptTerms}
                      onChange={(e) => setRegData({ ...regData, acceptTerms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span className="text-slate-600 leading-tight">
                      I declare that all personal and incident information provided by me in this portal is true to the best of my knowledge under the statutory legal guidelines.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-xs transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Creating Citizen Profile...' : 'Complete Citizen Registration'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="py-2.5 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* POLICE / ADMIN REGISTRATION FORM */
              <form onSubmit={handlePoliceRegisterSubmit} className="space-y-4">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-800 shrink-0" />
                  <span>
                    Official Departmental Registration for Law Enforcement Officers & Precinct Administrators.
                  </span>
                </div>

                {policeRegError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{policeRegError}</span>
                  </div>
                )}

                {/* Role selection for officer vs admin */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department Service Role *
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setPoliceRegData((prev) => ({
                          ...prev,
                          role: 'POLICE',
                          rank: 'Sub-Inspector',
                          department: 'Crime Branch & General Investigation',
                        }))
                      }
                      className={`py-2 px-3 rounded font-medium transition text-center ${
                        policeRegData.role === 'POLICE'
                          ? 'bg-blue-900 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Police Officer (Investigator)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPoliceRegData((prev) => ({
                          ...prev,
                          role: 'ADMIN',
                          rank: 'Superintendent of Police',
                          department: 'Station Command & Administration',
                        }))
                      }
                      className={`py-2 px-3 rounded font-medium transition text-center ${
                        policeRegData.role === 'ADMIN'
                          ? 'bg-blue-900 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      System Admin / Station Chief
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Legal Name & Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={policeRegData.fullName}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, fullName: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Department Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="officer@police.gov.in"
                      value={policeRegData.email}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, email: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Service / Badge Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="POL-IND-8845"
                      value={policeRegData.badgeNumber}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, badgeNumber: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 11223"
                      value={policeRegData.phone}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, phone: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rank / Position *
                    </label>
                    <select
                      value={policeRegData.rank}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, rank: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    >
                      {policeRegData.role === 'ADMIN' ? (
                        <>
                          <option value="Superintendent of Police">Superintendent of Police (SP)</option>
                          <option value="Commissioner of Police">Commissioner of Police</option>
                          <option value="Deputy Commissioner (DCP)">Deputy Commissioner (DCP)</option>
                          <option value="Station House Officer (SHO)">Station House Officer (SHO)</option>
                        </>
                      ) : (
                        <>
                          <option value="Inspector">Inspector of Police</option>
                          <option value="Sub-Inspector">Sub-Inspector (SI)</option>
                          <option value="Assistant Sub-Inspector">Assistant Sub-Inspector (ASI)</option>
                          <option value="Head Constable">Head Constable</option>
                          <option value="Constable">Constable</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department / Squad *
                    </label>
                    <select
                      value={policeRegData.department}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, department: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Crime Branch & General Investigation">Crime Branch & Investigation</option>
                      <option value="Cyber Forensics & Digital Investigation">Cyber Forensics & Digital Squad</option>
                      <option value="Special Investigation Team (SIT)">Special Investigation Team (SIT)</option>
                      <option value="Anti-Theft & Property Crimes Squad">Anti-Theft & Property Squad</option>
                      <option value="Station Command & Administration">Station Command & Administration</option>
                      <option value="Evidence & Records Custody">Evidence & Records Custody</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assigned Police Station Precinct *
                  </label>
                  <select
                    value={policeRegData.policeStation}
                    onChange={(e) =>
                      setPoliceRegData({ ...policeRegData, policeStation: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="Central Metropolitan Station - Sector 4">Central Metropolitan Station - Sector 4</option>
                    <option value="Cyber Crime Police Station - South Wing">Cyber Crime Police Station - South Wing</option>
                    <option value="East Sub-Divisional Station">East Sub-Divisional Station</option>
                    <option value="Metropolitan Police Headquarters">Metropolitan Police Headquarters</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Department Authorization Key / Passkey *
                    </label>
                    <span className="text-[10px] text-blue-900 font-mono">
                      (Passkey: <code className="bg-slate-100 px-1 py-0.5 rounded">POLICE2026</code> or <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN2026</code>)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter POLICE2026 or ADMIN2026"
                    value={policeRegData.authCode}
                    onChange={(e) =>
                      setPoliceRegData({ ...policeRegData, authCode: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={policeRegData.password}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, password: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={policeRegData.confirmPassword}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, confirmPassword: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policeRegData.acceptTerms}
                      onChange={(e) =>
                        setPoliceRegData({ ...policeRegData, acceptTerms: e.target.checked })
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span className="text-slate-600 leading-tight">
                      I solemnly affirm under the Police Service Act that I am an authorized departmental official enrolling this management console account.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-xs transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Enrolling Service Account...' : 'Complete Police / Admin Enrollment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="py-2.5 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer security badge */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Protected by State Law Enforcement Encryption · Criminal Record System
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 text-center border-t border-slate-800">
        <p>FIRNEXA · Police FIR Management System · Central Police Department · Automated Redressal Portal</p>
      </footer>
    </div>
  );
};
