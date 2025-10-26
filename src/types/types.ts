import { Profile, Rating, Location } from "@/lib/prisma/generated/prisma";

export type UserRole = 'ADMIN' | 'USER' | 'GUEST';

export type ReducedLocation = {
  latitude: number;
  longitude: number;
  address: string;
}

export type RelationProfile =
  Pick<Profile, 'id'> &
  Partial<Pick<Profile, 'createdAt' | 'updatedAt' | 'name' | 'email' | 'role'>> &
  {
    ratings?: RelationRating[];
  }

export type RelationLocation =
  Pick<Location, 'id' | 'longitude' | 'latitude' | 'address'> &
  Partial<Pick<Location, 'createdAt' | 'updatedAt'>> &
  {
    ratings?: RelationRating[];
  }

export type RelationRating =
  Pick<Rating, 'id' | 'description' | 'safety'> &
  Partial<Pick<Rating, 'createdAt' | 'updatedAt' | 'profileId' | 'locationId'>> &
  {
    profile?: RelationProfile;
    location?: RelationLocation;
  }