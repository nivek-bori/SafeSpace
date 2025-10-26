// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { Menu, X } from 'lucide-react';
// import { Loader } from '@googlemaps/js-api-loader';
// import { Location, RatingCreateArgs } from '@/types';
// import { getMarker, MarkerPopup, onClusterCLick, Renderer, TemporaryMarkerPopup } from './location';
// import { MarkerClusterer } from '@googlemaps/markerclusterer';
// import Loading from '../ui/loading';
// import MessageBox from '../ui/message';
// import { config } from '@/lib/config';
// import axios from 'axios';
// import { useAuth } from '../auth/auth-provider';
// import { createRoot } from 'react-dom/client';
// import { useRouter } from 'next/navigation';

// declare global {
//   interface Window {
//     initMap: () => void;
//     googleMaps: any;
//   }
// }

// export default function Map() {
//   const [status, setStatus] = useState<{ status: 'null' | 'error' | 'success' | 'loading'; message: string }>({ status: 'null', message: '' });

//   const { user } = useAuth();
//   const router = useRouter();

//   const htmlMapRef = useRef(null);
//   const mapRef = useRef<google.maps.Map | null>(null);
//   const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

//   const tempMarkerRef = useRef<any>(null);
//   const markersRef = useRef<any>(null);

//   const [dbLocId, setdbLocId] = useState<string | null>(null);
//   const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);
//   const [locName, setLocName] = useState<string>('');
//   const [showSidebar, setShowSidebar] = useState<boolean>(false);

//   // initialze map
//   useEffect(() => {
//     setStatus({ status: 'loading', message: 'Loading...' });

//     const loader = new Loader({
//       apiKey: config.google.key!,
//       version: 'weekly',
//       libraries: ['places', 'marker'],
//     });

//     loader
//       .load()
//       .then(async () => {
//         const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;

//         let defaultLat = 0;
//         let defaultLng = 0;
//         let defaultZoom = 1;

//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(
//             position => {
//               const { latitude, longitude } = position.coords;
//               setLatLng({ lat: latitude, lng: longitude });
//               defaultLat = latitude;
//               defaultLng = longitude;
//               defaultZoom = 13;
//             },
//             error => { },
//           );
//         }

//         const map = new Map(htmlMapRef.current!, {
//           center: { lat: defaultLat, lng: defaultLng },
//           zoom: defaultZoom,
//           mapId: config.google.map_id,
//           minZoom: 3,
//         });
//         mapRef.current = map;

//         map.addListener('click', async (e: google.maps.MapMouseEvent) => {
//           if (e.latLng) {
//             const lat = e.latLng.lat();
//             const lng = e.latLng.lng();
//             const name = await latLngToName(lat, lng);
//             setTemporaryMarker(lat, lng, name);
//             setLocName(name);
//             setLatLng({ lat: lat, lng: lng });
//           }
//         });

//         if (!infoWindowRef.current) {
//           infoWindowRef.current = new google.maps.InfoWindow();
//         }

//         const locations = await loadLocations();
//         await populateMarkers(locations);
//         setStatus({ status: 'null', message: '' })
//       })
//       .catch(error => {
//         console.error('Error loading Google Maps:', error);
//       });
//   }, [setLatLng]);

//   // load locations
//   const loadLocations = async () => {
//     // api call to get locations
//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/location`);
//       if (res.data && res.data.locations) {
//         console.log(res.data.locations);
//         return res.data.locations;
//       } else {
//         return [];
//       }
//     } catch (err) {
//       console.error('Failed to fetch locations:', err);
//       return [];
//     }
//   };

//   // render locations
//   const populateMarkers = async (locations: Location[]) => {
//     if (markersRef.current) {
//       // clear all markers
//       markersRef.current.forEach((marker: any) => marker.setMap(null));
//       markersRef.current = null;
//     }

//     const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

//     const markers = locations.map(loc => {
//       // color
//       const temp_color_hex_str = `#${Math.floor(Math.random() * 16777215)
//         .toString(16)
//         .padStart(6, '0')}`;
//       const markerContent = getMarker(document, temp_color_hex_str); // TODO: Color based on rating

//       // marker
//       const marker = new AdvancedMarkerElement({
//         map: mapRef.current,
//         position: { lat: loc.latitude, lng: loc.longitude },
//         title: loc.name,
//         content: markerContent,
//       });

//       // info window of marker
//       marker.addListener('click', () => {
//         onMarkerClicked(marker, loc, false);
//         setdbLocId(loc.id);
//       });

//       return marker;
//     });

//     markersRef.current = markers;
//     new MarkerClusterer({ markers, map: mapRef.current, renderer: new Renderer(), onClusterClick: onClusterCLick });
//   };

