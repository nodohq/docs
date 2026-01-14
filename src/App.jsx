import React from "react";
import { useEffect } from "react";
import { useProjectStore } from "./store/useProjectStore";
import { loadProjectState } from "./storage/projectDb";
import { subscribeProjectPersistence } from "./storage/subscribeProjectPersistence";
import { beatToPx, pxToBeat } from "./utils/projection"; // Import projection utils
import Debug from "./components/Debug";

export default function App() {
  const hydrateFromStorage = useProjectStore((s) => s.hydrateFromStorage);
  const { pxPerBeat } = useProjectStore((s) => s.zoom);
  const setPxPerBeat = useProjectStore((s) => s.setPxPerBeat);

  useEffect(() => {
    let stopPersistence = null;

    (async () => {
      const saved = await loadProjectState();
      if (saved) hydrateFromStorage(saved);

      stopPersistence = subscribeProjectPersistence(useProjectStore);
    })();

    return () => {
      if (stopPersistence) stopPersistence();
    };
  }, [hydrateFromStorage]);

  // --- Ticket #02: UI Debug Info ---
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
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>
          LIBRARY
        </div>
        <p style={{ color: "#aaa", fontSize: 12 }}>
          Ticket #01 — placeholder
        </p>
      </aside>

      <main style={{ overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid #222", padding: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>
            TIMELINE
          </div>
          
          {/* --- TICKET #02: ZOOM CONTROLS & DEBUG --- */}
          <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 12 }}>
            <button onClick={() => setPxPerBeat(pxPerBeat / 2)}>Zoom Out</button>
            <button onClick={() => setPxPerBeat(pxPerBeat * 2)} style={{ marginLeft: 5 }}>Zoom In</button>
            <span style={{ marginLeft: 15 }}>pxPerBeat: {pxPerBeat.toFixed(2)}</span>
            <span style={{ marginLeft: 15 }}>beatToPx(128): {pxTestValue}</span>
            <span style={{ marginLeft: 15 }}>pxToBeat(beatToPx(128)): {roundtripBeat}</span>
          </div>
          {/* --- END TICKET #02 --- */}

        </div>
        <div style={{ padding: 16 }}>
          <div style={{ height: 1, background: "#222" }} />
        </div>
      </main>

      <aside style={{ borderLeft: "1px solid #222", padding: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>
          INSPECTOR
        </div>
        <p style={{ color: "#aaa", fontSize: 12 }}>
          Ticket #01 — read-only
        </p>
      </aside>

      <Debug />
    </div>
  );
}
