import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import prisma from '@/lib/prisma/prisma';
import { DefaultAPIRes, ProfileGetRes } from "@/types/api_types";
import { NextResponse } from "next/server";

type GetPropsFull = {
  userId: string;
}

export async function GET(request: Request) {
  try {
    const {supabase, user, error: user_error} = await getUserServer(request);
    if (user_error) return user_error;

    const props: GetPropsFull = { userId: user.id };
    const props_error = verifyBody(props, 'api/profile get');
    if (props_error) return props_error;

    const { userId } = props;

    const profile = await prisma.profile.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    return NextResponse.json<ProfileGetRes>({status: 'success', message: '', profile: profile});
  } catch (e: any) {
    console.log('api/profile get error')
    parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue loading the profile' }, {status: 500});
  }
}