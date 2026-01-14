import { pxToBeat } from "./projection";

/**
 * Sanitizes a number to be a non-negative integer beat.
 * This is the single source of truth for beat sanitation.
 * @param {any} n The value to sanitize.
 * @returns {number} A non-negative integer.
 */
function sanitizeBeat(n) {
  const num = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.round(num));
}

/**
 * Snaps a pixel value to the nearest integer beat.
 * Relies on the core projection logic.
 * @param {number} px - The pixel value from the UI.
 * @param {number} pxPerBeat - The current zoom level.
 * @returns {number} A non-negative integer beat.
 */
export function snapPxToBeat(px, pxPerBeat) {
  const rawBeat = pxToBeat(px, pxPerBeat);
  return sanitizeBeat(rawBeat);
}

/**
 * Ensures a beat value is a valid, non-negative integer.
 * This is a simple pass-through to the sanitizer.
 * @param {number} beat - The beat value to snap.
 * @returns {number} A non-negative integer beat.
 */
export function snapBeatToBeat(beat) {
  return sanitizeBeat(beat);
}
