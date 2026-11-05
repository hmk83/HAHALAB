(function () {
  'use strict';

  const NativeAudio = window.Audio;
  if (typeof NativeAudio === 'function') {
    function PatchedAudio(src) {
      const audio = new NativeAudio(src);
      const normalized = String(src || '');
      if (normalized.includes('error.mp3')) {
        audio.play = () => Promise.resolve();
        audio.pause = () => {};
        audio.volume = 0;
      }
      return audio;
    }

    PatchedAudio.prototype = NativeAudio.prototype;
    window.Audio = PatchedAudio;
  }

  try {
    if (navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate = () => false;
      } catch (_assignError) {
        // ignore
      }
      Object.defineProperty(navigator, 'vibrate', {
        value: () => false,
        configurable: true
      });
    }
  } catch (_error) {
    // ignore
  }
})();
