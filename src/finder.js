// Finder: locate the most-recent message *I* reacted to by scrolling up
// (lazy-loading older messages) until a match is found or the top is reached.

window.TTReact = window.TTReact || {};

TTReact.find = (function () {
  const sel = () => TTReact.sel;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // After jumping to the top, wait for lazy-load. Returns true if more messages
  // loaded (scrollHeight or item count grew), false if the top has been reached.
  async function waitGrowOrTop(scroller, prevH, prevN, signal) {
    const deadline = 3000; // recon: older messages land ~1.5s; 3s is a safe ceiling
    const step = 200;
    let waited = 0;
    while (waited < deadline) {
      if (signal.aborted) return false;
      await sleep(step);
      waited += step;
      const grew = scroller.scrollHeight > prevH ||
        document.querySelectorAll(sel().S.item).length > prevN;
      if (grew) return true;
    }
    return false;
  }

  // opts: { videoOnly:boolean, onProgress(loadedCount), signal:AbortSignal }
  // Returns the matching <item> element, or null if none exists in the whole thread.
  return async function find(opts) {
    const { videoOnly, onProgress, signal } = opts;
    const s = sel();
    const scroller = s.getScroller();
    if (!scroller) throw new Error('NO_SCROLLER');

    const MAX_ROUNDS = 400; // safety ceiling so a pathological thread can't loop forever
    for (let round = 0; round < MAX_ROUNDS; round++) {
      if (signal.aborted) throw new Error('ABORTED');

      // Scan from the BOTTOM (newest) upward; the first match is the most recent.
      // Older messages prepend at the top, so the bottom is stable across loads.
      const items = s.getItems();
      for (let i = items.length - 1; i >= 0; i--) {
        if (s.matches(items[i], videoOnly)) return items[i];
      }

      // Not in the current DOM -> load older messages by jumping to the top.
      const prevH = scroller.scrollHeight;
      const prevN = items.length;
      scroller.scrollTop = 0;
      if (onProgress) onProgress(prevN);

      const grew = await waitGrowOrTop(scroller, prevH, prevN, signal);
      if (signal.aborted) throw new Error('ABORTED');
      if (!grew) return null; // reached the very top, nothing matched
    }
    return null;
  };
})();
