import SearchBar from "@/components/ui/SearchBar";
import { ShieldUser } from "lucide-react";

export default function TestingPage() {
  return (
    <div className='flex flex-col w-full h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='flex flex-row items-center justify-center gap-x-3'>
        <h1 className="text-[5rem] font-black tracking-tight text-gray-900">
          Safe
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Space</span>
        </h1>
        <ShieldUser size={110} color={'purple'}></ShieldUser>
      </div>
      <div className='text-gray-500 text-[1.45rem]'>
        Empowering people to feel safe
      </div>
    </div>
  )
}