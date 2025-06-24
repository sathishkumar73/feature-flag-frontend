import React from 'react';

const DisconnectedHeader: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-primary">Connect to Google Cloud Platform</h1>
      <p className="text-black">
        Connect your GCP account to enable zero-setup canary deployments with Cloud Run
      </p>
    </div>
  );
};

export default DisconnectedHeader; 