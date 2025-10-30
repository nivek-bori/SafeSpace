import StarDisplay from "@/components/ui/Star";
import { roundDecimalPlace } from "@/lib/util/util";
import { convertNumberToSafety, convertSafetyToNumber, ReducedLocation, RelationLocation, RelationRating } from "@/types/types";
import { Trees } from "lucide-react";

export default function LocationInfoSidebar({ location, setState }: { location: RelationLocation | ReducedLocation | null, setState: (any) => void }) {
  if (!location) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center p-6'>
        <Trees size={80} className='m-4' />
        <div className='text-black text-center text-[1.15rem]'>
          Please select a location before viewing its information
        </div>
      </div>
    )
  }

  // rating to percentile
  const ratings = ('ratings' in location && Array.isArray(location.ratings) ? location.ratings : []);
  const totalNumRatings = ratings.length;

  // Rating to count
  const ratingCounts: Record<number, number> = {};
  ratings.forEach(rating => {
    const key = convertSafetyToNumber(rating.safety);
    ratingCounts[key] = (ratingCounts[key] || 0) + 1;
  });

  let sumRatings = 0;

  // Rating to 
  const ratingData: Record<number, { percentile: number, count: number }> = {};
  if (totalNumRatings > 0) {
    for (const ratingKey in ratingCounts) {
      sumRatings += ratingCounts[ratingKey];

      ratingData[ratingKey] = {
        percentile: Math.floor((ratingCounts[ratingKey] / totalNumRatings) * 100),
        count: ratingCounts[ratingKey],
      }
    }
  }

  const avgRating = roundDecimalPlace(sumRatings / totalNumRatings, 1);

  return (
    <div className='w-full h-full flex items-center flex-col'>
      <div className='w-full font-bold text-2xl mb-6'>
        Location Information:
      </div>
      <div className='w-full flex items-center justify-center flex-col mb-7'>
        <div className='text-[1.4rem] font-bold mb-1'>Average Saftey: {avgRating + 3}/5</div>
        <StarDisplay initialRating={Math.round(avgRating)} className='text-[2rem]'size={30} />
      </div>

      <div className='w-full flex items-center justify-center flex-col mb-5'>
        <div className='text-[1.35rem] font-bold mb-3'>Safety Breakdown:</div>
        <div className='w-full px-4 flex flex-col mb-[0.7rem]'>
          {([2, 1, 0, -1, -2]).map(rating => (
            <div className='flex flex-row items-center justify-center' key={rating}>
              <div className='mr-5 text-[1.05rem] text-black font-semibold flex-shrink-0 w-[2.1rem] text-right tabular-nums'>{(ratingData[rating] || { percentile: 0 }).percentile}%</div>
              <StarDisplay initialRating={rating} className='flex-shrink-0 self-center text-[1.7rem]' />
              <div className='ml-5 text-gray-500 text-[1.05rem] flex-shrink-0 w-[2.1rem] tabular-nums'>{(ratingData[rating] || { count: 0 }).count}</div>
            </div>
          ))}
        </div>
        <button
          className='text-gray-500 text-[1.15rem] underline hover:underline-gray-700 hover:text-gray-700 mb-4'
          onClick={() => { setState('rating-info') }}
        >
          view all ratings
        </button>
      </div>

      <button onClick={() => { setState('input-form') }} className='py-2 w-full rounded-[0.5rem] font-semibold text-[1.1rem] bg-indigo-300'>
        Add a rating
      </button>
    </div>
  )
  
}