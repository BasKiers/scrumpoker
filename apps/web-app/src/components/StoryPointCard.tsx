import React from 'react';
import { cn } from '@/lib/utils';

interface StoryPointCardProps {
  value: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const StoryPointCard: React.FC<StoryPointCardProps> = ({
  value,
  selected = false,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={cn(
        'w-16 h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center text-2xl font-bold transition-all',
        'hover:border-blue-500 hover:shadow-md',
        selected && 'border-blue-500 bg-blue-50 text-blue-700',
        disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:shadow-none'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  );
};

export default StoryPointCard; 