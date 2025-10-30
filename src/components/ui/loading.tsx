'use client'
import { useEffect, useRef, useState } from "react";

const loadingMessages = [
  'Ensuring your security...',
  'Empowering your peace of mind...',
  'Finding the safest location...',
  'Loading safety ratings...',
  'Rendering map data...',
  'Fetching location data...'
];

export default function Loading() {
  const [messageIdx, setMessageIdx] = useState<number>(0);
  const intervalRef = useRef<any>(null);

  // Rotate message every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMessageIdx(prev => (prev + Math.round(Math.random() * (loadingMessages.length - 1) + 1)) % loadingMessages.length);
    }, 1 * 1000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 md:p-12">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-purple-600 to-yellow-400 opacity-10"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl md:p-12">
        <div className="mb-7">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Safe
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Space</span>
          </h1>
        </div>

        <div className="mb-5 flex justify-center space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-purple-600" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-pink-600" style={{ animationDelay: '300ms' }}></div>
        </div>

        <p className="bg-clip-text text-lg font-semibold text-gray-800">{loadingMessages[messageIdx]}</p>
      </div>
    </div>
  )
}
