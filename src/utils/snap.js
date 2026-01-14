
import { pxToBeat } from './projection';

/**
 * Snaps a pixel value to the nearest integer beat.
 * @param {number} px - The pixel value to snap.
 * @param {number} pxPerBeat - The number of pixels per beat.
 * @returns {number} The snapped beat value (integer, >= 0).
 */
export const snapPxToBeat = (px, pxPerBeat) => {
  const beat = pxToBeat(px, pxPerBeat);
  return Math.max(0, Math.round(beat));
};

/**
 * Snaps a beat value to the nearest integer beat.
 * @param {number} beat - The beat value to snap.
 * @returns {number} The snapped beat value (integer, >= 0).
 */
export const snapBeatToBeat = (beat) => {
  return Math.max(0, Math.round(beat));
};
