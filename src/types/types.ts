import { GoogleAccountsConfig, GoogleAuthResponse, GoogleRenderConfig } from "@/components/auth/GoogleButton";
import { Profile, Rating, Location, Safety } from "@/lib/prisma/generated/prisma";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize?: (config: GoogleAccountsConfig) => void;
          renderButton?: (element: HTMLElement, config: GoogleRenderConfig) => void;
          prompt?: () => void;
        };
      };
    };
    googleAuthCallback?: (response: GoogleAuthResponse) => void;
    gmpShadowPatched: boolean;
  }
}

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

// Safety = "NEG_TWO" | "NEG_ONE" | "ZERO" | "ONE" | "TWO"
export function convertSafetyToNumber(safety: Safety): number {
  switch (safety) {
    case "NEG_TWO":
      return -2;
    case "NEG_ONE":
      return -1;
    case "ZERO":
      return 0;
    case "ONE":
      return 1;
    case "TWO":
      return 2;
    default:
      throw new Error("Invalid Safety value");
  }
}

export function convertNumberToSafety(safetyNum: number): Safety {
  switch (safetyNum) {
    case -2:
      return "NEG_TWO";
    case -1:
      return "NEG_ONE";
    case 0:
      return "ZERO";
    case 1:
      return "ONE";
    case 2:
      return "TWO";
    default:
      throw new Error("Invalid safety number");
  }
}