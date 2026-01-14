
import React from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { beatToPx } from '../utils/projection';

const BeatGrid = ({ width }) => {
  const pxPerBeat = useProjectStore((state) => state.zoom.pxPerBeat);

  if (!width || !pxPerBeat) {
    return null;
  }

  const possibleSteps = [1, 2, 4, 8, 16, 32, 64];
  let step = possibleSteps[0];

  for (const s of possibleSteps) {
    const numLines = width / (pxPerBeat * s);
    const lineGap = pxPerBeat * s;
    if (numLines <= 600 && lineGap >= 4) {
      step = s;
      break;
    }
  }

  const lines = [];
  const totalBeats = width / pxPerBeat;

  for (let beat = 0; beat < totalBeats; beat += step) {
    const isStrong = beat % 16 === 0;
    lines.push(
      <div
        key={beat}
        style={{
          position: 'absolute',
          left: beatToPx(beat, pxPerBeat),
          top: 0,
          width: 1,
          height: '100%',
          backgroundColor: isStrong ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        }}
      />
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {lines}
    </div>
  );
};

export default BeatGrid;
