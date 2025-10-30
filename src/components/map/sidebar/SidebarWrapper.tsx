import { useEffect, useState } from "react";
import { File, Home, TriangleAlert, Menu, Trees, X } from "lucide-react";
import NormalSidebar from "./NormalSidebar";
import InputFormSidebar from "./InputFormSidebar";
import LocationInfoSidebar from "./LocationInfoSidebar";
import RatingInfoSidebar from "./RatinginfoSidebar";
import { ReducedLocation, RelationLocation } from "@/types/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProtectorAuth } from "@/components/auth/AuthProtector";

export type SidebarTypes = 'null' | 'input-form' | 'location-info' | 'rating-info';
export interface SidebarWrapperProps {
  type: SidebarTypes;
  session: any;
  selectedLocation: RelationLocation | ReducedLocation | null;
  setSelectedLocation: (any) => void;
}


export default function SidebarWrapper({ type, session, selectedLocation, setSelectedLocation }: SidebarWrapperProps) {
  const { signOut } = useAuth();
  const { softRequireAuth } = useProtectorAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [state, setState] = useState<SidebarTypes>('null');

  // New sidebar type
  useEffect(() => {
    setIsOpen(true);
    setState(type);
  }, [type, setState, setIsOpen]);

  // Selected or not selected nav bar item
  function getNavbarClassName(isSelected: boolean) {
    return `flex items-center justify-center flex-1 h-full ${isSelected ? 'bg-gradient-to-br from-blue-200 to-indigo-200 border-b-2 border-x-[1px] border-transparent' : 'border-b-2 border-transparent border-x-[1px] border-gray-200 bg-white'}`
  }

  const [truncateLocationFlag, setTruncateLocationFlag] = useState<'truncate' | ''>('truncate');

  return (
    <>
      {!isOpen && (
        <button
          className={`absolute left-2 top-[60px] z-10 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700`}
          onClick={() => setIsOpen(true)}
          aria-label='Open sidebar'>
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div className='flex flex-col w-120 min-w-[320px]'>
          <nav className='flex-grow-0 flex flex-row h-12 max-h-12 border-b-2 border-gray-500'>
            <button className={getNavbarClassName(state === 'null')} onClick={() => { if (state !== 'null') setState('null') }}>
              <Home />
            </button>
            <button className={getNavbarClassName(state === 'location-info')} onClick={() => { if (state !== 'location-info') setState('location-info') }}>
              <Trees />
            </button>
            <button className={getNavbarClassName(state === 'rating-info')} onClick={() => { if (state !== 'rating-info') setState('rating-info') }}>
              <TriangleAlert />
            </button>
            <button className={getNavbarClassName(state === 'input-form')} onClick={() => { if (state !== 'input-form') setState('input-form') }}>
              <File />
            </button>
            <button className='flex items-center justify-center flex-1 h-full bg-gray-200' onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </nav>

          <div className='flex flex-col w-full h-full flex-1 overflow-y-auto leading-tight bg-gradient-to-b from-blue-100 to-indigo-100 border-r-2 border-gray-300 px-[1.6rem] py-[1.8rem]'>
            {/* if location data & sidebar that wants location data -> display location header info (address + latlng) */}
            {selectedLocation && !['null', 'input-form'].includes(state) && (
              <button onClick={() => setTruncateLocationFlag((truncateLocationFlag === 'truncate') ? '' : 'truncate')} className='w-full border-b-2 pb-5 mb-6 border-gray-300'>
                <div className='pb-3'>
                  <div className='text-left text-[1.2rem] mb-2'>Location:</div>
                  <div className={`text-3xl font-semibold ${truncateLocationFlag}`}>{selectedLocation.address}</div>
                </div>
                <div className='text-right text-gray-600'>
                  {selectedLocation.latitude}°lat, {selectedLocation.longitude}°lng
                </div>
              </button>
            )}
            {/* the rest of the sidebar */}
            <div className='w-full flex-1'>
              {state === 'null' && <NormalSidebar setState={setState} />}
              {state === 'input-form' && <InputFormSidebar location={selectedLocation} session={session} setSelectedLocation={setSelectedLocation} />}
              {state === 'location-info' && <LocationInfoSidebar location={selectedLocation} setState={setState} />}
              {state === 'rating-info' && <RatingInfoSidebar location={selectedLocation} setState={setState} />}
            </div>
            {!['input-form'].includes(state) && (
              <div className='w-full'>
                  <button
                    onClick={session?.data ? signOut : softRequireAuth }
                    className='w-full py-2 text-black text-[1.2rem] font-semibold rounded-3xl bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300'
                  >
                    {session?.data ? <>Sign out</> : <>Sign in</>}
                  </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}