
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
    playheadBeat: 0, // Ticket #04: Add playhead state
  },
};

export const useProjectStore = create((set, get) => ({
  ...DEFAULT,

  // --- Block Manipulation (Ticket #06) ---
  moveBlock: (blockId, nextStartBeat) => {
    set(state => ({
      timeline: {
        ...state.timeline,
        blocks: state.timeline.blocks.map(block => 
          block.id === blockId 
            ? { ...block, startBeat: snapBeatToBeat(nextStartBeat) } 
            : block
        ),
      },
    }));
  },

  resizeBlock: (blockId, nextLengthBeats) => {
    set(state => ({
      timeline: {
        ...state.timeline,
        blocks: state.timeline.blocks.map(block =>
          block.id === blockId
            ? { ...block, lengthBeats: Math.max(MIN_BLOCK_LEN_BEATS, snapBeatToBeat(nextLengthBeats)) }
            : block
        ),
      },
    }));
  },


  // --- Block creation (Ticket #05) ---
  createBlockFromTrack: (trackId, startBeat) => {
    set(state => {
      const trackExists = state.tracks.some(t => t.id === trackId);
      if (!trackExists) {
        return state; // real no-op
      }

      const id =
        (typeof crypto !== "undefined" && crypto.randomUUID)
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
    set(state => ({
      timeline: {
        ...state.timeline,
        playheadBeat: snapBeatToBeat(beat), // Sanitize and set
      }
    }))
  },

  // --- Zoom ---
  setPxPerBeat: (newPxPerBeat) => {
    set((state) => ({
      zoom: {
        ...state.zoom,
        pxPerBeat: clampZoom(newPxPerBeat),
      },
    }));
  },

  // --- Selection ---
  selectTrack: (trackId) => {
    set(state => {
        const exists = state.tracks.some((t) => t.id === trackId);
        return { selection: { ...state.selection, selectedTrackId: exists ? trackId : null } };
    });
  },

  getSelectedTrack: () => {
    const id = get().selection.selectedTrackId;
    return get().tracks.find((t) => t.id === id) ?? null;
  },

  // --- Mutations ---
  updateTrackMeta: (trackId, patch) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, ...patch } : t
      ),
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
      timeline: data.timeline ?? state.timeline,
    }));
  },

}));
