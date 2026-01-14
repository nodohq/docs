import React from "react";
import { useProjectStore } from "../store/useProjectStore";

const Debug = () => {
  const zoom = useProjectStore((s) => s.zoom);
  const selection = useProjectStore((s) => s.selection);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "5px 15px",
        borderRadius: 5,
        fontSize: 12,
        fontFamily: "monospace",
        zIndex: 9999,
      }}
    >
      <h4 style={{ margin: "5px 0" }}>Debug Info</h4>
      <pre>zoom.pxPerBeat: {zoom.pxPerBeat}</pre>
      <pre>selection.selectedTrackId: {JSON.stringify(selection.selectedTrackId)}</pre>
    </div>
  );
};

export default Debug;
