'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { privateRoutes } from '@/lib/config';
import { cn, isAuthorized } from '@/lib/util/client_util';
import Auth from './Auth';

import { useNotification } from '../ui/Notification';
import Loading from '../ui/Loading';

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
  const { addNotification } = useNotification();

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
        if (profile.data) {
          addNotification({ message: 'You do not have access to that', type: 'warning' });
          router.push('/');
          return;
        } else {
          addNotification({ message: 'You do not have access to that. Please sign in first', type: 'warning' });
          setStage('auth-required');
        }
      } else {
        setStage('success');
      }
    }
    exec();
  }, [profile, pathname, router]);

  const value = useMemo(() => ({
    requireAuth: () => { setStage('auth-required'); },
    softRequireAuth: () => { if (!profile?.data) setStage('soft-auth-required'); }
  }), [setStage, profile]);

  return <AuthContext.Provider value={value}>
    {stage === 'loading' && <Loading />}
    {stage === 'auth-required' && <Auth onClose={null} />}
    {(stage === 'soft-auth-required' || stage == 'success') && (
      <>
        {/* If soft require, add auth screen in front, but still load/keep children rendered */}
        {stage == 'soft-auth-required' && <Auth onClose={() => setStage('success')} />} 
        
        <div className={cn('w-full h-full', className)}>{children}</div>
      </>
    )}
  </AuthContext.Provider>;
}