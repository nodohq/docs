import { create } from "zustand";

/**
 * Ticket #02 — Beat-Atomic store
 * - Unité interne: beat (entier)
 * - Conversions beat <-> pixels (zoom constant)
 * - Sélection de track
 *
 * PAS DE LOGIQUE TIMELINE (snapping/collisions) ici.
 * PAS DE PERSISTENCE ici.
 */

const DEFAULT = {
  bpmLocked: 126, // référence globale (affichage uniquement)
  zoom: {
    pxPerBeat: 2, // zoom constant
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

function toIntBeat(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

export const useProjectStore = create((set, get) => ({
  ...DEFAULT,

  // --- Conversions ---
  beatToPx: (beat) => {
    return toIntBeat(beat) * get().zoom.pxPerBeat;
  },

  pxToBeat: (px) => {
    const p = Number.isFinite(px) ? px : 0;
    return toIntBeat(p / get().zoom.pxPerBeat);
  },

  // --- Selection ---
  selectTrack: (trackId) => {
    const exists = get().tracks.some((t) => t.id === trackId);
    set({ selection: { selectedTrackId: exists ? trackId : null } });
  },

  getSelectedTrack: () => {
    const id = get().selection.selectedTrackId;
    return get().tracks.find((t) => t.id === id) ?? null;
  },

  // --- Mutations simples ---
  updateTrackMeta: (trackId, patch) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, ...patch } : t
      ),
    }));
  },

  setPxPerBeat: (pxPerBeat) => {
    set((state) => {
      const v = Number.isFinite(pxPerBeat)
        ? pxPerBeat
        : state.zoom.pxPerBeat;

      return {
        zoom: {
          ...state.zoom,
          pxPerBeat: Math.max(0.25, v),
        },
      };
    });
  },
}));
