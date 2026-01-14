
export const MIN_BLOCK_LEN_BEATS = 16;

/**
 * Checks if two half-open intervals [start, start + len) overlap.
 * @param {number} aStart - Start of the first interval.
 * @param {number} aLen - Length of the first interval.
 * @param {number} bStart - Start of the second interval.
 * @param {number} bLen - Length of the second interval.
 * @returns {boolean} - True if they overlap, false otherwise.
 */
export function overlaps(aStart, aLen, bStart, bLen) {
  const aEnd = aStart + aLen;
  const bEnd = bStart + bLen;
  // Overlap exists if one interval starts before the other ends, AND vice-versa.
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Validates if a block's proposed new placement is valid.
 * @param {Array<object>} blocks - The array of all timeline blocks from the store.
 * @param {string} movingId - The ID of the block being moved/resized.
 * @param {number} nextStart - The proposed new start beat for the block.
 * @param {number} nextLen - The proposed new length in beats for the block.
 * @returns {boolean} - True if the placement is valid, false otherwise.
 */
export function isPlacementValid(blocks, movingId, nextStart, nextLen) {
  // Rule 1: Must start at or after beat 0.
  if (nextStart < 0) {
    return false;
  }

  // Rule 2: Must have a minimum length.
  if (nextLen < MIN_BLOCK_LEN_BEATS) {
    return false;
  }

  // Rule 3: Must not collide with any other block.
  for (const block of blocks) {
    // Skip checking against itself.
    if (block.id === movingId) {
      continue;
    }
    if (overlaps(nextStart, nextLen, block.startBeat, block.lengthBeats)) {
      return false; // Collision detected.
    }
  }

  // All checks passed.
  return true;
}
