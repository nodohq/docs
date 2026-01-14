import React, { useMemo } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { beatToPx } from '../utils/projection';

const MIN_PX_PER_LINE = 4; // Min px between lines to avoid moiré
const MAX_LINES = 600;     // Safety cap

export default function BeatGrid({ width }) {
  const pxPerBeat = useProjectStore(s => s.zoom.pxPerBeat);

  const gridLines = useMemo(() => {
    if (!width || pxPerBeat <= 0) return [];

    const totalBeats = Math.floor(width / pxPerBeat);
    if (totalBeats === 0) return [];

    // --- Adaptive Step Logic ---
    const possibleSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256];
    let beatStep = possibleSteps[0];

    for (const step of possibleSteps) {
      const lines = totalBeats / step;
      const pxPerLine = width / lines;

      if (pxPerLine >= MIN_PX_PER_LINE && lines <= MAX_LINES) {
        beatStep = step;
        break; // Found a suitable step
      }
    }
    // If no suitable step found, it will default to the last one (widest)
    if (totalBeats / beatStep > MAX_LINES) {
        beatStep = possibleSteps.find(s => totalBeats / s <= MAX_LINES) || possibleSteps[possibleSteps.length - 1];
    }

    // --- Generate Line Data ---
    const lines = [];
    const beatsPerBar = 16; // Typically 4/4 time, 4 beats per bar, 16th notes are common subdivisions

    for (let beat = 0; beat < totalBeats; beat += beatStep) {
      const isStrong = beat % beatsPerBar === 0;
      lines.push({
        beat,
        isStrong,
        key: `grid-${beat}`,
      });
    }
    return lines;
  }, [width, pxPerBeat]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {gridLines.map(({ beat, isStrong }) => (
        <div
          key={`grid-${beat}`}
          style={{
            position: 'absolute',
            left: `${beatToPx(beat, pxPerBeat)}px`,
            top: 0,
            width: '1px',
            height: '100%',
            backgroundColor: isStrong ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.07)',
          }}
        />
      ))}
    </div>
  );
}
