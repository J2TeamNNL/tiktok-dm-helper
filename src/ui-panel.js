// Floating control panel: trigger button, scope toggle, progress + cancel,
// result highlight and toasts. Mounted on <body> so it survives chat swaps.

window.TTReact = window.TTReact || {};

TTReact.ui = (function () {
  const STORE_KEY = 'ttreact_video_only';
  let panel = null;
  const els = {};
  let controller = null; // AbortController of the running search
  let highlighted = null;
  let highlightTimer = null;
  let scopeVideoOnly = true; // in-memory scope, synced with chrome.storage

  function loadScope() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(STORE_KEY, (o) =>
          resolve(o[STORE_KEY] !== undefined ? o[STORE_KEY] : true));
      } catch (e) { resolve(true); }
    });
  }
  function saveScope(v) {
    try { chrome.storage.local.set({ [STORE_KEY]: v }); } catch (e) { /* noop */ }
  }

  // Reflect the current scope on the segmented control.
  function applyScope() {
    els.seg.querySelectorAll('.tt-seg-btn').forEach((b) => {
      b.classList.toggle('active', (b.dataset.vo === '1') === scopeVideoOnly);
    });
  }

  function toast(msg, ms = 2600) {
    const t = panel.querySelector('.tt-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), ms);
  }

  function setRunning(on) {
    els.btn.disabled = on;
    els.cancel.style.display = on ? '' : 'none';
    els.status.style.display = on ? '' : 'none';
    if (!on) els.status.textContent = '';
  }

  function clearHighlight() {
    if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
    if (highlighted) { highlighted.classList.remove('tt-jump-highlight'); highlighted = null; }
  }

  function highlight(item) {
    clearHighlight();
    item.classList.add('tt-jump-highlight');
    highlighted = item;
    highlightTimer = setTimeout(clearHighlight, 8000);
  }

  function scrollToCenter(item) {
    try {
      item.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) {
      const sc = TTReact.sel.getScroller();
      if (sc) sc.scrollTop = item.offsetTop - sc.clientHeight / 2;
    }
  }

  async function run() {
    if (controller) return; // already running
    clearHighlight();
    if (!TTReact.sel.getScroller()) { toast('Mở một cuộc trò chuyện trước'); return; }

    controller = new AbortController();
    setRunning(true);
    try {
      const item = await TTReact.find({
        videoOnly: scopeVideoOnly,
        signal: controller.signal,
        onProgress: (n) => { els.status.textContent = `Đang tìm… đã nạp ${n} tin`; }
      });
      if (item) {
        scrollToCenter(item);
        highlight(item);
        toast('Đã tới video gần nhất bạn đã reaction');
      } else {
        toast(scopeVideoOnly ? 'Không tìm thấy video bạn đã reaction'
                             : 'Không tìm thấy tin bạn đã reaction');
      }
    } catch (e) {
      if (e && e.message === 'ABORTED') toast('Đã huỷ');
      else if (e && e.message === 'NO_SCROLLER') toast('Mở một cuộc trò chuyện trước');
      else { console.error('[TTReact]', e); toast('Có lỗi — xem Console'); }
    } finally {
      controller = null;
      setRunning(false);
    }
  }

  function cancel() {
    if (controller) controller.abort();
  }

  async function build() {
    panel = document.createElement('div');
    panel.id = 'tt-react-panel';
    panel.innerHTML = `
      <button class="tt-btn" type="button">⤴ Video reaction gần nhất</button>
      <div class="tt-seg" role="group" aria-label="Phạm vi">
        <button class="tt-seg-btn" data-vo="1" type="button">Chỉ video</button>
        <button class="tt-seg-btn" data-vo="0" type="button">Mọi tin</button>
      </div>
      <div class="tt-status" style="display:none"></div>
      <button class="tt-cancel" type="button" style="display:none">Huỷ</button>
      <div class="tt-toast"></div>`;
    document.body.appendChild(panel);

    els.btn = panel.querySelector('.tt-btn');
    els.seg = panel.querySelector('.tt-seg');
    els.status = panel.querySelector('.tt-status');
    els.cancel = panel.querySelector('.tt-cancel');

    scopeVideoOnly = await loadScope();
    applyScope();

    els.seg.addEventListener('click', (e) => {
      const b = e.target.closest('.tt-seg-btn');
      if (!b) return;
      scopeVideoOnly = b.dataset.vo === '1';
      saveScope(scopeVideoOnly);
      applyScope();
    });
    els.btn.addEventListener('click', run);
    els.cancel.addEventListener('click', cancel);
  }

  return {
    async mount() {
      if (panel) { panel.style.display = ''; return; }
      await build();
    },
    unmount() {
      cancel();
      clearHighlight();
      if (panel) panel.style.display = 'none';
    }
  };
})();
