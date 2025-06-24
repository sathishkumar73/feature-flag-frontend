'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiPost } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';

interface GCPAuthCallbackResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  projectId?: string;
}

export default function GCPCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google Cloud authentication...');
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from Supabase session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        setMessage('Google Cloud authentication was denied or failed');
        return;
      }
      
      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid OAuth response from Google');
        return;
      }

      if (!userId) {
        setStatus('error');
        setMessage('User not authenticated');
        return;
      }
      
      try {
        const data = await apiPost<GCPAuthCallbackResponse>('/gcp/auth/callback', {
          code,
          state,
          userId: userId
        });
        
        if (data.success) {
          // Clear stored state
          localStorage.removeItem('gcp_state');
          
          setStatus('success');
          setMessage('Successfully connected to Google Cloud Platform!');
          
          // Redirect after a short delay to show success message
          setTimeout(() => {
            router.push('/canary-deployment?connected=true&projectId=' + (data.projectId || ''));
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
        
      } catch (error) {
        console.error('GCP connection failed:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to complete Google Cloud authentication');
      }
    };

    if (userId) {
      handleCallback();
    }
  }, [searchParams, router, userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Google Cloud Connection</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                <p className="text-gray-600">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-sm text-gray-500">Redirecting you back...</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-red-600" />
                <p className="text-red-600 font-medium">{message}</p>
                <button 
                  onClick={() => router.push('/canary-deployment')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go Back
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 