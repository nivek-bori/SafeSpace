
import { verifyBody } from "@/lib/util/api";
import { parseError } from "@/lib/util/server_util";
import { LocationGetRes } from "@/types/api_types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';

type GetRequestFull = {
  locationId: string | null;
}

export async function GET(request: Request) {
  try {
    // Data
    const { searchParams } = new URL(request.url);
    const SP_locationId = searchParams.get('locationId');

    const props = { locationId: SP_locationId };
    const props_error = verifyBody<GetRequestFull>(props, 'api/location get');
    if (props_error) return props_error;

    const { locationId } = props;

    if (!locationId) {
      // If no locationId -> get all locations
      const locations = await prisma.location.findMany({
        select: {
          id: true,
          latitude: true,
          longitude: true,
          address: true,
          ratings: {
            select: {
              id: true,
              safety: true,
              description: true,
            }
          }
        }
      });

      return NextResponse.json<LocationGetRes>({ status: 'success', message: '', locations: locations });
    } else {
      // If locationId -> get locationId location
      if (locationId.trim() === '' || locationId.trim() === 'undefined') {
        console.log('api/location get error: locationId is null/empty');
        return NextResponse.json<LocationGetRes>({ status: 'error', message: '' }, {status: 400});
      }

      const location = await prisma.location.findUnique({
        where: {
          id: locationId,
        },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          address: true,
          ratings: {
            select: {
              id: true,
              safety: true,
              description: true,
            }
          }
        }
      });

      if (!location) {
        console.log(`api/location get error: locationId location not found ${locationId}`);
        return NextResponse.json<LocationGetRes>({ status: 'error', message: ''}, {status: 400})
      }
      
      return NextResponse.json<LocationGetRes>({ status: 'success', message: '', locations: [location] });
    }
  } catch (e: any) {
    console.log('api/location get error')
    await parseError(e.message, e.code);
    return NextResponse.json<LocationGetRes>({status: 'error', message: 'There was an issue loading location data'}, { status: 500});
  }
}