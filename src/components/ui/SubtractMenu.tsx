import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { getNumberBlockColor } from '../../types';

interface SubtractMenuProps {
  blockValue: number;
  position: { x: number; y: number };
  onSelect: (value: number) => void;
  onClose: () => void;
}

export function SubtractMenu({ blockValue, position, onSelect, onClose }: SubtractMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Generate options 1 to n-1
  const options = Array.from({ length: blockValue - 1 }, (_, i) => i + 1);

  // Calculate grid columns (max 5 per row)
  const cols = Math.min(options.length, 5);

  return (
    <motion.div
      ref={menuRef}
      className="subtract-menu fixed z-[2000] bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-2xl p-3 backdrop-blur-sm border-2 border-red-400"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {/* Header */}
      <div className="text-center mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Subtract from {blockValue}
      </div>

      {/* Minus sign */}
      <div className="text-center mb-2">
        <span className="inline-block w-8 h-8 bg-red-500 text-white rounded-full text-xl font-bold leading-8">
          −
        </span>
      </div>

      {/* Grid of options */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {options.map((value) => (
          <motion.button
            key={value}
            className="w-10 h-10 rounded-lg font-bold text-gray-900 shadow-md hover:shadow-lg transition-shadow"
            style={{
              backgroundColor: getNumberBlockColor(value),
              boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.2)',
            }}
            onClick={() => onSelect(value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {value}
          </motion.button>
        ))}
      </div>

      {/* Result preview */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-center text-xs text-gray-500 dark:text-gray-400">
        Click a number to split
      </div>
    </motion.div>
  );
}

export default SubtractMenu;
