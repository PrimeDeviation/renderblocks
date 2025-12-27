import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type NumberBlock,
  type Position,
  type BoundingBox,
  getBlockDimensions,
} from '../types';

interface PendingCombination {
  draggingId: string;
  targetId: string;
  position: Position;
}

function generateId(): string {
  return crypto.randomUUID();
}

function getBoxAtPosition(value: number, position: Position): BoundingBox {
  const dims = getBlockDimensions(value);
  return { x: position.x, y: position.y, width: dims.width, height: dims.height };
}

function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function useNumberBlocks() {
  const [blocks, setBlocks] = useState<NumberBlock[]>([]);
  const [pendingCombination, setPendingCombination] = useState<PendingCombination | null>(null);

  // Keep a ref in sync with state for synchronous reads
  const blocksRef = useRef<NumberBlock[]>([]);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const addBlock = useCallback((value: number, position: Position): string => {
    const id = generateId();
    setBlocks(prev => [...prev, { id, value, position, isDragging: false }]);
    return id;
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateBlockPosition = useCallback((id: string, position: Position) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, position } : b));
  }, []);

  const startDragging = useCallback((id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isDragging: true } : b));
  }, []);

  const stopDragging = useCallback((id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isDragging: false } : b));
    setPendingCombination(null);
  }, []);

  const checkOverlap = useCallback((draggedId: string, draggedPos: Position) => {
    const currentBlocks = blocksRef.current;
    const draggedBlock = currentBlocks.find(b => b.id === draggedId);

    if (!draggedBlock) {
      setPendingCombination(null);
      return;
    }

    const draggedBox = getBoxAtPosition(draggedBlock.value, draggedPos);

    // Find collision with any other block
    let foundCollision: PendingCombination | null = null;

    for (const block of currentBlocks) {
      if (block.id === draggedId) continue;
      const targetBox = getBoxAtPosition(block.value, block.position);

      if (boxesOverlap(draggedBox, targetBox)) {
        foundCollision = {
          draggingId: draggedId,
          targetId: block.id,
          position: {
            x: (draggedBox.x + draggedBox.width / 2 + targetBox.x + targetBox.width / 2) / 2,
            y: Math.min(draggedBox.y, targetBox.y) - 40,
          },
        };
        break;
      }
    }

    setPendingCombination(foundCollision);
  }, []);

  const finalizeCombine = useCallback((draggedId: string, draggedPos: Position): boolean => {
    const currentBlocks = blocksRef.current;
    const draggedBlock = currentBlocks.find(b => b.id === draggedId);

    if (!draggedBlock) {
      setPendingCombination(null);
      return false;
    }

    const draggedBox = getBoxAtPosition(draggedBlock.value, draggedPos);

    // Find collision
    let collidingBlock: NumberBlock | undefined;
    for (const block of currentBlocks) {
      if (block.id === draggedId) continue;
      const targetBox = getBoxAtPosition(block.value, block.position);
      if (boxesOverlap(draggedBox, targetBox)) {
        collidingBlock = block;
        break;
      }
    }

    if (!collidingBlock) {
      setPendingCombination(null);
      return false;
    }

    // Calculate new block properties
    const newValue = draggedBlock.value + collidingBlock.value;
    const collidingBox = getBoxAtPosition(collidingBlock.value, collidingBlock.position);
    const newDims = getBlockDimensions(newValue);

    const centerX = (draggedBox.x + draggedBox.width / 2 + collidingBox.x + collidingBox.width / 2) / 2;
    const centerY = (draggedBox.y + draggedBox.height / 2 + collidingBox.y + collidingBox.height / 2) / 2;

    const newBlock: NumberBlock = {
      id: generateId(),
      value: newValue,
      position: { x: centerX - newDims.width / 2, y: centerY - newDims.height / 2 },
      isDragging: false,
    };

    // Update state: remove both, add new
    setBlocks(prev => [
      ...prev.filter(b => b.id !== draggedId && b.id !== collidingBlock!.id),
      newBlock,
    ]);

    setPendingCombination(null);
    return true;
  }, []);

  const clearBlocks = useCallback(() => {
    setBlocks([]);
    setPendingCombination(null);
  }, []);

  // Split a block into two: (original - subtractValue) and (subtractValue)
  const splitBlock = useCallback((id: string, subtractValue: number): boolean => {
    const currentBlocks = blocksRef.current;
    const block = currentBlocks.find(b => b.id === id);

    if (!block || subtractValue <= 0 || subtractValue >= block.value) {
      return false;
    }

    const remainingValue = block.value - subtractValue;
    const dims = getBlockDimensions(block.value);

    // Create two new blocks side by side
    const newBlock1: NumberBlock = {
      id: generateId(),
      value: remainingValue,
      position: {
        x: block.position.x - 30,
        y: block.position.y
      },
      isDragging: false,
    };

    const newBlock2: NumberBlock = {
      id: generateId(),
      value: subtractValue,
      position: {
        x: block.position.x + dims.width + 10,
        y: block.position.y
      },
      isDragging: false,
    };

    setBlocks(prev => [
      ...prev.filter(b => b.id !== id),
      newBlock1,
      newBlock2,
    ]);

    return true;
  }, []);

  return {
    blocks,
    pendingCombination,
    addBlock,
    removeBlock,
    updateBlockPosition,
    startDragging,
    stopDragging,
    checkOverlap,
    finalizeCombine,
    clearBlocks,
    splitBlock,
  };
}

export default useNumberBlocks;
