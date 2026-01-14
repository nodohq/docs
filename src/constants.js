// Defines the explicit stacking order for timeline components.
// Higher numbers are on top.
// - Lane backgrounds are at the bottom.
// - The grid sits on top of the lanes.
// - Blocks sit on top of the grid (a dragging block gets +1).
// - The playhead is always on top of blocks.
// - Sticky labels for lanes are always on top of everything else.
export const Z_INDEX = {
  lanes: 1,
  grid: 2,
  blocks: 5,
  playhead: 7,
  labels: 10,
};
