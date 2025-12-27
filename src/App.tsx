import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NumberBlock } from './components/blocks';
import { Mirror, VoiceButton, TranscriptDisplay, SubtractMenu } from './components/ui';
import { AppShell } from './components/layout';
import { useNumberBlocks, useVoiceInput, useDarkMode } from './hooks';
import type { Position } from './types';

// State for the subtract menu
interface SubtractMenuState {
  blockId: string;
  blockValue: number;
  position: { x: number; y: number };
}

// Addition sign component that appears when blocks overlap
function AdditionSign({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-green-400">
          <span className="text-3xl font-bold text-green-500">+</span>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const {
    blocks,
    pendingCombination,
    addBlock,
    updateBlockPosition,
    startDragging,
    stopDragging,
    checkOverlap,
    finalizeCombine,
    splitBlock,
  } = useNumberBlocks();

  const voice = useVoiceInput();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  // Subtract menu state
  const [subtractMenu, setSubtractMenu] = useState<SubtractMenuState | null>(null);

  // Handle spawning from mirror
  const handleSpawn = useCallback(
    (value: number, position: Position) => {
      addBlock(value, position);
    },
    [addBlock]
  );

  // Handle block drag events
  const handleDragStart = useCallback(
    (id: string) => {
      startDragging(id);
    },
    [startDragging]
  );

  const handleDrag = useCallback(
    (id: string, position: Position) => {
      updateBlockPosition(id, position);
      checkOverlap(id, position); // Check for overlaps during drag
    },
    [updateBlockPosition, checkOverlap]
  );

  const handleDragEnd = useCallback(
    (id: string, position: Position) => {
      updateBlockPosition(id, position);
      finalizeCombine(id, position); // Try to combine if overlapping
      stopDragging(id);
    },
    [updateBlockPosition, finalizeCombine, stopDragging]
  );

  // Handle right-click to show subtract menu
  const handleRightClick = useCallback(
    (id: string, value: number, position: { x: number; y: number }) => {
      setSubtractMenu({ blockId: id, blockValue: value, position });
    },
    []
  );

  // Handle subtract selection
  const handleSubtract = useCallback(
    (subtractValue: number) => {
      if (subtractMenu) {
        splitBlock(subtractMenu.blockId, subtractValue);
        setSubtractMenu(null);
      }
    },
    [subtractMenu, splitBlock]
  );

  // Close subtract menu
  const handleCloseSubtractMenu = useCallback(() => {
    setSubtractMenu(null);
  }, []);

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="flex gap-0.5"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor:
                      n === 1 ? '#FF0000' : n === 2 ? '#FF8C00' : '#FFD700',
                  }}
                />
              ))}
            </motion.div>
            <span className={`text-xl font-bold hidden sm:inline ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              RenderBlocks
            </span>
          </div>

          {/* Block count and dark mode toggle */}
          <div className="flex items-center gap-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm9-9a1 1 0 110 2h-1a1 1 0 110-2h1zM5 11a1 1 0 110 2H4a1 1 0 110-2h1zm14.071-6.071a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM6.05 16.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm12.021.707a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM5.636 6.05a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-4">
          {/* Mirror for spawning blocks 1-10 */}
          <Mirror onSpawn={handleSpawn} />

          {/* Voice button */}
          <div className="flex flex-col items-center gap-2">
            <VoiceButton
              isListening={voice.isListening}
              isSupported={voice.isSupported}
              onPress={voice.startListening}
              onRelease={voice.stopListening}
            />
          </div>
        </div>
      }
    >
      {/* Main playground area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Blocks */}
        <AnimatePresence>
          {blocks.map((block) => (
            <NumberBlock
              key={block.id}
              id={block.id}
              value={block.value}
              position={block.position}
              isDragging={block.isDragging}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onRightClick={handleRightClick}
            />
          ))}
        </AnimatePresence>

        {/* Addition sign when blocks overlap */}
        <AnimatePresence>
          {pendingCombination && (
            <AdditionSign
              x={pendingCombination.position.x}
              y={pendingCombination.position.y}
            />
          )}
        </AnimatePresence>

        {/* Subtract menu (right-click) */}
        <AnimatePresence>
          {subtractMenu && (
            <SubtractMenu
              blockValue={subtractMenu.blockValue}
              position={subtractMenu.position}
              onSelect={handleSubtract}
              onClose={handleCloseSubtractMenu}
            />
          )}
        </AnimatePresence>

        {/* Voice transcript */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <TranscriptDisplay
            transcript={voice.transcript}
            isListening={voice.isListening}
          />
        </div>

        {/* Empty state */}
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="flex justify-center gap-2 mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        n === 1 ? '#FF0000' : n === 2 ? '#FF8C00' : '#FFD700',
                      boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                ))}
              </motion.div>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Drag blocks from the mirror to start!
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Drag blocks together to combine them
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default App;