//   const populateTemporaryMarker = async (location: Location) => {
//     const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

//     // random color
//     const temp_color_hex_str = `#${Math.floor(Math.random() * 16777215)
//       .toString(16)
//       .padStart(6, '0')}`;
//     const markerContent = getMarker(document, temp_color_hex_str);

//     // marker
//     const marker = new AdvancedMarkerElement({
//       map: mapRef.current,
//       position: { lat: location.latitude, lng: location.longitude },
//       title: location.name,
//       content: markerContent,
//     });

//     onMarkerClicked(marker, location, true);
//     setdbLocId(null);

//     marker.addListener('click', () => {
//       onMarkerClicked(marker, location, true);
//       setdbLocId(null);
//     });

//     return marker;
//   };

//   // user interaction
//   const onMarkerClicked = (marker: any, location: any, temporary: boolean) => {
//     if (infoWindowRef.current) {
//       setLocName(location.name);
//       setLatLng({ lat: location.latitude, lng: location.longitude });

//       const content = !temporary ? (
//         <MarkerPopup
//           location={location}
//           onAddRating={() => setShowSidebar(true)}
//         />
//       ) : (
//         <TemporaryMarkerPopup
//           location={location}
//           onAddRating={() => setShowSidebar(true)}
//         />
//       );

//       renderReactIntoInfoWindow(infoWindowRef.current, content);
//       infoWindowRef.current.open(mapRef.current, marker);
//     }
//   };

//   // allows for react in the info window
//   function renderReactIntoInfoWindow(infoWindow: google.maps.InfoWindow, content: React.ReactElement) {
//     let container = infoWindow.getContent() as HTMLDivElement;
//     let root: any;

//     if (!container || !container.dataset.reactRoot) {
//       container = document.createElement('div');
//       container.dataset.reactRoot = 'true';
//       root = createRoot(container);
//       (container as any).__reactRoot = root;
//       infoWindow.setContent(container);
//     } else {
//       root = (container as any).__reactRoot;
//     }

//     root.render(content);
//     return { container, root };
//   }

//   const setTemporaryMarker = async (lat: number, lng: number, name: string) => {
//     // remove old marker
//     if (tempMarkerRef.current) {
//       tempMarkerRef.current.setMap(null); // unlinks from map
//       tempMarkerRef.current = null;
//     }

//     // create new marker
//     const newLocation: Location = {
//       id: '-1', // -1 for temporary/unsaved
//       latitude: lat,
//       longitude: lng,
//       name: `Your selected location: ${name}`,
//       description: "Leave a rating about this place's safetyness?",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     const marker = await populateTemporaryMarker(newLocation);
//     tempMarkerRef.current = marker;
//   };

//   const latLngToName = async (lat: number, lng: number) => {
//     const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.google.key}`);

//     const data = await response.json();
//     if (data.status === 'OK' && data.results[0]) {
//       const address = data.results[0].formatted_address;
//       return address;
//     }
//   };

//   const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user || !user.id) {
//       setStatus({ status: 'error', message: 'Please sign in before creating a review. Redirecting you in a few seconds...' });
//       setTimeout(() => router.push('/auth/sign-in'), 3000);
//       return;
//     }

//     const form = e.currentTarget;
//     const data = new window.FormData(form);

//     const locationDescription = data.get('location_description');
//     const ratingDescription = data.get('rating_description');
//     const rating = Number(data.get('rating'));
//     const timeValue = data.get('time');
//     const time = timeValue ? new Date(timeValue.toString()) : new Date();

