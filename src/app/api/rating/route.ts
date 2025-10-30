import { Safety } from "@/lib/prisma/generated/prisma";
import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DefaultAPIRes } from "@/types/api_types";
import { ReducedLocation } from "@/types/types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';
import { roundDecimalPlace } from "@/lib/util/util";

type PostRequestFull = {
  userId: string,
  locationData: string | ReducedLocation, // id or minium required data
  ratingData: {
    ratingId: string | null,
    safety: Safety,
    description: string,
  }
}

export async function POST(request: Request) {
  try {
    const {supabase, user, error: user_error} = await getUserServer(request);
    if (user_error) return user_error;

    // Data
    const body = await request.json();

    const props = {
      userId: user.id,
      locationData: body.locationId || {
        latitude: roundDecimalPlace(body.locationData.latitude, 3),
        longitude: roundDecimalPlace(body.locationData.longitude, 3),
        address: body.locationData.address || null,
      },
      ratingData: {
        safety: body.ratingData.safety,
        description: body.ratingData.description,
      }
    };

    const props_error = verifyBody<PostRequestFull>(props, 'api/rating post');
    if (props_error) return props_error;

    const { userId, locationData, ratingData } = props;

    // Create/Get location
    let locationId = null;
    const locationCreated = typeof locationData !== 'string';
    
    if (!locationCreated) {
      // location id provided -> use location
      const location = await prisma.location.findUnique({
        where: {
          id: locationData,
        }
      });

      if (!location) {
        console.log(`api/rating post error: provided location id not found ${locationData}`);
        return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue saving your rating' }, {status: 400});
      }

      locationId = locationData;
    } else {
      // location id not provided -> find location or create
      const { latitude, longitude, address } = locationData;

      const whereQuery: any = {
        latitude_longitude: {
            latitude: latitude,
            longitude: longitude,
          }
      }
      const updateQuery: any = {}
      if (address) updateQuery.address = address;
      const createQuery: any = {
        latitude: latitude,
        longitude: longitude,  
      }
      if (address) createQuery.address = address;

      const location = await prisma.location.upsert({
        where: whereQuery,
        update: updateQuery,
        create: createQuery,
        select: {
          id: true,
        }
      });

      if (!location.id) {
        console.log('api/rating post error: failed to create new location');
        return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue saving your rating'}, {status: 400});
      }

      locationId = location.id;
    }

    // Create/edit rating on location
    const { safety, description } = ratingData;

    const rating = await prisma.rating.upsert({
      where: {
        profileId_locationId: {
          profileId: userId,
          locationId: locationId,
        }
      },
      update: {
        safety: safety,
        description: description,
      },
      create: {
        safety: safety,
        description: description,
        profileId: userId,
        locationId: locationId,
      },
      select: {
        id: true,
      }
    });

    if (!rating) {
      // if failed to create rating & location was created -> delete location
      if (locationCreated) {
        await prisma.location.delete({
          where: {
            id: locationId,
          }
        });
      }
      return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue saving your rating'}, {status: 500})
    }

		// Logic
		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/rating post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue saving your rating'});
  }
}