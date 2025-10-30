import { File, Trees, TriangleAlert } from "lucide-react";

export default function NormalSidebar({ setState }: { setState: (any) => void }) {
  return (
    <div className='w-full h-full flex flex-col items-center'>
      <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl mt-5 mb-5">
        Safe
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Space</span>
      </h1>
      <div className='text-[1.3rem] text-gray-700 text-center mb-7'>
        <p className='mb-1'>Welcome to SafeSpace! SafeSpace is a community-powered map designed to help you feel safe and secure wherever you go.</p>
        <p className='font-bold'>Check out our features below!</p>
      </div>

      <div className='flex flex-1 flex-col items-center justify-center gap-y-15 pb-7 mb-5'>
        <button onClick={() => setState('location-info')}>
          <div
            className="mx-auto mb-5 flex h-20 w-20 transform items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300 hover:scale-110 hover:rotate-3"
            style={{
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
            }}>
            <Trees size={40} />
          </div>
          <h4 className="mb-1 text-xl font-bold text-gray-900">View Location Information</h4>
          <p className="leading-relaxed text-gray-600">
            Stay informed on which places are safe and unsafe
          </p>
        </button>

        <button onClick={() => setState('rating-info')}>
          <div
            className="mx-auto mb-5 flex h-20 w-20 transform items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-teal-700 transition-all duration-300 hover:scale-110 hover:-rotate-3"
            style={{
              boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)',
            }}>
            <TriangleAlert size={40}/>
          </div>
          <h4 className="mb-1 text-xl font-bold text-gray-900">Review Safety Ratings</h4>
          <p className="leading-relaxed text-gray-600">
            Look at more in depth descriptions about the safety of different locations
          </p>
        </button>

        <button onClick={() => setState('input-form')}>
          <div
            className="mx-auto mb-5 flex h-20 w-20 transform items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 transition-all duration-300 hover:scale-110 hover:rotate-3"
            style={{
              boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)',
            }}>
            <File size={40} />
          </div>
          <h4 className="mb-1 text-xl font-bold text-gray-900">Add Your Own Ratings</h4>
          <p className="leading-relaxed text-gray-600">
            Help the community stay informed by adding your own revies
          </p>
        </button>
      </div>
    </div>
  )
}