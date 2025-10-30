'use client'
import { convertNumberToSafety, ReducedLocation, RelationLocation } from '@/types/types';
import { File, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { convertPositionToAddress } from '../MapHelper';
import { DefaultAPIRes, RatingPostReq } from '@/types/api_types';
import { request } from '@/lib/util/api';
import SearchBarComponent, { useSearchBar } from '@/components/ui/SearchBar';
import StarDisplay from '@/components/ui/Star';
import RequireAuthSidebar from './RequireAuthSidebar';
import { useNotification } from '@/components/ui/Notification';

export default function InputFormSidebar({ location, session, setSelectedLocation }: { location: RelationLocation | ReducedLocation | null, session: any, setSelectedLocation: (any) => void, }) {
  const { addNotification, addNotificationStatus } = useNotification();
  
  const [state, setState] = useState<'null' | 'form-loading'>('null');
  
  // Search bar data
  const { openSearchBar, searchLocation } = useSearchBar();
  useEffect(() => { 
    if (searchLocation) {
      setSelectedLocation(searchLocation)
    }
   }, [searchLocation]);

  // Safety & description data
  const [safety, setSafety] = useState<number>(-3); // range of -2 to 2, -3 is none
  const [description, setDescription] = useState<string>('');

  function handleClickCurrentLocation() {
    if (!navigator.geolocation) {
      addNotification({ message: 'Enable location in order to access to feature', type: 'warning' });
      return;
    }
  
    // Get current location
    navigator.geolocation.getCurrentPosition(async position => {
      // Update click location with current location
      const { latitude, longitude } = position.coords;
      setSelectedLocation({
        latitude: latitude,
        longitude: longitude,
        address: await convertPositionToAddress(latitude, longitude),
      });
    }, error => { },
    );
  }

  const handleFormSubmission = useCallback(() => {
    async function exec() {
      if (session.loading) return;

      // Ensure all data is valid
      if (!location || safety < -2 || safety > 2 || !description) {
        addNotification({ message: 'Please fill out all required information before submitting a rating', type: 'error' });
        return;
      }

      setState('form-loading');

      // Send an API request to backend
      const body: RatingPostReq = {
        locationData: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
        ratingData: {
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

      addNotificationStatus(res);

      if (res.status === 'success') {
        console.log('clearing data');
        setSafety(safety != -3 ? -3: -4);
        setDescription('');
        setSelectedLocation(null);
      }

      setState('null');
    }
    exec();
  }, [session.loading, session.data, location?.latitude, location?.longitude, location?.address, safety, description, setSafety, setDescription, setSelectedLocation, setState]);

  const [truncateAddressFlag, setTruncateLocationFlag] = useState<'truncate' | ''>('');

  if (!session.data) {
    return <RequireAuthSidebar name={'submitting a rating'} session={session} />
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='font-bold text-2xl mb-6'>Rate a Location's Safety:</div>
      <div className='px-2'><div className='border-[1px] border-blue-300 w-full h-0 mb-6'></div></div>
      <div className='flex flex-col mb-7'>
        <div className='text-black text-[1.2rem] font-semibold mb-[0.4rem]'>Location:</div>
        <div className='text-gray-600 text-[1.1rem] mb-4'>Locate where this safety rating is</div>
        <div className={`px-3 text-center text-[1.2rem] mb-5 ${truncateAddressFlag}`} onClick={() => setTruncateLocationFlag((truncateAddressFlag === 'truncate') ? '' : 'truncate')}>{(location || { address: 'No Location Selected Yet' }).address}</div>
        <div className='flex-row flex items-center justify-center gap-x-3'>
          <button onClick={openSearchBar} className='bg-blue-300 rounded-[0.6rem] py-[0.5rem] px-[0.8rem]'>Choose a new location?</button>
          <div>or</div>
          <button onClick={handleClickCurrentLocation}><MapPin /></button>
        </div>
      </div>
      <div className='border-[1px] border-blue-300 w-full h-0 mb-7'></div>
      <div className='flex flex-col mb-6'>
        <div className='text-black text-[1.2rem] font-semibold mb-[0.5rem]'>Description:</div>
        <div className='text-gray-600 mb-3 text-[1.1rem]'>Provide any useful information related to this safety rating</div>
        <input
          className='border-gray-300 rounded-[0.75rem] w-full text-black bg-blue-300 px-4 py-[0.4rem]'
          type='text'
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder='By the light pole...'
        />
      </div>
      <div className='border-[1px] border-blue-300 w-full h-0 mb-6'></div>
      <div className='flex flex-col mb-6'>
        <div className='text-black text-[1.2rem] font-semibold mb-[0.5rem]'>Safety:</div>
        <div className='text-gray-600 mb-3 text-[1.1rem]'>Rate the safety of this location</div>
        <div className='w-full flex justify-center items-center'>
          <StarDisplay initialRating={safety} setInputRating={setSafety} className='text-[2.2rem]'></StarDisplay>
        </div>
      </div>
      <div className='px-3'><div className='border-[1px] border-blue-300 w-full h-0 mb-6'></div></div>
      <button
        className={`py-2 px-4 rounded-[0.5rem] font-semibold text-[1.1rem] ${state !== 'form-loading' ? 'bg-indigo-300' : 'bg-indigo-200'}`}
        onClick={handleFormSubmission}
      >
        {state !== 'form-loading' ? (
          <>
            Submit Rating
          </>) : (
          <div className='flex flex-row justify-center items-center'>
            <div className="flex justify-center space-x-2 mr-3 pt-1">
              <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0ms' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-purple-600" style={{ animationDelay: '150ms' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-pink-600" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div>    
               Loading...
            </div>
          </div>
        )}
      </button>
    </div>
  );
}