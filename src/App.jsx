import React, { useEffect, useRef, useState } from "react";
import { useProjectStore } from "./store/useProjectStore";
import { loadProjectState } from "./storage/projectDb";
import { subscribeProjectPersistence } from "./storage/subscribeProjectPersistence";
import { beatToPx } from "./utils/projection";
import { snapPxToBeat } from "./utils/snap";
import BeatGrid from "./components/BeatGrid";
import TimelineBlock from "./components/TimelineBlock";

export default function App() {
  const hydrateFromStorage = useProjectStore((s) => s.hydrateFromStorage);

  // --- Store State ---
  const tracks = useProjectStore((s) => s.tracks);
  const blocks = useProjectStore((s) => s.timeline.blocks);
  const createBlockFromTrack = useProjectStore((s) => s.createBlockFromTrack);
  const pxPerBeat = useProjectStore((s) => s.zoom.pxPerBeat);
  const setPxPerBeat = useProjectStore((s) => s.setPxPerBeat);
  const playheadBeat = useProjectStore((s) => s.timeline.playheadBeat);
  const setPlayheadBeat = useProjectStore((s) => s.setPlayheadBeat);

  const timelineContainerRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    let stopPersistence = null;

    (async () => {
      const saved = await loadProjectState();
      if (saved) hydrateFromStorage(saved);
      stopPersistence = subscribeProjectPersistence(useProjectStore);
    })();

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setTimelineWidth(entries[0].contentRect.width);
    });

    if (timelineContainerRef.current) {
      observer.observe(timelineContainerRef.current);
    }

    return () => {
      if (stopPersistence) stopPersistence();
      if (timelineContainerRef.current) observer.unobserve(timelineContainerRef.current);
    };
  }, [hydrateFromStorage]);

  const handleTimelineClick = (e) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const localX = (e.clientX - rect.left) + timelineContainerRef.current.scrollLeft;
    const newBeat = snapPxToBeat(localX, pxPerBeat);
    setPlayheadBeat(newBeat);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!timelineContainerRef.current) return;

    const trackId = e.dataTransfer.getData("text/plain");
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const localX = (e.clientX - rect.left) + timelineContainerRef.current.scrollLeft;
    const beat = snapPxToBeat(localX, pxPerBeat);

    createBlockFromTrack(trackId, beat);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "250px 1fr 300px",
      }}
    >
      <aside style={{ borderRight: "1px solid #222", padding: 16 }}>
        <h3>Library</h3>
        {tracks.map((track) => (
          <div
            key={track.id}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", track.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            style={{
              padding: 8,
              border: "1px solid #444",
              marginBottom: 8,
              cursor: "grab",
            }}
          >
            <div>{track.title}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{track.artist}</div>
          </div>
        ))}
      </aside>

      <main style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid #222", padding: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>TIMELINE</div>
          <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 12, color: "#ccc" }}>
            <button onClick={() => setPxPerBeat(pxPerBeat / 2)}>Zoom Out</button>
            <button onClick={() => setPxPerBeat(pxPerBeat * 2)} style={{ marginLeft: 5 }}>
              Zoom In
            </button>
            <span style={{ marginLeft: 20 }}>pxPerBeat: {pxPerBeat.toFixed(2)}</span>
            <span style={{ marginLeft: 20 }}>playhead: @{playheadBeat}</span>
          </div>
        </div>

        <div
          ref={timelineContainerRef}
          onClick={handleTimelineClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ flexGrow: 1, position: "relative", overflowX: "auto", cursor: "pointer" }}
        >
          <BeatGrid width={timelineWidth} />

          {blocks.map((block) => (
            <TimelineBlock key={block.id} block={block} containerRef={timelineContainerRef} />
          ))}

          <div
            style={{
              position: "absolute",
              left: `${beatToPx(playheadBeat, pxPerBeat)}px`,
              top: 0,
              width: 2,
              height: "100%",
              backgroundColor: "red",
              pointerEvents: "none",
              boxShadow: "0 0 10px red",
            }}
          />
        </div>
      </main>

      <aside style={{ borderLeft: "1px solid #222", padding: 16 }}>
        {/* ... Inspector ... */}
      </aside>
    </div>
  );
}
