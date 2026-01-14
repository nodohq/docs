
import React, { useState, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { beatToPx } from '../utils/projection';
import { snapPxToBeat, snapBeatToBeat } from '../utils/snap';
import { isPlacementValid, MIN_BLOCK_LEN_BEATS } from '../utils/collisions';
import { Z_INDEX } from '../constants';

const TimelineBlock = ({ block, containerRef, laneLabelWidthPx = 0 }) => {
  // Separate selectors to prevent re-render loops (React 18 + Zustand)
  const moveBlock = useProjectStore((s) => s.moveBlock);
  const resizeBlock = useProjectStore((s) => s.resizeBlock);
  const blocks = useProjectStore((s) => s.timeline.blocks);
  const pxPerBeat = useProjectStore((s) => s.zoom.pxPerBeat);

  // Ticket #07: lanes
  const getLaneTopPx = useProjectStore((s) => s.getLaneTopPx);
  const laneHeightPx = useProjectStore((s) => s.timeline.layout.laneHeightPx);
  // optional but useful: highlight/select block
  const selectBlock = useProjectStore((s) => s.selectBlock);
  const selectedBlockId = useProjectStore((s) => s.selection.selectedBlockId);

  const [dragState, setDragState] = useState(null);
  const blockRef = useRef(null); // A stable reference to the main block element

  // --- Pointer Event Handlers ---

  const handlePointerDown = (e, mode) => {
    e.stopPropagation(); // Prevent timeline click handler
    
    const captureEl = blockRef.current;
    if (!captureEl || !containerRef.current) return;

    captureEl.setPointerCapture(e.pointerId); // Capture on the main element

    const rect = containerRef.current.getBoundingClientRect();
    const computedX = (e.clientX - rect.left) + containerRef.current.scrollLeft - laneLabelWidthPx;
    const localX = Math.max(0, computedX);

    setDragState({
      id: block.id,
      mode: mode,
      pointerId: e.pointerId, // Store pointerId for robust release
      originStart: block.startBeat,
      originLen: block.lengthBeats,
      draftStart: block.startBeat,
      draftLen: block.lengthBeats,
      offsetPx: localX - beatToPx(block.startBeat, pxPerBeat),
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const computedX = (e.clientX - rect.left) + containerRef.current.scrollLeft - laneLabelWidthPx;
    const localX = Math.max(0, computedX);

    if (dragState.mode === 'move') {
      const newStartBeat = snapPxToBeat(localX - dragState.offsetPx, pxPerBeat);
      setDragState(prev => ({ ...prev, draftStart: newStartBeat }));
    } else if (dragState.mode === 'resize') {
      const draftEndBeat = snapPxToBeat(localX, pxPerBeat);
      let newLengthBeats = draftEndBeat - dragState.originStart;
      newLengthBeats = Math.max(MIN_BLOCK_LEN_BEATS, newLengthBeats);
      setDragState(prev => ({ ...prev, draftLen: newLengthBeats }));
    }
  };

  const handlePointerUp = () => { // `e` is not needed here
    if (!dragState) return;

    // Robustly release pointer capture
    if (blockRef.current) {
      try {
        blockRef.current.releasePointerCapture(dragState.pointerId);
      } catch (err) {
        // Ignore errors, e.g., if capture was already lost.
      }
    }

    const nextStart = (dragState.mode === 'move')
      ? snapBeatToBeat(dragState.draftStart)
      : dragState.originStart;
      
    const nextLen = (dragState.mode === 'resize')
      ? snapBeatToBeat(dragState.draftLen)
      : dragState.originLen;

    const isValid = isPlacementValid(blocks, dragState.id, nextStart, nextLen);

    if (isValid) {
      if (dragState.mode === 'move' && nextStart !== dragState.originStart) {
        moveBlock(dragState.id, nextStart);
      }
      if (dragState.mode === 'resize' && nextLen !== dragState.originLen) {
        resizeBlock(dragState.id, nextLen);
      }
    }

    setDragState(null);
  };

  // --- Render Logic ---

  const isDrafting = dragState && dragState.id === block.id;
  const displayStartBeat = isDrafting ? dragState.draftStart : block.startBeat;
  const displayLengthBeats = isDrafting ? dragState.draftLen : block.lengthBeats;
  
  const isCurrentlyValid = isDrafting 
    ? isPlacementValid(blocks, dragState.id, snapBeatToBeat(displayStartBeat), snapBeatToBeat(displayLengthBeats))
    : true;

  const style = {
    position: 'absolute',
    left: beatToPx(displayStartBeat, pxPerBeat),
    width: beatToPx(displayLengthBeats, pxPerBeat),
    top: `${getLaneTopPx(block.trackId)}px`,
    height: `${laneHeightPx}px`,
    zIndex: isDrafting ? (Z_INDEX.blocks + 1) : Z_INDEX.blocks,
    backgroundColor: isCurrentlyValid ? 'rgba(99, 102, 241, 0.7)' : 'rgba(239, 68, 68, 0.7)',
    border: `1px solid ${isCurrentlyValid ? 'rgba(99, 102, 241, 1)' : 'rgba(239, 68, 68, 1)'}`,
    borderRadius: '4px',
    outline: selectedBlockId === block.id ? '2px solid rgba(255,255,255,0.9)' : 'none',
    outlineOffset: '1px',
    cursor: 'move',
    touchAction: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      ref={blockRef}
      onClick={() => selectBlock(block.id)}
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={style}
    >
      <span style={{ color: 'white', padding: '4px', pointerEvents: 'none', userSelect: 'none' }}>
        {block.trackId}
      </span>
      <div
        onPointerDown={(e) => handlePointerDown(e, 'resize')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '8px',
          height: '100%',
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
};

export default TimelineBlock;
