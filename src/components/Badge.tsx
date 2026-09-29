import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized.includes('approved') || normalized.includes('closed') || normalized.includes('completed') || normalized.includes('active')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (normalized.includes('pending') || normalized.includes('verification') || normalized.includes('review') || normalized.includes('submitted')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (normalized.includes('investigation') || normalized.includes('in progress') || normalized.includes('initiated')) {
    styles = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (normalized.includes('registered')) {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (normalized.includes('rejected') || normalized.includes('inactive')) {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (normalized.includes('rework')) {
    styles = 'bg-purple-50 text-purple-800 border-purple-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${styles} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};