//     if (dbLocId) {
//       const ratingBody: RatingCreateArgs = {
//         userId: user.id,
//         locationId: dbLocId,
//         description: ratingDescription ? ratingDescription.toString() : '',
//         rating: rating,
//         time: time,
//       };
//       // create new rating with current location id
//       axios
//         .post(`${process.env.NEXT_PUBLIC_APP_URL}/api/rating`, ratingBody)
//         .then(async res => {
//           setStatus({ status: 'success', message: 'Successfully saved rating' });
//           setTimeout(() => {
//             if (status.status === 'success') setStatus({ status: 'null', message: '' });
//           }, 3000);
//           const locations = await loadLocations();
//           populateMarkers(locations);
//           if (infoWindowRef.current) infoWindowRef.current.close();
//         })
//         .catch(err => {
//           setStatus({ status: 'error', message: 'Failed to create new rating' });
//         });
//     } else {
//       // create new location and get location id
//       if (!latLng) return; // safety check
//       axios
//         .post(`${process.env.NEXT_PUBLIC_APP_URL}/api/location`, {
//           name: locName.substring(24) || 'Untitled',
//           description: locationDescription ? locationDescription.toString() : '',
//           latitude: latLng.lat,
//           longitude: latLng.lng,
//         })
//         .then(res => {
//           const locationId = res.data.locationId;
//           if (locationId) {
//             // create new rating at created location
//             const ratingBody: RatingCreateArgs = {
//               userId: user.id,
//               locationId,
//               description: ratingDescription ? ratingDescription.toString() : '',
//               rating: rating,
//               time: time,
//             };
//             return axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/rating`, ratingBody);
//           } else {
//             throw new Error('Failed to create new location');
//           }
//         })
//         .then(async () => {
//           setStatus({ status: 'success', message: 'Successfully saved rating' });
//           setTimeout(() => {
//             if (status.status === 'success') setStatus({ status: 'null', message: '' });
//           }, 3000);
//           const locations = await loadLocations();
//           populateMarkers(locations);
//           if (infoWindowRef.current) infoWindowRef.current.close();
//         })
//         .catch(err => {
//           setStatus({ status: 'error', message: 'Failed to create new rating' });
//         });
//     }
//   };

//   return (
//     <div className="flex flex-col w-full h-full overflow-hidden">
//       {status.status === 'loading' && <Loading message={'Loading map...'} />}

//       <div className="flex flex-1">
//         <div ref={htmlMapRef} className="flex-1"></div>

//         {status.status !== 'loading' && (
//           <button
//             className={`${showSidebar ? 'right-81' : 'right-1'} absolute top-22 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700`}
//             onClick={() => setShowSidebar(v => !v)}
//             aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}>
//             {showSidebar ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         )}

//         {status.status !== 'loading' && showSidebar && (
//           <div className="z-10 flex h-full w-80 flex-col gap-4 rounded-lg border border-gray-200 bg-white/95 p-6 shadow-lg">
//             {status.status === 'success' && <MessageBox color="green" className="mb-3" children={status.message} />}
//             {status.status === 'error' && <MessageBox color="red" className="mb-3" children={status.message} />}
//             {status.status === 'null' && latLng == null && (
//               <MessageBox color="blue" className="mb-3" children={'Please select a location before leaving a rating'} />
//             )}
//             <div className={`${latLng == null ? 'pointer-events-none opacity-50' : ''} flex flex-col gap-y-4`}>
//               {/* header + description */}
//               <div>
//                 <h2 className="mb-1 text-lg font-semibold">Add New Rating To:</h2>
//                 <span className="text-gray-500">{locName}</span>
//               </div>

//               {/* form inputs */}
//               <form onSubmit={handleFormSubmission} className="flex flex-col gap-3">
//                 <label className="flex flex-col gap-1">
//                   <span className="font-medium">Rating</span>
//                   <input
//                     type="number"
//                     min={1}
//                     max={5}
//                     className="rounded border px-2 py-1"
//                     placeholder="1-5"
//                     disabled={latLng == null}
//                     name="rating"
//                   />
//                 </label>
//                 {!dbLocId && (
//                   <label className="flex flex-col gap-1">
//                     <span className="font-medium">Location Description</span>
//                     <input
//                       type="text"
//                       className="rounded border px-2 py-1"
//                       placeholder="Location Description"
//                       disabled={latLng == null}
//                       name="location_description"
//                     />
//                   </label>
//                 )}
//                 <label className="flex flex-col gap-1">
//                   <span className="font-medium">Rating Description</span>
//                   <input type="text" className="rounded border px-2 py-1" placeholder="Rating Description" disabled={latLng == null} name="rating_description" />
//                 </label>
//                 <label className="flex flex-col gap-1">
//                   <span className="font-medium">Time</span>
//                   <div className="flex items-center gap-2">
//                     <input type="datetime-local" className="flex-1 rounded border px-2 py-1" disabled={latLng == null} name="time" />
//                     <button
//                       type="button"
//                       className="rounded bg-gray-200 px-2 py-1 text-xs"
//                       onClick={() => {
//                         const now = new Date();
//                         const local = now.toISOString().slice(0, 16);
//                         const input = document.querySelector('input[type=\"datetime-local\"]') as HTMLInputElement;
//                         if (input) input.value = local;
//                       }}
//                       disabled={latLng == null}>
//                       Now
//                     </button>
//                   </div>
//                 </label>

//                 {/* buttons (cancel and save) */}
//                 <div className="mt-4 flex gap-3">
//                   <button
//                     className="flex-1 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
//                     onClick={() => setShowSidebar(false)}
//                     disabled={latLng == null}>
//                     Cancel
//                   </button>
//                   <button className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" disabled={latLng == null}>
//                     Save
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }