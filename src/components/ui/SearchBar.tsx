'use client'
import { config } from '@/lib/config';
import { ReducedLocation } from '@/types/types';
import { X } from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback, createContext, useContext, useMemo } from 'react';
import { useNotification } from './Notification';

interface SearchContextType {
  openSearchBar: () => void;
  searchLocation: ReducedLocation;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearchBar() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within an SearchBarComponent');
  }
  return context;
}

interface SearchProps {
  children: React.ReactNode;
}

export default function SearchBarComponent({ children }: SearchProps) {
  const { addNotification } = useNotification();

  // Loading Google Maps library
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Search bar DOM element refernences
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const placeSelectHandlerRef = useRef<any>(null);
  
  // Search popup
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Data
  const [searchLocation, setSearchLocation] = useState<ReducedLocation | null>(null); // Location updates with searches
  const [location, setLocation] = useState<ReducedLocation | null>(null); // Publicly realeased location, only released when user clicks

  const cleanup = useCallback(() => {
    setIsOpen(false);
    setSearchLocation(null);

    if (autocompleteRef.current.shadowRoot) {
      const input = autocompleteRef.current.shadowRoot.querySelector('input');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, [setIsOpen, setSearchLocation]);

  function handleSearchSubmit() {
    if (!searchLocation) {
      addNotification({ message: 'Please enter a select before submitting', type: 'warning' });
      return;
    }

    setLocation(searchLocation); // release data to public release
    cleanup();
  }

  // Load APi script requirements
  useEffect(() => {
    if (window.google) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.google.key}&l=places&v=weekly&loading=async&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Access code from APi
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !isOpen) {
      return;
    }

    let mounted = true;

    async function initAutocomplete() {
      try {
        // @ts-ignore
        await window.google.maps.importLibrary('places') as window.google.maps.PlacesLibrary;
        // @ts-ignore
        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement();
        placeAutocomplete.id = 'place-autocomplete-input';

        if (mounted && containerRef.current) {
          containerRef.current.appendChild(placeAutocomplete);
          autocompleteRef.current = placeAutocomplete;
        }

        // Store handler for cleanup
        const handlePlaceSelect = async ({ placePrediction }: any) => {
          // @ts-ignore
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress', 'location'] });

          if (mounted) {
            const newSelectedPlace = {
              address: place.formattedAddress,
              latitude: place.location.lat(),
              longitude: place.location.lng(),
            };
            setSearchLocation(newSelectedPlace);
            console.log('Selected place:', newSelectedPlace);
          }
        };
        placeAutocomplete.addEventListener('gmp-select', handlePlaceSelect);
        placeSelectHandlerRef.current = handlePlaceSelect;
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current && placeSelectHandlerRef.current) {
        autocompleteRef.current.removeEventListener('gmp-select', placeSelectHandlerRef.current);
        if (containerRef.current && containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [isScriptLoaded, isOpen]);

  const value = useMemo(() => ({
    openSearchBar: () => setIsOpen(true),
    searchLocation: location,
  }), [location]);

  return (
    <SearchContext.Provider value={value}>
      {isOpen && (
        <div id='search-container' className='w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl'>
          <button className='absolute right-5 top-5 w-12 h-12 rounded-[1rem] bg-gray-400 flex items-center justify-center' onClick={() => setIsOpen(false)}><X /></button>
          <div className='text-left text-[1.4rem]'>Location:</div>
          <div className={`text-3xl font-semibold mb-4 leading-none`}>{searchLocation ? searchLocation.address : 'No Location Selected Yet'}</div>
          <div className='flex flex-row'>
            <div
              ref={containerRef}
              className='mr-5'
              style={{ minHeight: '40px' }}
            />
            <button onClick={handleSearchSubmit} className='bg-blue-300 rounded-2xl border-[1px] border-indigo-400 py-3 px-5 font-semibold'>Submit</button>
          </div>
        </div>
      )}

      {children}
    </SearchContext.Provider>
  );
}