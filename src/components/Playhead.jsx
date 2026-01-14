import React from "react";
import { useProjectStore } from "../store/useProjectStore";
import { beatToPx } from "../utils/projection";
import { Z_INDEX } from "../constants";

export default function Playhead({ labelWidthPx = 0 }) {
  const playheadBeat = useProjectStore((s) => s.timeline.playheadBeat);
  const pxPerBeat = useProjectStore((s) => s.zoom.pxPerBeat);

  return (
    <div
      style={{
        position: "absolute",
        left: `${labelWidthPx + beatToPx(playheadBeat, pxPerBeat)}px`,
        top: 0,
        width: 2,
        height: "100%",
        backgroundColor: "red",
        pointerEvents: "none",
        boxShadow: "0 0 10px red",
        zIndex: Z_INDEX.playhead,
      }}
    />
  );
}
