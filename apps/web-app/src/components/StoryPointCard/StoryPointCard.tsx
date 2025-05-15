import React from 'react';

interface StoryPointCardProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const StoryPointCard: React.FC<StoryPointCardProps> = ({
  value,
  selected,
  onClick,
  disabled = false,
}) => {
  return (
    <button
        className={`
            relative w-20 h-32 rounded-lg shadow-md
            transition-all duration-300 ease-in-out
            ${selected 
            ? 'bg-blue-50 text-gray-800 -translate-y-4 border-blue-400' 
            : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200 translate-y-0'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            border-2
        `}
        onClick={onClick}
        disabled={disabled}
        >
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{value}</span>
        </div>
    </button>
  );
};

export default StoryPointCard; 