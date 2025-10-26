import { Safety } from "@/lib/prisma/generated/prisma";
import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DefaultAPIRes } from "@/types/api_types";
import { ReducedLocation } from "@/types/types";
import { NextResponse } from "next/server";

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

    const props: PostRequestFull = {
      userId: user.id,
      locationData: body.locationId || {
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address || null,
      },
      ratingData: {
        ratingId: body.ratingId,
        safety: body.safety,
        description: body.description,
      }
    };
    const props_error = verifyBody(props, 'api/rating post');
    if (props_error) return props_error;

    const { userId, locationData, ratingData } = props;

    // Create/Get location
    let locationId = null;
    
    if (typeof locationData === 'string') { // location exists -> get location
      const location = await prisma.location.findUnique({
        where: {
          id: locationData,
        }
      });

      if (!location) {
        console.log(`api/rating post error: Provided location id not found ${locationData}`);
        return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue saving your rating' }, {status: 400});
      }

      locationId = locationData;
    } else {
      // location doesn't exist -> create location
      const { latitude, longitude, address } = locationData;

      const dataQuery: any = {
        latitude: latitude,
        longitude: longitude,
      }
      if (address) dataQuery.address = address;

      const location = await prisma.location.create({
        data: dataQuery,
        select: {
          id: true,
        }
      })

      locationId = location.id;
    }

    // Create/edit rating on location
    const { ratingId, safety, description } = ratingData;

    const rating = await prisma.rating.upsert({
      where: {
        id: ratingId || '',
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
      }
    });

		// Logic
		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/rating post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue MESSAGE'});
  }
}