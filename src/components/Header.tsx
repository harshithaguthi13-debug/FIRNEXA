import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Shield,
  User as UserIcon,
  LogOut,
  Code2,
  RefreshCw,
  ChevronDown,
  Layers,
  Database,
  Building,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenJavaModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenJavaModal, onNavigateTab }) => {
  const { currentUser, logout, switchUserRole, resetToDefaultData } = useApp();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  return (
    <header className="no-print bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 border border-blue-700 flex items-center justify-center text-white shadow-inner">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-wider text-white block leading-tight font-mono">
                  FIRNEXA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-800 text-blue-200 border border-blue-600">
                  POLICE
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block tracking-normal">
                Police FIR Management System · Digital Records Portal
              </span>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Java & Architecture Modal Trigger */}
            <button
              onClick={onOpenJavaModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded hover:bg-amber-900/60 transition"
              title="Inspect Java Spring Boot Backend Code, UML Diagrams & MySQL Schema"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Java Backend & UML</span>
              <span className="md:hidden">Java</span>
            </button>

            {/* Quick Role Switcher Dropdown (for quick evaluation & testing) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 border border-slate-700 rounded hover:bg-slate-700 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline text-slate-400">Role:</span>
                <span className="font-semibold text-white">
                  {currentUser?.role === 'CITIZEN'
                    ? 'Citizen'
                    : currentUser?.role === 'POLICE'
                    ? 'Police'
                    : 'Admin'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                    Switch Test Account (Demo)
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole('CITIZEN');
                      setIsRoleMenuOpen(false);
                      onNavigateTab?.('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                      currentUser?.role === 'CITIZEN' ? 'text-amber-400 font-medium' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Harshitha Sharma</div>
                      <div className="text-[10px] text-slate-400">Citizen (Complainant)</div>
                    </div>
                    {currentUser?.role === 'CITIZEN' && <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('POLICE');
                      setIsRoleMenuOpen(false);
                      onNavigateTab?.('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                      currentUser?.role === 'POLICE' ? 'text-amber-400 font-medium' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Inspector Rajesh Kumar</div>
                      <div className="text-[10px] text-slate-400">Police Officer (Investigating)</div>
                    </div>
                    {currentUser?.role === 'POLICE' && <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('ADMIN');
                      setIsRoleMenuOpen(false);
                      onNavigateTab?.('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                      currentUser?.role === 'ADMIN' ? 'text-amber-400 font-medium' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Comm. Vikram Rathore</div>
                      <div className="text-[10px] text-slate-400">System Admin / Police Chief</div>
                    </div>
                    {currentUser?.role === 'ADMIN' && <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  <div className="mt-1 pt-1 border-t border-slate-800 px-3 py-1">
                    <button
                      onClick={() => {
                        if (confirm('Reset all modified complaints, FIRs, investigations and officers back to initial demo seeds?')) {
                          resetToDefaultData();
                          setIsRoleMenuOpen(false);
                        }
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1 w-full"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to Sample Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Profile Pill / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.fullName}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {currentUser?.role === 'CITIZEN' ? 'Citizen Account' : currentUser?.rank || 'Staff'}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
