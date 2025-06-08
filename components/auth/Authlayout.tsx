import React from 'react';
import AuthHeader from './AuthHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * Shared layout component for authentication pages
 * Provides consistent styling and structure for login/signup
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <AuthHeader />

        {/* Page Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        
        {/* Content */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;