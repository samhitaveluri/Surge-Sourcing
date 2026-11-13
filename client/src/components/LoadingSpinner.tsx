import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3" role="status">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
};
