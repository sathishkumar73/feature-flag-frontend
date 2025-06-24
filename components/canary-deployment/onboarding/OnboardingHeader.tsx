'use client';

import React from 'react';

interface OnboardingHeaderProps {
  emoji: string;
  title: string;
  subtitle: string;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  emoji,
  title,
  subtitle
}) => {
  return (
    <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="text-5xl mb-4 animate-in zoom-in duration-500 delay-200">
        {emoji}
      </div>
      <h1 className="text-3xl font-bold mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-300">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground animate-in slide-in-from-bottom-2 duration-500 delay-400">
        {subtitle}
      </p>
    </div>
  );
};

export default OnboardingHeader; 