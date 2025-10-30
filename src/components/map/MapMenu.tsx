'use client'
import { convertNumberToSafety, ReducedLocation, RelationLocation, RelationRating } from "@/types/types";
import { Home, Menu, File, Trees, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import MapComponent from "./Map";
import { Session } from "@supabase/supabase-js";
import { useProtectorAuth } from "../auth/AuthProtector";
import { DefaultAPIRes, RatingPostReq } from "@/types/api_types";
import { request } from "@/lib/util/api";
import { convertPositionToAddress } from "./MapHelper";
import InputFormSidebar from "./sidebar/InputFormSidebar";
import LocationInfoSidebar from "./sidebar/LocationInfoSidebar";
import RatingInfoSidebar from "./sidebar/RatinginfoSidebar";
import NormalSidebar from "./sidebar/NormalSidebar";
import SidebarWrapper, { SidebarTypes } from "./sidebar/SidebarWrapper";

interface MapMenuComponentProps {
  locations: RelationLocation[];
  session: any;
}

// Coordinate map and sidebar communication
export default function MapMenuComponent({ locations, session }: MapMenuComponentProps) {
  // Global data shared by sidebar and map

  // Global state for what the sidebar should display
  const [sidebarType, setSidebarType] = useState<SidebarTypes>('null');
  // Global state for whe h user clicked
  const [selectedLocation, setSelectedLocation] = useState<RelationLocation | ReducedLocation | null>(null);

  return (
    <div className='flex w-full h-full'>
      <SidebarWrapper type={sidebarType} session={session} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
      <MapComponent locations={locations} setSidebarType={setSidebarType} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
    </div>
  )
}