import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 my-4" role="alert">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
