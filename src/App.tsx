import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { PoliceDashboard } from './components/police/PoliceDashboard';
import { JavaArchitectureModal } from './components/JavaArchitectureModal';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [isJavaModalOpen, setIsJavaModalOpen] = useState(false);

  // If no user is logged in, show the Login/Register screen first as specified in Section 4 & 37
  if (!currentUser) {
    return (
      <>
        <AuthScreen onOpenJavaModal={() => setIsJavaModalOpen(true)} />
        <JavaArchitectureModal
          isOpen={isJavaModalOpen}
          onClose={() => setIsJavaModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-900 selection:text-white">
      {/* Official Police Portal Header */}
      <Header onOpenJavaModal={() => setIsJavaModalOpen(true)} />

      {/* Main View: Role-Based Routing */}
      <main className="flex-1 pb-12">
        {currentUser.role === 'CITIZEN' ? (
          <CitizenDashboard />
        ) : (
          <PoliceDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-950 text-slate-400 text-xs py-5 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-white tracking-wide font-mono">
              FIRNEXA · Police FIR Management System
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Central Digital Crime Register · Developed under Criminal Procedure Code (Cr.P.C. Sec 154) & BNSS guidelines.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsJavaModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Spring Boot & MySQL Specs
            </button>
            <span className="text-slate-600">|</span>
            <span>All Records Digitally Sealed & Audited</span>
          </div>
        </div>
      </footer>

      {/* Java Spring Boot & UML Architecture Explorer Modal */}
      <JavaArchitectureModal
        isOpen={isJavaModalOpen}
        onClose={() => setIsJavaModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
