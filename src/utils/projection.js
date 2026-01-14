
/**
 * Ticket #02 - Projection Utilities
 *
 * This module contains pure, deterministic functions for projecting
 * beats (internal time unit) to pixels (visual representation) and back.
 * It ensures that the core logic is separate from the application state.
 */

/**
 * Clamps the zoom level (pxPerBeat) to a safe, usable range.
 * @param {number} pxPerBeat - The desired pixels-per-beat value.
 * @returns {number} The clamped value.
 */
export function clampZoom(pxPerBeat) {
  const n = Number.isFinite(pxPerBeat) ? pxPerBeat : 1;
  return Math.max(0.25, Math.min(n, 512));
}

/**
 * Converts a beat value to a pixel value based on the current zoom.
 * @param {number} beat - The beat value (integer).
 * @param {number} pxPerBeat - The current zoom level.
 * @returns {number} The corresponding pixel value (integer).
 */
export function beatToPx(beat, pxPerBeat) {
  const b = Number.isFinite(beat) ? beat : 0;
  const z = Number.isFinite(pxPerBeat) ? pxPerBeat : 1;
  return Math.round(b * z);
}

/**
 * Converts a pixel value back to a beat value.
 * This function must be the inverse of beatToPx for integer beats to ensure
 * round-trip stability.
 * @param {number} px - The pixel value.
 * @param {number} pxPerBeat - The current zoom level.
 * @returns {number} The corresponding beat value (integer).
 */
export function pxToBeat(px, pxPerBeat) {
  const p = Number.isFinite(px) ? px : 0;
  // Avoid division by zero or negative zoom
  const z = Number.isFinite(pxPerBeat) && pxPerBeat > 0 ? pxPerBeat : 1;
  return Math.round(p / z);
}

/**
 * Sanity check for round-trip stability.
 * This can be called from the browser console for verification.
 * e.g., `window.checkProjection()`
 */
export function checkProjectionStability() {
  const tests = [0, 1, 2, 8, 16, 128, 512, 1024];
  const zooms = [0.25, 1, 2, 10, 96.5, 512];
  let failures = 0;

  console.log("--- Running Projection Stability Check ---");
  zooms.forEach(zoom => {
    console.log(`Zoom: ${zoom}px/beat`);
    tests.forEach(beat => {
      const px = beatToPx(beat, zoom);
      const roundTripBeat = pxToBeat(px, zoom);
      if (roundTripBeat !== beat) {
        failures++;
        console.error(
          `FAIL: beat ${beat} -> px ${px} -> beat ${roundTripBeat}`
        );
      } else {
        console.log(
          ` OK : beat ${beat} -> px ${px} -> beat ${roundTripBeat}`
        );
      }
    });
  });

  if (failures === 0) {
    console.log("--- ✅ All projection tests passed! ---");
  } else {
    console.error(`--- ❌ ${failures} projection tests failed! ---`);
  }
}

// For easy access from the console
window.checkProjection = checkProjectionStability;
