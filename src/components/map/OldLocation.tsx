// 'use client';

// import React, { useState } from 'react';
// import { Location, Rating } from '@/types';

// // MARKERS
// interface MarkerPopupParams {
//   location: Location;
//   onAddRating: () => void;
// }

// function RatingCard({ rating }: { rating: Rating }) {
//   return (
//     <div className="flex-1 rounded-lg border border-gray-200 bg-white/95 p-3 shadow">
//       <div className="font-semibold text-blue-700">{rating.user?.name || rating.user?.email || 'Anonymous'}</div>
//       <div className="text-lg font-bold">{`Safety: ${rating.value}/5`}</div>
//       <div className="text-xs text-gray-500">
//         {new Date(rating.time).toLocaleString(undefined, {
//           year: 'numeric',
//           month: 'short',
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         })}
//       </div>
//       {rating.description && <div className="mb-1 font-bold text-black">{'Description: ' + rating.description}</div>}
//     </div>
//   );
// }

// export function MarkerPopup({ location, onAddRating }: MarkerPopupParams) {
//   const [current, setCurrent] = useState<number>(0);
//   const ratings = location.ratings || [];

//   const goLeft = () => setCurrent(c => (c === 0 ? ratings.length - 1 : c - 1));
//   const goRight = () => setCurrent(c => (c === ratings.length - 1 ? 0 : c + 1));

//   return (
//     <div className="flex w-72 flex-col gap-2 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg">
//       <div>
//         <div className="mb-[0.5rem] text-lg font-semibold">{location.name}</div>
//         <div className="text-sm text-gray-700">{`Additional location information:`}</div>
//         <div className="text-sm font-medium text-gray-700">{location.description}</div>
//       </div>

//       {/* Carousel */}
//       {ratings.length > 0 ? (
//         <div className="flex flex-col items-center gap-2">
//           <div className="flex w-full items-center gap-2">
//             <button onClick={goLeft} className="rounded bg-gray-200 px-2 py-1 transition-colors hover:bg-gray-300">
//               ◀
//             </button>
//             <RatingCard rating={ratings[current]} />
//             <button onClick={goRight} className="rounded bg-gray-200 px-2 py-1 transition-colors hover:bg-gray-300">
//               ▶
//             </button>
//           </div>
//           <div className="text-xs text-gray-500">
//             {current + 1} / {ratings.length}
//           </div>
//         </div>
//       ) : (
//         <div className="text-sm text-gray-400 italic">No ratings yet</div>
//       )}

//       <button
//         onClick={() => { onAddRating(); }}
//         className="mt-2 w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700">
//         Add Rating
//       </button>
//     </div>
//   );
// }

// export function TemporaryMarkerPopup({ location, onAddRating }: MarkerPopupParams) {
//   return (
//     <div className="flex w-72 flex-col gap-2 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg">
//       <div className="mb-1 text-lg font-semibold">{location.name}</div>
//       <div className="mb-2 text-sm text-gray-700">{location.description}</div>
//       <button
//         onClick={onAddRating}
//         id="add-rating-btn"
//         className="mt-2 w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700">
//         Add Your Rating
//       </button>
//     </div>
//   );
// }

// export function getMarker(document: any, hex: string) {
//   const markerContent = document.createElement('div');
//   markerContent.style.background = hex;
//   markerContent.style.width = '24px';
//   markerContent.style.height = '24px';
//   markerContent.style.borderRadius = '50%';
//   markerContent.style.border = '2px solid #fff';
//   return markerContent;
// }

// // CLUSTERS
// function coordsToColor(lat: number, lng: number) {
//   const normLat = (lat + 90) / 180;
//   const normLng = (lng + 180) / 360;

//   const min = 50;
//   const max = 150;
//   const range = max - min;
//   const r = Math.round(normLat * range + min);
//   const g = Math.round(normLng * range + min);
//   const b = Math.round(((normLat + normLng) / 2) * range + min);

//   return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
// }

// export class Renderer {
//   public render(cluster: any, stats: any, map: google.maps.Map) {
//     const pos = cluster.position;
//     const color = coordsToColor(pos.lat(), pos.lng()); // You can pass min/max if desired

//     const svg = `<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
//                     <circle cx="120" cy="120" opacity="1.0" r="50" />
//                     <circle cx="120" cy="120" opacity=".8" r="80" />
//                     <circle cx="120" cy="120" opacity=".7" r="100" stroke="#000" stroke-width="6"/>
//                     <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${cluster.count}</text>
//                   </svg>`;
//     const parser = new DOMParser();
//     const svgEl = parser.parseFromString(svg, 'image/svg+xml').documentElement;
//     svgEl.setAttribute('transform', 'translate(0 25)');

//     const title = `${cluster.count} Locations`;

//     const marker = new google.maps.marker.AdvancedMarkerElement({
//       map: map,
//       position: cluster.position,
//       title: title,
//       content: svgEl,
//     });

//     return marker;
//   }
// }

// export const onClusterCLick = (_: google.maps.MapMouseEvent, cluster: any, map: google.maps.Map): void => {
//   if (cluster.bounds) {
//     map.fitBounds(cluster.bounds, { top: 200, bottom: 200, left: 200, right: 200 });
//   }
// };