// src/components/Toolbar.jsx
import React from "react";
import { useProjectStore } from "../store/useProjectStore";
import { BLOCK_TYPES } from "../config";

export default function Toolbar() {
  const createBlock = useProjectStore((s) => s.createBlock);

  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        borderBottom: "1px solid #222",
        background: "#111",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {BLOCK_TYPES.map((t) => (
        <button
          key={t.type}
          onClick={() => createBlock(t.type)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          + {t.label}
        </button>
      ))}
    </div>
  );
}
