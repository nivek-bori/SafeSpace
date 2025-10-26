'use client'

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { parseError } from "@/lib/util/server_util";
import { AuthReq, DefaultAPIRes } from "@/types/api_types";
import { request } from "@/lib/util/api";
import GoogleAuthButton from "./GoogleButton";
import EmailHandler from "./email/EmailHandler";
import { X } from "lucide-react";

interface GoogleAuthResponse {
  credential: string;
  [key: string]: unknown;
}

export default function AuthComponent( { onClose }: { onClose: () => void | null}) {
  const [status, setStatus] = useState<'google-loading' | 'email-loading' | 'page-loading' | 'null'>('page-loading');

  const handleEmailSignIn = useCallback(async (email: string, password: string) => {
    setStatus('email-loading');

    try {
      // Data validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        // TODO: NOTIFICATION - 'Please enter a valid email address'
        return;

      // Supabase auth
      const { data: auth_data, error: auth_error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      // Auth errors
      if (auth_error) {
        parseError(auth_error.message, auth_error.code);
        // TODO: NOTIFICATION: error There was an issue signing in with Google
        console.log('There was an issue signing in');
      }
      if (!auth_data.user || !auth_data.user.id) {
        // TODO: NOTIFICATION: error There was an issue signing in with Google
        console.log('There was an issue signing in');
      }

    } catch (e: any) {
      console.log('/components/auth/auth handleEmailSignIn error', await parseError(e.message, e.code));
      // TODO: NOTIFICATION: There was an issue signing in
    } finally {
      setStatus('null');
    }
  }, [setStatus, supabase, parseError]);

  const handleEmailSignUp = useCallback(async (email: string, name: string, password: string, confirmPassword: string) => {
    setStatus('email-loading');

    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        // TODO: NOTIFICATION - 'Please enter a valid email address'
        return;
      }

      if (password !== confirmPassword) {
        // TODO: NOTIFICATION - 'Passwords do not match'
        return;
      }

      // Ensure auth user exists
      let { data: auth_data, error: auth_error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      const signUp = !auth_data.user;
      console.log('DEBUGGING 1', signUp, auth_data);

      // If no auth user -> sign up
      if (signUp) {
        ({ data: auth_data, error: auth_error } = await supabase.auth.signUp({ email: email, password: password }));

        console.log('DEBUGGING 2', auth_data, auth_error);

        // Auth errors
        if (auth_error) {
          parseError(auth_error.message, auth_error.code);
          // TODO: NOTIFICATION: error There was an issue signing in with Google
          console.log('There was an issue signing in with Google');
          return;
        }
        if (!auth_data.user || !auth_data.user.id) {
          // TODO: NOTIFICATION: error There was an issue signing in with Google
          console.log('There was an issue signing in with Google');
          return;
        }
      }

      // Ensure db profile exists
      let body: AuthReq = {
        email: email,
        name: name || auth_data.user.email || 'user',
      };
      if (auth_data.user?.id) body.userId = auth_data.user.id;

      const res: DefaultAPIRes = await request<DefaultAPIRes>({
        type: 'POST',
        route: 'api/auth',
        body: body
      });

      // TODO: NOTIFICATION - res.status

      // If no user and sign up through api/auth successful -> sign 
      if (res.status === 'success' && signUp) {
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      }
    } catch (e: any) {
      console.log('/components/auth/auth handleEmailSignUp error', await parseError(e.message, e.code));
      // TODO: NOTIFICATION: error There was an issue signgin in with Google
    } finally {
      setStatus('null');
    }
  }, []);


  const handleGoogleAuth = useCallback(async (response: GoogleAuthResponse) => {
    setStatus('google-loading');

    try {
      // Sign in using Google token
      const { data: auth_data, error: auth_error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      // Auth errors
      if (auth_error) {
        parseError(auth_error.message, auth_error.code);
        // TODO: NOTIFICATION: error There was an issue signing in with Google
        console.log('There was an issue signing in with Google');
        return;
      }
      if (!auth_data.user || !auth_data.user.id) {
        // TODO: NOTIFICATION: error There was an issue signing in with Google
        console.log('There was an issue signing in with Google');
        return;
      }

      const body: AuthReq = {
        userId: auth_data.user.id,
        email: auth_data.user.email || 'unknown email',
        name: auth_data.user.user_metadata.name || 'user'
      };

      const res: DefaultAPIRes = await request<DefaultAPIRes>({
        type: 'POST',
        route: 'api/auth',
        body: body
      });

      /// TODO: NOTIFICIATION: res.status
    } catch (e: any) {
      console.log('/components/auth/auth handleGoogleAuth error', await parseError(e.message, e.code));
      // TODO: NOTIFICATION: error There was an issue signgin in with Google
    } finally {
      setTimeout(() => setStatus('null'), 10 * 1000);
    }
  }, [setStatus]);

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      {onClose !== null && <button className='absolute right-5 top-3 w-12 h-12 rounded-[1rem] bg-gray-400 flex items-center justify-center' onClick={onClose}><X /></button>}
      <div className="p-8 w-full max-w-md bg-white rounded-lg shadow-xl">
        <EmailHandler status={status} onEmailSignIn={handleEmailSignIn} onEmailSignUp={handleEmailSignUp} />

        <div className="mt-6">
          <div className="relative">
            <div className="flex absolute inset-0 items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="flex relative justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <GoogleAuthButton
              handleGoogleAuthCallback={handleGoogleAuth}
              setStatus={setStatus}
              buttonUse='continue_with'
              buttonText='Continue with Google'
            />
          </div>
        </div>
      </div>
    </div>
  )
}