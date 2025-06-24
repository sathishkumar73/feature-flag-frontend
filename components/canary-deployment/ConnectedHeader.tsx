import React from 'react';
import { CheckCircle } from 'lucide-react';

const ConnectedHeader: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-3 mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Connected to Google Cloud Platform</h1>
      </div>
      <p className="text-gray-600">
        Your GCP account is connected. Select a project to start deploying canary proxies.
      </p>
    </div>
  );
};

export default ConnectedHeader; 