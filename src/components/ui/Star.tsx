'use client'

export default function StarDisplay({ initialRating, setInputRating, className, size=7.5, colorStrength=5 }: { initialRating: number, setInputRating?: (any) => void, className?: string, size?: number, colorStrength?: number }) {
  function handleRatingClick(starRating: number) {
    if (setInputRating) {
      setInputRating(starRating - 2);
    }
  }

  return (
    <div className={`flex items-center space-x-0.5 cursor-pointer ${className || ''}`} role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => {
        const starClassName = i < (initialRating + 3)
          ? `text-yellow-500 transition-colors`
          : `text-gray-300 transition-colors`;

        return (
          <span
            key={i}
            className={starClassName}
            onClick={() => handleRatingClick(i)}
            role="radio"
            aria-checked={i < initialRating + 3}
          >
            ★
          </span>
        );
      })}
    </div>
  )
}