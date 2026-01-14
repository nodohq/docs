
import React, { useEffect, useRef, useState } from "react";
import { useProjectStore } from "./store/useProjectStore";
import { loadProjectState } from "./storage/projectDb";
import { subscribeProjectPersistence } from "./storage/subscribeProjectPersistence";
import { beatToPx, pxToBeat } from "./utils/projection";
import { snapPxToBeat } from "./utils/snap";
import Debug from "./components/Debug";
import BeatGrid from "./components/BeatGrid";

export default function App() {
  const hydrateFromStorage = useProjectStore((s) => s.hydrateFromStorage);

  // --- Store State ---
  const pxPerBeat = useProjectStore((s) => s.zoom.pxPerBeat);
  const setPxPerBeat = useProjectStore((s) => s.setPxPerBeat);
  const playheadBeat = useProjectStore((s) => s.timeline.playheadBeat);
  const setPlayheadBeat = useProjectStore((s) => s.setPlayheadBeat);

  // --- Ticket #04: Timeline container size for grid rendering ---
  const timelineContainerRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    // Load state and set up persistence
    let stopPersistence = null;
    (async () => {
      const saved = await loadProjectState();
      if (saved) hydrateFromStorage(saved);
      stopPersistence = subscribeProjectPersistence(useProjectStore);
    })();

    // Set up ResizeObserver for timeline width
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setTimelineWidth(entries[0].contentRect.width);
      }
    });
    if (timelineContainerRef.current) {
      observer.observe(timelineContainerRef.current);
    }

    return () => {
      if (stopPersistence) stopPersistence();
      if (timelineContainerRef.current) observer.unobserve(timelineContainerRef.current);
    };
  }, [hydrateFromStorage]);

  // --- Ticket #04: Click handler for playhead ---
  const handleTimelineClick = (e) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const localX = (e.clientX - rect.left) + timelineContainerRef.current.scrollLeft;
    const newBeat = snapPxToBeat(localX, pxPerBeat);
    setPlayheadBeat(newBeat);
  };

  // --- Debug Info ---
  const beatTestValue = 128;
  const pxTestValue = beatToPx(beatTestValue, pxPerBeat);
  const roundtripBeat = pxToBeat(pxTestValue, pxPerBeat);

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "250px 1fr 300px",
      }}
    >
      <aside style={{ borderRight: "1px solid #222", padding: 16 }}>
        {/* ... Library ... */}
      </aside>

      <main style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid #222", padding: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>TIMELINE</div>
          <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 12, color: '#ccc' }}>
            <button onClick={() => setPxPerBeat(pxPerBeat / 2)}>Zoom Out</button>
            <button onClick={() => setPxPerBeat(pxPerBeat * 2)} style={{ marginLeft: 5 }}>Zoom In</button>
            <span style={{ marginLeft: 20 }}>pxPerBeat: {pxPerBeat.toFixed(2)}</span>
            <span style={{ marginLeft: 20 }}>playhead: @{playheadBeat}</span>
          </div>
        </div>

        {/* --- TIMELINE CONTENT (Ticket #04) --- */}
        <div 
          ref={timelineContainerRef} 
          onClick={handleTimelineClick}
          style={{ flexGrow: 1, position: 'relative', overflowX: 'auto', cursor: 'pointer' }}
        >
          <BeatGrid width={timelineWidth} />
          
          {/* Playhead Marker */}
          <div style={{
            position: 'absolute',
            left: `${beatToPx(playheadBeat, pxPerBeat)}px`,
            top: 0,
            width: '2px',
            height: '100%',
            backgroundColor: 'red',
            pointerEvents: 'none',
            boxShadow: '0 0 10px red',
          }}/>

        </div>
      </main>

      <aside style={{ borderLeft: "1px solid #222", padding: 16 }}>
        {/* ... Inspector ... */}
      </aside>

      <Debug />
    </div>
  );
}
