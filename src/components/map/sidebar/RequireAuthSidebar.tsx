import { useProtectorAuth } from "@/components/auth/AuthProtector";
import { OctagonAlert } from "lucide-react";

export default function RequireAuthSidebar({ name, session }: { name: string, session: any }) {
  const { softRequireAuth } = useProtectorAuth();

  const userExists = session?.data;

  return (
    <div className='w-full h-full flex flex-col items-center justify-center p-6'>
      <OctagonAlert size={80} className='m-5' />
      <div className='text-black text-center text-[1.3rem] mb-2'>Please sign in before doing {name}. Thanks!</div>
      {}
      
      {!userExists && (
        <button
          className='text-gray-500 text-[1.2rem] underline hover:underline-gray-700 hover:text-gray-700 mb-4'
          onClick={softRequireAuth}
        >
          Sign In First?
        </button>
      )}
    </div>
  )
}