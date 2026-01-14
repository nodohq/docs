import { create } from 'zustand';

const useViewStore = create((set) => ({
  zoom: 100, // Example initial zoom level (100 pixels per beat)
  project: [
    // Example initial project data
    { id: 1, start: 0, length: 16 },
    { id: 2, start: 24, length: 8 },
    { id: 3, start: 32, length: 32 },
  ],
  setZoom: (zoom) => set({ zoom }),
}));

export default useViewStore;
