import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import '../../styles/responsive.css';

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
  const cardY = useMotionValue(0);
  const rotateX = useTransform(cardY, [0, 300], [0, -14]);
  const translateY = useTransform(cardY, [0, 300], [0, -1]);

  React.useEffect(() => {
    if (selected) {
      cardY.set(300);
    } else {
      cardY.set(0);
    }
  }, [selected, cardY]);

  return (
    <motion.div
      style={{
        perspective: 800,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          perspective: 800,
          rotateX,
          translateY
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className={`
              relative story-point-card rounded-lg shadow-md
              ${selected 
              ? 'bg-blue-50 text-gray-800 border-blue-400' 
              : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              border-2
          `}
          onClick={onClick}
          disabled={disabled}
          style={{
            transformStyle: "preserve-3d",
            perspective: 800,
            borderColor: selected ? 'oklch(48.8% 0.243 264.376)' : '',
          }}
          transition={{ duration: 3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold">{value}</span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default StoryPointCard; 