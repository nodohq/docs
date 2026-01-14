import { create } from "zustand";
import { clampZoom } from "../utils/projection";
import { snapBeatToBeat } from "../utils/snap";
import { isPlacementValid, MIN_BLOCK_LEN_BEATS } from "../utils/collisions";

const DEFAULT = {
  bpmLocked: 126,
  zoom: {
    pxPerBeat: 2,
  },
  selection: {
    selectedTrackId: null,
    selectedBlockId: null,
  },
  tracks: [
    { id: "t1", title: "Call On Me", artist: "Eric Prydz", bpm: 126, key: "10A", energy: 0.55 },
    { id: "t2", title: "Groovejet", artist: "Spiller", bpm: 123, key: "8A", energy: 0.62 },
  ],
  timeline: {
    blocks: [
      { id: "b1", trackId: "t1", startBeat: 0, lengthBeats: 512, transition: "cut" },
      { id: "b2", trackId: "t2", startBeat: 480, lengthBeats: 512, transition: "cut" },
    ],
    playheadBeat: 0,
    layout: {
      headerTopPx: 40,
      laneHeightPx: 72,
      laneGapPx: 8,
    },
  },
};

const TRANSITION_TYPES = ["cut", "fade", "crossfade"];

export const useProjectStore = create((set, get) => ({
  ...DEFAULT,

  getTrackIndex: (trackId) => {
    const tracks = get().tracks;
    return tracks.findIndex((t) => t.id === trackId);
  },

  getLaneTopPx: (trackId) => {
    const { headerTopPx, laneHeightPx, laneGapPx } = get().timeline.layout;
    const idx = get().getTrackIndex(trackId);
    if (idx < 0) return headerTopPx;
    return headerTopPx + idx * (laneHeightPx + laneGapPx);
  },

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

  updateBlock: (blockId, patch) => {
    set((state) => {
      const blocks = state.timeline.blocks;
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return state;

      const cleanPatch = {};
      let hasValidField = false;

      if (patch.startBeat !== undefined && Number.isFinite(patch.startBeat)) {
        cleanPatch.startBeat = patch.startBeat;
        hasValidField = true;
      }
      if (patch.lengthBeats !== undefined && Number.isFinite(patch.lengthBeats)) {
        cleanPatch.lengthBeats = patch.lengthBeats;
        hasValidField = true;
      }
      if (patch.transition !== undefined && TRANSITION_TYPES.includes(patch.transition)) {
        cleanPatch.transition = patch.transition;
        hasValidField = true;
      }

      if (!hasValidField) return state;

      const blockWithAppliedChanges = { ...block, ...cleanPatch };
      
      // Validate position and length together if either changed
      if (cleanPatch.startBeat !== undefined || cleanPatch.lengthBeats !== undefined) {
        const newStart = snapBeatToBeat(blockWithAppliedChanges.startBeat);
        const newLength = snapBeatToBeat(blockWithAppliedChanges.lengthBeats);

        if (
          newLength < MIN_BLOCK_LEN_BEATS ||
          !isPlacementValid(blocks, blockId, newStart, newLength)
        ) {
          // Revert position/length changes if invalid, but keep other valid fields
          delete cleanPatch.startBeat;
          delete cleanPatch.lengthBeats;
          if (!cleanPatch.transition) return state; // No valid fields left
        }
      }

      const finalBlock = { ...block, ...cleanPatch };

      return {
        timeline: {
          ...state.timeline,
          blocks: blocks.map((b) => (b.id === blockId ? finalBlock : b)),
        },
      };
    });
  },

  createBlockFromTrack: (trackId, startBeat) => {
    set((state) => {
      const trackExists = state.tracks.some((t) => t.id === trackId);
      if (!trackExists) return state;

      const id = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `b_${Date.now()}_${Math.random()}`;

      const newBlock = {
        id,
        trackId,
        startBeat: snapBeatToBeat(startBeat),
        lengthBeats: 512,
        transition: "cut", // Default transition
      };

      return {
        timeline: {
          ...state.timeline,
          blocks: [...state.timeline.blocks, newBlock],
        },
      };
    });
  },

  setPlayheadBeat: (beat) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        playheadBeat: snapBeatToBeat(beat),
      },
    }));
  },

  setPxPerBeat: (newPxPerBeat) => {
    set((state) => ({
      zoom: { ...state.zoom, pxPerBeat: clampZoom(newPxPerBeat) },
    }));
  },

  selectTrack: (trackId) => {
    set((state) => {
      const exists = state.tracks.some((t) => t.id === trackId);
      return { selection: { selectedBlockId: null, selectedTrackId: exists ? trackId : null } };
    });
  },

  selectBlock: (blockId) => {
    set((state) => {
      const exists = state.timeline.blocks.some((b) => b.id === blockId);
      return { selection: { selectedTrackId: null, selectedBlockId: exists ? blockId : null } };
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

  updateTrackMeta: (trackId, patch) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)),
    }));
  },

  hydrateFromStorage: (data) => {
    if (!data || typeof data !== "object") return;

    set((state) => {
      const timelineIn = data.timeline;

      const rawBlocks = timelineIn?.blocks ?? state.timeline.blocks;
      const hydratedBlocks = rawBlocks.map((b) => ({
        ...b,
        transition: TRANSITION_TYPES.includes(b.transition) ? b.transition : "cut",
      }));

      return {
        bpmLocked: data.bpmLocked ?? state.bpmLocked,
        zoom: data.zoom ?? state.zoom,
        selection: data.selection ?? state.selection,
        tracks: data.tracks ?? state.tracks,
        timeline: timelineIn
          ? {
              ...state.timeline,
              ...timelineIn,
              blocks: hydratedBlocks,
              layout: {
                ...state.timeline.layout,
                ...(timelineIn.layout ?? {}),
              },
            }
          : state.timeline,
      };
    });
  },
}));
