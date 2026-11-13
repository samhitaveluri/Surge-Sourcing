import React from 'react';
import { RfqStatus } from '../types';

interface StatusBadgeProps {
  status: RfqStatus;
  deadline?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, deadline }) => {
  const isPastDeadline = deadline ? new Date(deadline).getTime() <= Date.now() : false;

  if (status === 'CLOSED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
        CLOSED
      </span>
    );
  }

  if (isPastDeadline) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
        EXPIRED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      OPEN
    </span>
  );
};
