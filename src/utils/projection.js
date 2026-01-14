/**
 * Ticket #02 - Projection Utilities
 *
 * This module contains pure, deterministic functions for projecting
 * beats (internal time unit) to pixels (visual representation) and back.
 * It ensures that the core logic is separate from the application state.
 * It also enforces the "beat is integer" contract.
 */

/**
 * Sanitizes a number to be a non-negative integer beat.
 * @param {any} n The value to sanitize.
 * @returns {number} A non-negative integer.
 */
function toIntBeat(n) {
  const num = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.round(num));
}

/**
 * Clamps the zoom level (pxPerBeat) to a safe, usable range.
 * @param {number} pxPerBeat - The desired pixels-per-beat value.
 * @returns {number} The clamped value, guaranteed to be > 0.
 */
export function clampZoom(pxPerBeat) {
  const n = Number.isFinite(pxPerBeat) ? pxPerBeat : 1;
  // Clamp between 0.25 and 512, ensuring it's always a positive number.
  return Math.max(0.25, Math.min(n, 512));
}

/**
 * Converts a beat value to a pixel value based on the current zoom.
 * The beat input is sanitized to an integer.
 * @param {number} beat - The beat value.
 * @param {number} pxPerBeat - The current zoom level.
 * @returns {number} The corresponding pixel value (can be a float).
 */
export function beatToPx(beat, pxPerBeat) {
  const b = toIntBeat(beat);
  const z = clampZoom(pxPerBeat);
  return b * z;
}

/**
 * Converts a pixel value back to a beat value.
 * The result is guaranteed to be a non-negative integer.
 * @param {number} px - The pixel value.
 * @param {number} pxPerBeat - The current zoom level.
 * @returns {number} The corresponding beat value (integer).
 */
export function pxToBeat(px, pxPerBeat) {
  const p = Number.isFinite(px) ? px : 0;
  const z = clampZoom(pxPerBeat);
  return toIntBeat(p / z);
}
