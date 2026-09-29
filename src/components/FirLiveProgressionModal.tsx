import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  UserCheck,
  FolderOpen,
  Camera,
  Bell,
  ArrowRight,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';

interface FirLiveProgressionModalProps {
  isOpen: boolean;
  firNumber: string;
  complaintId?: string;
  offenceType: string;
  citizenName: string;
  investigatingOfficerName?: string;
  policeStation?: string;
  onComplete: () => void;
  onViewPrint?: () => void;
  onClose: () => void;
}

interface StepItem {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FirLiveProgressionModal: React.FC<FirLiveProgressionModalProps> = ({
  isOpen,
  firNumber,
  complaintId,
  offenceType,
  citizenName,
  investigatingOfficerName = 'Inspector Rajesh Kumar',
  policeStation = 'Central Metropolitan Station - Sector 4',
  onComplete,
  onViewPrint,
  onClose,
}) => {
  const steps: StepItem[] = [
    {
      id: 'step-1',
      label: 'Complaint Verification & Legal Admissibility',
      detail: `Verified by station inspector. Cognizable offence confirmed under Cr.P.C. 154 / BNSS 173.`,
      icon: Shield,
    },
    {
      id: 'step-2',
      label: `FIR Registration & Docket Creation (${firNumber})`,
      detail: `First Information Report permanently recorded in State Police Crime Register.`,
      icon: FileText,
    },
    {
      id: 'step-3',
      label: 'Investigating Officer (I.O.) Assignment',
      detail: `Assigned to ${investigatingOfficerName} for field analysis and suspect trace.`,
      icon: UserCheck,
    },
    {
      id: 'step-4',
      label: 'Investigation Diary Initiated',
      detail: `Case diary opened. Crime scene forensics and CCTV extraction scheduled.`,
      icon: FolderOpen,
    },
    {
      id: 'step-5',
      label: 'Digital & Physical Evidence Locker Linked',
      detail: `Seizure memo generated. Attached documents sealed in station property ledger.`,
      icon: Camera,
    },
    {
      id: 'step-6',
      label: 'Real-Time Notification Dispatched to Complainant',
      detail: `SMS and in-app confirmation sent to ${citizenName}. Case tracking active.`,
      icon: Bell,
    },
  ];

  const [completedStepIndex, setCompletedStepIndex] = useState<number>(-1);
  const [isFinished, setIsFinished] = useState(false);

  // Synthesize pleasant sound chime for tick marks
  const playTickChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCompletedStepIndex(-1);
      setIsFinished(false);
      return;
    }

    // Initial brief delay before first tick mark
    const initialTimer = setTimeout(() => {
      setCompletedStepIndex(0);
      playTickChime();

      let current = 1;
      const interval = setInterval(() => {
        if (current < steps.length) {
          setCompletedStepIndex(current);
          playTickChime();
          current++;
        } else {
          clearInterval(interval);
          setIsFinished(true);
        }
      }, 1150); // 1.15 seconds per stage tick mark

      return () => clearInterval(interval);
    }, 450);

    return () => clearTimeout(initialTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercentage = Math.round(
    ((completedStepIndex + 1) / steps.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">FIRNEXA Live FIR Processing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-800 text-blue-200">
                  {firNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official docketing and real-time case tracking milestone verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Tracking Status: </span>
            <span className="font-semibold text-blue-900">
              {isFinished ? 'All Milestones Completed & Verified' : 'Verifying Case Milestones...'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
            <span>{progressPercentage}%</span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-900 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step-by-Step Progression List */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {steps.map((step, idx) => {
            const isCompleted = idx <= completedStepIndex;
            const isCurrent = idx === completedStepIndex + 1 && !isFinished;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition-all duration-300 flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                    : isCurrent
                    ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300 shadow-xs'
                    : 'bg-slate-50/40 border-slate-200 opacity-50'
                }`}
              >
                {/* Step indicator (Tick Mark or Pulsing Clock) */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-semibold ${
                        isCompleted
                          ? 'text-emerald-950 font-bold'
                          : isCurrent
                          ? 'text-blue-950 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCompleted && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        VERIFIED ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                        PROCESSING...
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 leading-relaxed ${
                      isCompleted ? 'text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {isFinished ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Case tracking timeline is now active with all milestones locked.
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Generating official digital seal & tick marks...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onViewPrint && (
              <button
                type="button"
                onClick={onViewPrint}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print FIR
              </button>
            )}

            <button
              type="button"
              onClick={onComplete}
              disabled={!isFinished}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Go to Track Case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
