import React from 'react';
import { Rocket } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Rocket className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">GradualRollout</h1>
      </div>
    </div>
  );
};

export default AuthHeader; 