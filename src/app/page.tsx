'use client'

import { Suspense, use, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MapMenuComponent from '@/components/map/MapMenu';
import { useAuth } from '@/components/auth/AuthProvider';
import { request } from '@/lib/util/api';
import { LocationGetRes } from '@/types/api_types';
import { RelationLocation } from '@/types/types';
import Loading from '@/components/ui/Loading';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { checkIsAppPPREnabled } from 'next/dist/server/lib/experimental/ppr';

export default function Home() {
  const { session } = useAuth();
  const sessionRef = useRef(session);

  const [locations, setLocations] = useState<RelationLocation[] | null>(null);

  // Used to ensure both location and subscription exist
  const checkLocationIntervalRef = useRef<any>(null);
  const loadLocationStateRef = useRef<'loading' | 'loaded' | 'unloaded'>('unloaded');
  const subscriptionRef = useRef<any>(null);

  // Track session data in ref
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  async function loadLocationData() {
    loadLocationStateRef.current = 'loading';

    const res = await request<LocationGetRes>({
      type: 'GET',
      route: 'api/location',
      body: {},
      session: sessionRef.current.data,
    });

    // Update date & location data state
    if (res.status === 'success' && res.locations) {
      console.log('TESTING load locations', res.locations);
      setLocations(res.locations);
      loadLocationStateRef.current = 'loaded';
    } else {
      console.log('app/ loadLocationData error', res.message);
      loadLocationStateRef.current = 'unloaded';
    }
  }

  async function subscribeLocationData() {
    await supabase.realtime.setAuth();
    const channel = supabase.channel('location-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Location',
        },
        (payload) => {
          loadLocationData();
          if (!payload.errors) console.log('Successful payload', payload);
        }
      )
      .subscribe((status, err) => {
        console.log('DEBUGGING subscription', status, err);
        // Update subscription state!
        if (status === 'SUBSCRIBED') subscriptionRef.current = channel;
        else subscriptionRef.current = null;
      });
  }

  async function checkLocationData() {
    // Check and load missing data
    if (loadLocationStateRef.current === 'unloaded') await loadLocationData();
    if (subscriptionRef.current === null) await subscribeLocationData();
  
    // If data not missing -> clear interval
    if (loadLocationStateRef.current !== 'unloaded' && subscriptionRef.current) {
      clearInterval(checkLocationIntervalRef.current);
      checkLocationIntervalRef.current = null;
    }
  }

  // Initiate check
  useEffect(() => {
    // Check location data loaded on an interval, function deletes interval on condition compleition
    if (!checkLocationIntervalRef.current) {
      checkLocationData();
      checkLocationIntervalRef.current = setInterval(() => checkLocationData(), 10 * 1000);
    }

    // Cleanup
    return () => {
      if (checkLocationIntervalRef.current) {
        clearInterval(checkLocationIntervalRef.current);
        checkLocationIntervalRef.current = null;
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <MapMenuComponent locations={locations} session={session}></MapMenuComponent>
    </Suspense>
  );
}
