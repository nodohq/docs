// src/config.js
export const BLOCK_TYPES = [
  {
    type: "standard",
    label: "Standard",
    DEFAULTS: {
      lengthBeats: 256,
      transition: "cut",
    },
  },
  {
    type: "long",
    label: "Long",
    DEFAULTS: {
      lengthBeats: 512,
      transition: "cut",
    },
  },
  {
    type: "fade",
    label: "Fade",
    DEFAULTS: {
      lengthBeats: 256,
      transition: "fade",
    },
  },
  {
    type: "crossfade",
    label: "XFade",
    DEFAULTS: {
      lengthBeats: 256,
      transition: "crossfade",
    },
  },
];

export const BLOCK_DEFAULTS_BY_TYPE = Object.fromEntries(
  BLOCK_TYPES.map((t) => [t.type, t.DEFAULTS])
);
