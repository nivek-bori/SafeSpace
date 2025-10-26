'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MapMenuComponent from '@/components/map/MapMenu';
import { useAuth } from '@/components/auth/AuthProvider';
import { request } from '@/lib/util/api';
import { LocationGetRes } from '@/types/api_types';
import { RelationLocation } from '@/types/types';
import Loading from '@/components/ui/Loading';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const { session } = useAuth();

  const [locations, setLocations] = useState<RelationLocation[] | null>(null);
  const subscription = useRef<any>(null);

  const getLocationData = useCallback(() => {
    async function exec() {
      const res = await request<LocationGetRes>({
        type: 'GET',
        route: 'api/location',
        body: {},
        session: session.data,
      });

      // TODO: Notification
      console.log('NOTIFY: ', res.status, res.message, 'locations', res.locations);
      if (res.status === 'success' && res.locations) {
        setLocations(res.locations);
      }
    }
    exec();
  }, [session.data, setLocations]);

  // Load locations and subscribe to locations
  useEffect(() => {
    async function exec() {
      try {
        if (session.loading) return;

        // If no locations -> load locations
        if (!locations) {
          getLocationData();    
        }

        // If no subscription -> subscribe to location table changes
        if (!subscription.current) {
          const channel = supabase.channel('test').on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Location',
            },
            (payload) => {
              getLocationData();
            }
          ).subscribe((status, err) => {
            console.log('TESTING status:', status, err);

            // Save subscription if subscription is successful
            if (status === 'SUBSCRIBED') subscription.current = channel;
          });
        }
      } catch (e: any) {
        console.log('app/page useEffect error', e.message);
        // TODO: Notification
        console.log('NOTIFY: There was an issue loading the location data');
      }
    }
    exec();

    // Cleanup
    return () => {
      if (subscription.current) supabase.removeChannel(subscription.current);
    };
  }, [session.loading, session.data, supabase]);

  return (
    <Suspense fallback={<Loading/>}>
      <MapMenuComponent locations={locations}></MapMenuComponent>
    </Suspense>
  );
}
