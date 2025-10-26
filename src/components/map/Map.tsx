'use client'

import { config } from "@/lib/config";
import { Loader } from "@googlemaps/js-api-loader";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReducedLocation, RelationLocation } from '@/types/types'
import { calculateLocationColor, ClusterRenderer, convertPositionToAddress, createMarkerData, onClusterCLick, smoothZoom } from "./MapHelper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { SidebarProps } from "./MapMenu";

declare global {
  interface Window {
    initMap: () => void;
    googleMaps: any;
  }
}

interface MapProps {
  locations: RelationLocation[];
  setSidebarData: (sidebarProps: SidebarProps) => void;
  clickLocationData: ReducedLocation;
}

export default function MapComponent({ locations, setSidebarData, clickLocationData }: MapProps) {
  const [state, setState] = useState<'page-loading' | 'null'>('page-loading');

  // Map
  const mapHTMLRef = useRef(null); // Reference to map in html
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to map

  // Markers
  const markersRef = useRef<any>(null); // Reference to all location's markers
  
  // Click data
  const clickMarkerRef = useRef<any>(null); // Reference to current click's marker

  // user interaction
  const handleMapClick = useCallback((location: RelationLocation | ReducedLocation) => {
    // Potentially zoom onto click location
    setSidebarData({ type: 'input-form', location: location }); // display the appropriate sidebar
  }, [setSidebarData]);

  const handleMarkerClick = useCallback((location: RelationLocation | ReducedLocation) => {
    // Pan to and zoom onto clicked location
    mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    setTimeout(() => smoothZoom(mapRef.current, 12, mapRef.current.getZoom()), 350);

    // Update sidebar to match
    setSidebarData({ type: 'location-info', location: location })
  }, [setSidebarData]);

  // render location's markers onto map
  const renderLocations = useCallback(async (locations: ReducedLocation[]) => {
    // clear all location's markers
    if (markersRef.current) {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = null;
    }

    const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

    // create markers
    const markers = locations.map((loc: RelationLocation) => {
      // create marker data
      const markerContentData = createMarkerData(document, calculateLocationColor(loc));

      // create marker
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: loc.latitude, lng: loc.longitude },
        title: loc.address,
        content: markerContentData,
      }) as any;
      marker.loc = loc;

      // handle marker click (zoom onto click, display location-info sidebar)
      marker.addListener('click', () => handleMarkerClick(loc));

      return marker;
    });

    markersRef.current = markers;

    // Create cluster render
    new MarkerClusterer({ markers, map: mapRef.current, renderer: new ClusterRenderer(), onClusterClick: onClusterCLick });
  }, [handleMarkerClick, calculateLocationColor, createMarkerData, onClusterCLick]);

  // render click's marker onto map
  const renderLocation = useCallback(async (location: ReducedLocation) => {
    // clear all location's markers
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

    // create marker data, set to blue color
    const markerContentData = createMarkerData(document, "#4285F4");

    // create marker
    const marker = new AdvancedMarkerElement({
      map: mapRef.current,
      position: { lat: location.latitude, lng: location.longitude },
      title: location.address,
      content: markerContentData,
    }) as any;
    marker.loc = location;

    // handle marker click (zoom onto click, display input-form sidebar because no actual location data on this marker)
    marker.addListener('click', () => handleMapClick(location));

    clickMarkerRef.current = marker;
  }, [handleMapClick, createMarkerData]);

  // initialze map
  useEffect(() => {
    const loader = new Loader({
      apiKey: config.google.key!,
      version: 'weekly',
      libraries: ['places', 'marker'],
    });

    loader
      .load()
      .then(async () => {
        const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;

        let defaultLat = 0;
        let defaultLng = 0;
        let defaultZoom = 1;

        // If user location is given -> zoom into region
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async position => {
              const { latitude: lat, longitude: lng } = position.coords;
              defaultLat = lat;
              defaultLng = lng;
              defaultZoom = 13;
            }, error => { },
          );
        }

        // create map
        const map = new Map(mapHTMLRef.current!, {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: defaultZoom,
          mapId: config.google.map_id,
          minZoom: 3,
        });
        mapRef.current = map;

        // Listen for click on map
        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const location: ReducedLocation = {
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng(),
              address: await convertPositionToAddress(e.latLng.lat(), e.latLng.lng()),
            }
            renderLocation(location); // Render the new marker
            handleMapClick(location); // Handle the click on map
          }
        });
      })
      .catch(error => {
        console.error('components/map/map/useEffect error: ', error);
      });
    
    setState('null');
  }, [renderLocation, handleMapClick, convertPositionToAddress, setState]);

  // render any changes to location
  useEffect(() => {
    if (locations) {
      renderLocations(locations);
    }
  }, [locations]);

  useEffect(() => {
    if (clickLocationData) {
      renderLocation(clickLocationData);
      handleMapClick(clickLocationData);
    }
  }, [clickLocationData]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
        <div ref={mapHTMLRef} className="flex-1"></div>
    </div>
  );
}