import Star from "@/components/ui/Star";
import { convertNumberToSafety, convertSafetyToNumber, ReducedLocation, RelationLocation, RelationRating } from "@/types/types";
import { TriangleAlert } from "lucide-react";

function RatingCardComponent({rating}: {rating: RelationRating}) {
  return (
    <div className='relative bg-gradient-to-br from-blue-300 to-purple-300 rounded-2xl border-[2px] border-gray-200 flex flex-col p-4 px-8'>
      <div className='pb-3 mb-3'>
        <div className='text-center text-black text-[1.6rem] pb-3'>Safety:</div>
        <div className='flex items-center justify-center'>
          <Star initialRating={convertSafetyToNumber(rating.safety)} className='text-[1.8rem]'></Star>
        </div>
      </div>
      <div className=''>
        <div className='pl-3 text-center text-[1.1rem] text-gray-800'>"{rating.description}"</div>
      </div>
    </div>
  )
}

export default function RatingInfoSidebar({ location, setState }: { location: RelationLocation | ReducedLocation | null, setState: (string) => void }) {
  if (!location) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center p-6'>
        <TriangleAlert size={80} className='m-4' />
        <div className='text-black text-center text-[1.15rem]'>
          Please select a location before viewing its ratings
        </div>
      </div>
    )
  }

  const ratings = ((location && 'ratings' in location) ? location.ratings || [] : []);

  return (
    <div className='flex flex-col w-full h-full gap-y-4'>
      <div className='font-bold text-2xl mb-2'>
        Rating Information:
      </div>
      {ratings.length === 0 && (
        <div className='flex-1 w-full h-full flex flex-col items-center justify-center'>
          <TriangleAlert size={80} className='m-4' />
          <div className='text-[1.1rem] text-black mb-4 text-center'>There are no ratings for this location</div>
          <button onClick={() => setState('input-form')} className='py-2 px-3 bg-gray-100 border-2 border-blue-200 rounded-[0.75rem]'>Rate?</button>
        </div>
      )}
      {ratings.map((rating) => <RatingCardComponent key={rating.id} rating={rating}></RatingCardComponent>)}
    </div>
  );
}