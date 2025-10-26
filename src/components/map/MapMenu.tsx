'use client'
import { ReducedLocation, RelationLocation, RelationRating } from "@/types/types";
import { Menu, ShowerHead, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import MapComponent from "./Map";
import { Session } from "@supabase/supabase-js";

export interface SidebarProps {
  type: 'null' | 'input-form' | 'location-info' | 'rating-info';
  location: RelationLocation | ReducedLocation | null;
}

function SidebarWrapper({ sidebarProps, session }: {sidebarProps: SidebarProps, session: any}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [state, setState] = useState<'null' | 'input-form' | 'location-info' | 'rating-info' | 'require-auth'>('null');

  useEffect(() => {
    switch (sidebarProps.type) {
      case 'input-form':
        if (session.data) setState('input-form');
        else setState('require-auth');
      case 'location-info':
        setState('location-info');
      case 'rating-info':
        setState('rating-info');
      default:
        setState('null');
    }
  }, [sidebarProps]);

  if (!isOpen) return <HiddenSidebar showSidebar={() => setIsOpen(true)} />

  return (
    <div className='w-full h-full'>
      <nav>
        todo: icons for thingy with description on hover
      </nav>
      <div className='flex-1 w-full flex flex-col p-2'>
        <div className='border-2 border-red-600 truncate'>
          {sidebarProps.location.address}
        </div>
        <div className='border-2 border-red-600'>
          {sidebarProps.location.latitude}°lat {sidebarProps.location.longitude}°lng
        </div>

        {state === 'require-auth' && <RequireAuth />}
        {state === 'input-form' && <InputFormSidebar session={session} />}
        {state === 'location-info' && <LocationInfoSidebar />}
        {state === 'rating-info' && <RatingInfoSidebar />}
        {state === 'null' && <NormalSidebar />}
      </div>
    </div>
  )
}

function HiddenSidebar({showSidebar}: {showSidebar: () => void}) {
  return (
    <button
      className={`right-1 absolute top-22 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700`}
      onClick={showSidebar}
      aria-label='Open sidebar'>
      <Menu size={24} />
    </button>
  )
}

function RequireAuth() {
  return <div>todo</div>;
}

function NormalSidebar() {
  return <div>todo</div>;
}

function LocationInfoSidebar() {
  return <div>todo</div>;
}

function RatingInfoSidebar() {
  return <div>todo</div>;
}

function InputFormSidebar({session}) {
  const handleFormSubmission = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    if (session.loading) return;


  }, []);

  return <div>todo</div>;
}


interface MapMenuComponentProps {
  locations: RelationLocation[];
}

export default function MapMenuComponent({ locations }: MapMenuComponentProps) {
  const [state, setState] = useState<'page-loading' | 'null'>();

  const [sidebarData, setSidebarData] = useState<SidebarProps>({ type: 'null', location: null});

  return (
    <div className='w-full h-full'>
      <MapComponent locations={locations} setSidebarData={setSidebarData}></MapComponent>
    </div>
  )
}