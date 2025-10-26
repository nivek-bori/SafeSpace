'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { privateRoutes } from '@/lib/config';
import { cn, isAuthorized } from '@/lib/util/client_util';
import Auth from './Auth';
import LoadingComponent from '../ui/Loading';
import { X } from 'lucide-react';

interface AuthProtecterProps {
  children: React.ReactNode;
  className?: string;
}

interface AuthProtectorContextType {
  requireAuth: () => void;
  softRequireAuth: () => void;
}

const AuthContext = createContext<AuthProtectorContextType | undefined>(undefined);

export function useProtectorAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProtecter({ children, className }: AuthProtecterProps) {
  const [stage, setStage] = useState<'loading' | 'auth-required' | 'soft-auth-required'| 'success'>('loading');

  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';

  useEffect(() => {
    if (profile.loading || !pathname) return;

    async function exec() {
      const userRole = profile.data?.role ?? 'GUEST';

      const requiredRole = Object.entries(privateRoutes).find(
        ([route]) => pathname.startsWith(route)
      )?.[1] || 'GUEST';

      if (requiredRole && !isAuthorized(userRole, requiredRole)) {
        if (profile) {
          // NOTIFICATION: you do not have access to that, please sign in
          router.push('/');
          return;
        }
        setStage('auth-required');
      } else {
        setStage('success');
      }
    }
    exec();
  }, [profile, pathname, router]);

  const value = useMemo(() => ({
    requireAuth: () => { setStage('auth-required'); },
    softRequireAuth: () => { setStage('soft-auth-required'); }
  }), [setStage]);

  return <AuthContext.Provider value={value}>
    {stage === 'loading' && <LoadingComponent />}
    {stage === 'auth-required' && <Auth />}
    {stage === 'soft-auth-required' && (
      <>
        <button className='w-3 h-5 rounded-2xl bg-gray-300' onClick={() => setStage('success')}><X /></button>
        <Auth />
      </>
    )}
    {stage === 'success' && <div className={cn('w-full h-full', className)}>{children}</div>}
  </AuthContext.Provider>;
}