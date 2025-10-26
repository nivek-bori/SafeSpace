import { Safety } from "@/lib/prisma/generated/prisma";
import { RelationLocation, RelationProfile } from "./types";

export interface DefaultAPIRes {
  status: 'success' | 'error';
  message: string;
}

// AUTH
export type AuthReq = {
  userId?: string;
  email: string;
  name: string;
}

export type AuthRes = DefaultAPIRes & {
  profile?: Partial<RelationProfile>;
}


// PROFILE
export type ProfileGetRes = {
  status: 'success' | 'error';
  message: string;
  profile?: RelationProfile;
}


// LOCATION
export type LocationGetRes = DefaultAPIRes & {
  locations?: RelationLocation[],
}


// RATING
export type RatingPostReq = {
  locationData: string | {
    locationName: string,
    latitude: number,
    longitude: number,
    address: string | null,
  },
  ratingData: {
    ratingId: string | null,
    safety: Safety,
    description: string,
  }
}