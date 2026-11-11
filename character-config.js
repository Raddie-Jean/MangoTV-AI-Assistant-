window.MANGO_CHARACTER_CONFIG = {
  poster: "assets/v5/img15.png",
  gif: "assets/character/welcome-source.gif",
  loop: true, // The original GIF declares infinite looping.
  durationMs: 4000, // Used only when loop is false.
  // Fixed source-space window. Keep the same crop for every frame.
  // Original animation remains unchanged: 450×600, 193 frames, 8040ms.
  gifFrame: {
    width: 450,
    height: 600,
    crop: { x: 55, y: 13, width: 282, height: 254 },
  },
};
