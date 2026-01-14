import { create } from "zustand";
import { clampZoom } from "../utils/projection";

/**
 * Ticket #02 — Beat-Atomic store
 * - Internal unit: beat (integer)
 * - Projection logic is handled by `src/utils/projection.js`
 * - State is persisted via a subscriber in `src/storage/`
 *
 * This store should NOT contain projection logic (beat<->px), snapping, or collision detection.
 */

const DEFAULT = {
  bpmLocked: 126, // Global reference (display only)
  zoom: {
    pxPerBeat: 2, // Default zoom level
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
  },
};

export const useProjectStore = create((set, get) => ({
  ...DEFAULT,

  // --- Zoom ---
  setPxPerBeat: (newPxPerBeat) => {
    set((state) => ({
      // Create a new zoom object for immutability, ensuring persistence works
      zoom: {
        ...state.zoom,
        pxPerBeat: clampZoom(newPxPerBeat),
      },
    }));
  },

  // --- Selection ---
  selectTrack: (trackId) => {
    const exists = get().tracks.some((t) => t.id === trackId);
    set(state => ({
        // Create a new selection object
        selection: { ...state.selection, selectedTrackId: exists ? trackId : null }
    }));
  },

  getSelectedTrack: () => {
    const id = get().selection.selectedTrackId;
    return get().tracks.find((t) => t.id === id) ?? null;
  },

  // --- Mutations ---
  updateTrackMeta: (trackId, patch) => {
    set((state) => ({
      // Create a new tracks array
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, ...patch } : t
      ),
    }));
  },

  // --- Hydration from IndexedDB ---
  hydrateFromStorage: (data) => {
    if (!data || typeof data !== "object") return;

    set((state) => ({
      // Only replace data, keep actions
      bpmLocked: data.bpmLocked ?? state.bpmLocked,
      zoom: data.zoom ?? state.zoom,
      selection: data.selection ?? state.selection,
      tracks: data.tracks ?? state.tracks,
      timeline: data.timeline ?? state.timeline,
    }));
  },

}));
