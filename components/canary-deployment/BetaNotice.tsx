import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BetaNoticeProps {
  className?: string;
}

const BetaNotice: React.FC<BetaNoticeProps> = ({ className = '' }) => {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Beta
        </Badge>
        <span className="text-sm font-medium text-yellow-800">Under Active Development</span>
      </div>
      <p className="text-sm text-yellow-700">
        This feature is currently in beta and under active development. 
        Please use test projects only for now.
      </p>
    </div>
  );
};

export default BetaNotice; 