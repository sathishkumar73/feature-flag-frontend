import React from 'react';

interface ErrorMessageProps {
  error: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  );
};

export default ErrorMessage; 