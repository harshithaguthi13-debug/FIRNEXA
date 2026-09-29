import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, Play, RotateCcw, Check, Sparkles } from 'lucide-react';
import { CaseStatusHistory } from '../types';

interface StatusTimelineProps {
  currentStatus: string;
  hasFir: boolean;
  hasOfficer: boolean;
  hasInvestigation: boolean;
  hasEvidence: boolean;
  history?: CaseStatusHistory[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  hasFir,
  hasOfficer,
  hasInvestigation,
  hasEvidence,
  history = [],
}) => {
  const isRejected = currentStatus.toLowerCase() === 'rejected';
  const isClosed = currentStatus.toLowerCase() === 'case closed';

  // Live simulation mode state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState<number | null>(null);

  const baseStages = [
    {
      id: 'submitted',
      label: 'Complaint Submitted',
      description: 'Logged with unique Complaint ID',
      completed: true,
      active: currentStatus.toLowerCase() === 'submitted',
    },
    {
      id: 'verified',
      label: 'Complaint Verified',
      description: 'Police inspection & preliminary check',
      completed:
        currentStatus !== 'Submitted' &&
        currentStatus !== 'Under Verification' &&
        !isRejected,
      active: currentStatus === 'Under Verification' || currentStatus === 'Approved',
      rejected: isRejected,
    },
    {
      id: 'fir_registered',
      label: 'FIR Registered',
      description: 'Cognizable crime entered in official ledger',
      completed:
        hasFir &&
        ['FIR Registered', 'Investigation', 'Under Review', 'Rework', 'Case Closed'].includes(
          currentStatus
        ),
      active: currentStatus === 'FIR Registered',
    },
    {
      id: 'officer_assigned',
      label: 'Officer Assigned',
      description: 'Dedicated Investigating Officer detailed',
      completed: hasOfficer && hasFir,
      active: hasOfficer && currentStatus === 'FIR Registered',
    },
    {
      id: 'investigation',
      label: 'Investigation Active',
      description: 'Crime scene analysis, interviews & diary notes',
      completed: ['Investigation', 'Under Review', 'Rework', 'Case Closed'].includes(currentStatus) && hasInvestigation,
      active: currentStatus === 'Investigation',
    },
    {
      id: 'evidence',
      label: 'Evidence Collected',
      description: 'Forensics, CCTV, documents & physical exhibits',
      completed: hasEvidence,
      active: hasEvidence && currentStatus === 'Investigation',
    },
    {
      id: 'review',
      label: 'Under Judicial Review',
      description: 'Supervisory review & draft charge sheet',
      completed: isClosed,
      active: currentStatus === 'Under Review' || currentStatus === 'Rework',
    },
    {
      id: 'closed',
      label: 'Case Closed',
      description: 'Court disposal or restorative closure',
      completed: isClosed,
      active: isClosed,
    },
  ];

  // Sound generator for milestone tick marks
  const playTick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio fallback
    }
  };

  // Run live progression step-by-step
  useEffect(() => {
    if (!isSimulating) return;

    setSimulatedStep(0);
    playTick();

    const interval = setInterval(() => {
      setSimulatedStep((prev) => {
        if (prev === null) return 0;
        if (prev < baseStages.length - 1) {
          playTick();
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsSimulating(false);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Compute effective stages
  const stages = baseStages.map((st, idx) => {
    if (simulatedStep !== null) {
      const isDone = idx <= simulatedStep;
      const isCurrent = idx === simulatedStep + 1 && isSimulating;
      return {
        ...st,
        completed: isDone,
        active: isCurrent,
      };
    }
    return st;
  });

  const completedCount = stages.filter((s) => s.completed).length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">Case Investigation Progress Timeline</h4>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {completedCount} of {stages.length} Milestones Verified ✓
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time step-by-step tracking synchronized with State Police Record Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live simulation ticker trigger */}
          <button
            type="button"
            onClick={() => {
              if (isSimulating) {
                setIsSimulating(false);
                setSimulatedStep(null);
              } else {
                setIsSimulating(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition shadow-2xs border ${
              isSimulating
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
            title="Simulate step-by-step milestone tick marks over time"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                <span>Simulating Ticks...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-blue-700" />
                <span>Simulate Step Progression</span>
              </>
            )}
          </button>

          <div className="text-right pl-2 border-l border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Phase:</span>
            <span className="font-bold text-xs text-blue-950">
              {isSimulating && simulatedStep !== null
                ? stages[simulatedStep]?.label
                : currentStatus}
            </span>
          </div>
        </div>
      </div>

      {isRejected ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-rose-900">Complaint Rejected / Non-Cognizable</h5>
            <p className="text-xs text-rose-700 mt-1">
              After preliminary verification, this matter was determined non-cognizable or outside territorial jurisdiction. Please review verification remarks in complaint details.
            </p>
          </div>
        </div>
      ) : null}

      {/* Responsive timeline grid with animated tick marks */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {stages.map((st, idx) => {
            const isDone = st.completed;
            const isCurrent = st.active;

            return (
              <div
                key={st.id}
                className={`relative flex flex-col p-3 rounded-lg border transition-all duration-300 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 shadow-xs'
                    : isDone
                    ? 'border-emerald-300 bg-emerald-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-in zoom-in-75 duration-200 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse shadow-2xs">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <span className={`text-xs line-clamp-1 ${isDone ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                  {st.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">
                  {st.description}
                </span>

                {isDone && (
                  <div className="mt-2 pt-1 border-t border-emerald-200/60 flex items-center justify-between text-[9px] font-mono text-emerald-800 font-semibold">
                    <span>VERIFIED</span>
                    <span>✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Log */}
      {history.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
            Official Audit Trail ({history.length} updates logged)
          </h5>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {history.map((h) => (
              <div
                key={h.id}
                className="text-xs p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-medium text-slate-900">
                    {h.previousStatus} &rarr; <span className="text-blue-700 font-bold">{h.newStatus}</span>
                  </span>
                  <p className="text-slate-600 mt-0.5">{h.remarks}</p>
                </div>
                <div className="text-right shrink-0 text-slate-500 text-[11px] font-mono">
                  <div className="font-semibold text-slate-700">{h.updatedBy}</div>
                  <div>{new Date(h.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
