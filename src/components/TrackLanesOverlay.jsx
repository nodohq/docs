import React from "react";
import { useProjectStore } from "../store/useProjectStore";
import { Z_INDEX } from "../constants";

export default function TrackLanesOverlay({
  width,
  labelWidthPx = 220,
  showLabels = true,
}) {
  const tracks = useProjectStore((s) => s.tracks);
  const getLaneTopPx = useProjectStore((s) => s.getLaneTopPx);
  const laneHeightPx = useProjectStore((s) => s.timeline.layout.laneHeightPx);
  const headerTopPx = useProjectStore((s) => s.timeline.layout.headerTopPx);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: width ? `${width}px` : "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {/* Lane backgrounds (with their own stacking context) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: Z_INDEX.lanes,
          pointerEvents: "none",
        }}
      >
        {tracks.map((t, idx) => {
          const top = getLaneTopPx(t.id);
          const isEven = idx % 2 === 0;
          return (
            <div
              key={t.id}
              style={{
                position: "absolute",
                left: `${labelWidthPx}px`,
                top: `${top}px`,
                width: `calc(100% - ${labelWidthPx}px)`,
                height: `${laneHeightPx}px`,
                background: isEven
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.01)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(0,0,0,0.35)",
                boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>

      {/* Sticky lane labels (in the root stacking context) */}
      {showLabels && (
        <>
          {/* cover header area */}
          <div
            style={{
              position: "sticky",
              left: 0,
              top: 0,
              width: `${labelWidthPx}px`,
              height: `${headerTopPx}px`,
              background: "rgba(0,0,0,0.35)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              zIndex: Z_INDEX.labels,
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />

          {/* labels start below header */}
          <div
            style={{
              position: "sticky",
              left: 0,
              top: `${headerTopPx}px`,
              width: `${labelWidthPx}px`,
              height: "100%",
              zIndex: Z_INDEX.labels,
              pointerEvents: "none",
            }}
          >
            {/* subtle backing panel for the rest of the column */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.35)",
                boxSizing: "border-box",
              }}
            />

            {tracks.map((t) => {
              const top = getLaneTopPx(t.id) - headerTopPx;
              return (
                <div
                  key={`label_${t.id}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: `${top}px`,
                    width: "100%",
                    height: `${laneHeightPx}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 10px",
                    boxSizing: "border-box",
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.92)",
                      fontSize: 13,
                      lineHeight: "16px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 11,
                      lineHeight: "14px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.artist}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
