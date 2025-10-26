'use client'
import { convertNumberToSafety, ReducedLocation, RelationLocation, RelationRating } from "@/types/types";
import { Menu, ShowerHead, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import MapComponent from "./Map";
import { Session } from "@supabase/supabase-js";
import { useProtectorAuth } from "../auth/AuthProtector";
import { DefaultAPIRes, RatingPostReq } from "@/types/api_types";
import { request } from "@/lib/util/api";
import { convertPositionToAddress } from "./MapHelper";

export interface SidebarProps {
  type: 'null' | 'input-form' | 'location-info' | 'rating-info';
  location: RelationLocation | ReducedLocation | null;
}

function SidebarWrapper({ sidebarProps, session, setClickLocationData }: { sidebarProps: SidebarProps, session: any, setClickLocationData: (any) => void }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [state, setState] = useState<'null' | 'input-form' | 'location-info' | 'rating-info' | 'require-auth'>('null');

  useEffect(() => {
    if (!sidebarProps.location) {
      setState('null');
      return;
    }

    setIsOpen(true);
    switch (sidebarProps.type) {
      case 'input-form':
        if (session.data) setState('input-form');
        else setState('require-auth');
        break;
      case 'location-info':
        setState('location-info');
        break;
      case 'rating-info':
        setState('rating-info');
        break;
      default:
        setState('null');
        break;
    }
  }, [sidebarProps, setState, setIsOpen]);

  if (!isOpen) return <HiddenSidebar showSidebar={() => setIsOpen(true)} />

  return (
    <div className='w-8 min-w-[350px] h-full'>
      {/* TODO: make a close button */}
      <button className='absolute w-3 h-3 rounded-2xl bg-black-300 right-0.5 top-0.5' onClick={() => setIsOpen(false)}>
        <X />
      </button>

      {/* no location data -> show basic info */}
      {state === 'null' && <NormalSidebar />}

      {/* given location data -> show location into */}
      {state !== 'null' && (
        <>
          <nav>
            todo: nav w/ icons for thingy with description on hover
          </nav>
          <div className='flex-1 w-full flex flex-col p-2'>
            <div className='border-2 border-red-600 truncate'>
              {sidebarProps.location?.address}
            </div>
            <div className='border-2 border-red-600'>
              {sidebarProps.location.latitude}°lat {sidebarProps.location.longitude}°lng
            </div>

            {state === 'require-auth' && <RequireAuth />}
            {state === 'input-form' && <InputFormSidebar location={sidebarProps.location} session={session} setClickLocationData={setClickLocationData} />}
            {state === 'location-info' && <LocationInfoSidebar location={sidebarProps.location} />}
            {state === 'rating-info' && <RatingInfoSidebar location={sidebarProps.location} />}
          </div>
        </>
      )}

    </div>
  )
}

function HiddenSidebar({showSidebar}: {showSidebar: () => void}) {
  return (
    <button
      className={`absolute right-2 top-2 z-10 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700`}
      onClick={showSidebar}
      aria-label='Open sidebar'>
      <Menu size={24} />
    </button>
  )
}

function RequireAuth() {
  const { softRequireAuth } = useProtectorAuth();

  return <div>
    todo: required auth
    <button
      onClick={softRequireAuth}
    >
      Sign In
    </button>
  </div>;
}

function NormalSidebar() {
  return <div>todo: normal sidebar</div>;
}

function LocationInfoSidebar({ location }: { location: RelationLocation | ReducedLocation }) {
  return <div>todo: location info sidebar</div>;
}

function RatingInfoSidebar({ location }: { location: RelationLocation | ReducedLocation }) {
  return <div>todo: rating info sidebar</div>;
}

function InputFormSidebar({ location, session, setClickLocationData }: { location: RelationLocation | ReducedLocation, session: any, setClickLocationData: (any) => void, }) {
  const [safety, setSafety] = useState<number>(-3); // range of -2 to 2, -3 is none
  const [description, setDescription] = useState<string>('');

  const handleClickCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // NOTIFICATION: 'Enable location in order to access to feature'
      console.log('NOTIFY geolocation: ', 'Enable location in order to access to feature');
      return;
    }

    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      setClickLocationData({
        latitude: latitude,
        longitude: longitude,
        address: await convertPositionToAddress(latitude, longitude),
      })
    }, error => { },
    );
  }, [setClickLocationData, convertPositionToAddress]);

  const handleFormSubmission = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    async function exec() {
      if (session.loading) return;

      const body: RatingPostReq = {
        locationData: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
        ratingData: {
          ratingId: null,
          safety: convertNumberToSafety(safety),
          description: description,
        }
      }

      const res = await request<DefaultAPIRes>({
        type: 'POST',
        route: 'api/rating',
        body: body,
        session: session.data
      });

      // TODO:: NOTIFICATION res
      console.log('NOTIFY form submission: ', res);

      if (res.status === 'success') {
        setSafety(-3);
        setDescription('');
      }
    }
    exec();
  }, [session.loading, session.data, location.latitude, location.longitude, location.address, safety, description, setSafety, setDescription]);

  // Uses Google's writing to address api or smthing, should be able to get you the latlng
  // Using the new latlng, call setclickLocationData (lat, lng, address: string)

  return <div>todo: input form sidebar</div>;
}


interface MapMenuComponentProps {
  locations: RelationLocation[];
  session: any;
}

export default function MapMenuComponent({ locations, session }: MapMenuComponentProps) {
  const [state, setState] = useState<'page-loading' | 'null'>();

  const [sidebarData, setSidebarData] = useState<SidebarProps>({ type: 'null', location: null });

  // Global data shared by sidebar and map
  const [clickLocationData, setClickLocationData] = useState<ReducedLocation | null>(null);

  // TESTING CODE
  // useEffect(() => {
  //   console.log('DEBUGGING:', '');
  //   const timeout = setTimeout(() => {
  //   }, 3 * 1000);

  //   return () => {
  //     if (timeout) clearTimeout(timeout);
  //   }
  // }, []);

  return (
    <div className='flex w-full h-full'>
      <SidebarWrapper sidebarProps={sidebarData} session={session} setClickLocationData={setClickLocationData} />
      <MapComponent locations={locations} setSidebarData={setSidebarData} clickLocationData={clickLocationData}></MapComponent>
    </div>
  )
}