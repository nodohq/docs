
import { create } from "zustand";
import { clampZoom } from "../utils/projection";
import { snapBeatToBeat } from "../utils/snap";
import { MIN_BLOCK_LEN_BEATS } from "../utils/collisions";

const DEFAULT = {
  bpmLocked: 126,
  zoom: {
    pxPerBeat: 2,
  },
  selection: {
    selectedTrackId: null,
    selectedBlockId: null, // Ticket #07: optional (useful for inspector)
  },
  tracks: [
    { id: "t1", title: "Call On Me", artist: "Eric Prydz", bpm: 126, key: "10A", energy: 0.55 },
    { id: "t2", title: "Groovejet", artist: "Spiller", bpm: 123, key: "8A", energy: 0.62 },
  ],
  timeline: {
    blocks: [
      { id: "b1", trackId: "t1", startBeat: 0, lengthBeats: 512 },
      { id: "b2", trackId: "t2", startBeat: 480, lengthBeats: 512 },
    ],
    playheadBeat: 0,

    // Ticket #07: lane layout (vertical rows by track)
    layout: {
      headerTopPx: 40,      // aligns with your previous top: '40px'
      laneHeightPx: 72,     // row height for a track lane
      laneGapPx: 8,         // spacing between lanes
    },
  },
};

export const useProjectStore = create((set, get) => ({
  ...DEFAULT,

  // --- Ticket #07: Lane helpers (derived, no side effects) ---
  getTrackIndex: (trackId) => {
    const tracks = get().tracks;
    return tracks.findIndex((t) => t.id === trackId);
  },

  getLaneTopPx: (trackId) => {
    const { headerTopPx, laneHeightPx, laneGapPx } = get().timeline.layout;
    const idx = get().getTrackIndex(trackId);
    if (idx < 0) return headerTopPx; // fallback
    return headerTopPx + idx * (laneHeightPx + laneGapPx);
  },

  setTimelineLayout: (patch) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        layout: { ...state.timeline.layout, ...patch },
      },
    }));
  },

  // Optional: track reordering for lanes (safe no-op if ids mismatch)
  setTrackOrder: (orderedTrackIds) => {
    set((state) => {
      if (!Array.isArray(orderedTrackIds) || orderedTrackIds.length === 0) return state;

      const byId = new Map(state.tracks.map((t) => [t.id, t]));
      const next = [];
      for (const id of orderedTrackIds) {
        const t = byId.get(id);
        if (t) next.push(t);
      }
      // append any missing tracks at end
      for (const t of state.tracks) {
        if (!orderedTrackIds.includes(t.id)) next.push(t);
      }

      return { tracks: next };
    });
  },

  // --- Block Manipulation (Ticket #06) ---
  moveBlock: (blockId, nextStartBeat) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        blocks: state.timeline.blocks.map((block) =>
          block.id === blockId ? { ...block, startBeat: snapBeatToBeat(nextStartBeat) } : block
        ),
      },
    }));
  },

  resizeBlock: (blockId, nextLengthBeats) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        blocks: state.timeline.blocks.map((block) =>
          block.id === blockId
            ? { ...block, lengthBeats: Math.max(MIN_BLOCK_LEN_BEATS, snapBeatToBeat(nextLengthBeats)) }
            : block
        ),
      },
    }));
  },

  // --- Block creation (Ticket #05) ---
  createBlockFromTrack: (trackId, startBeat) => {
    set((state) => {
      const trackExists = state.tracks.some((t) => t.id === trackId);
      if (!trackExists) return state;

      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `b_${Date.now()}_${Math.random()}`;

      const newBlock = {
        id,
        trackId,
        startBeat: snapBeatToBeat(startBeat),
        lengthBeats: 512,
      };

      return {
        timeline: {
          ...state.timeline,
          blocks: [...state.timeline.blocks, newBlock],
        },
      };
    });
  },

  // --- Playhead (Ticket #04) ---
  setPlayheadBeat: (beat) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        playheadBeat: snapBeatToBeat(beat),
      },
    }));
  },

  // --- Zoom ---
  setPxPerBeat: (newPxPerBeat) => {
    set((state) => ({
      zoom: { ...state.zoom, pxPerBeat: clampZoom(newPxPerBeat) },
    }));
  },

  // --- Selection ---
  selectTrack: (trackId) => {
    set((state) => {
      const exists = state.tracks.some((t) => t.id === trackId);
      return { selection: { ...state.selection, selectedTrackId: exists ? trackId : null } };
    });
  },

  selectBlock: (blockId) => {
    set((state) => {
      const exists = state.timeline.blocks.some((b) => b.id === blockId);
      return { selection: { ...state.selection, selectedBlockId: exists ? blockId : null } };
    });
  },

  getSelectedTrack: () => {
    const id = get().selection.selectedTrackId;
    return get().tracks.find((t) => t.id === id) ?? null;
  },

  getSelectedBlock: () => {
    const id = get().selection.selectedBlockId;
    return get().timeline.blocks.find((b) => b.id === id) ?? null;
  },

  // --- Mutations ---
  updateTrackMeta: (trackId, patch) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)),
    }));
  },

  // --- Hydration from IndexedDB ---
  hydrateFromStorage: (data) => {
    if (!data || typeof data !== "object") return;

    set((state) => ({
      bpmLocked: data.bpmLocked ?? state.bpmLocked,
      zoom: data.zoom ?? state.zoom,
      selection: data.selection ?? state.selection,
      tracks: data.tracks ?? state.tracks,
      timeline: {
        ...state.timeline,
        ...data.timeline,
        layout: data.timeline?.layout ?? state.timeline.layout, // keep defaults if missing
      },
    }));
  },
}));
