// Bootstrap: mount the panel only on the TikTok messages page, handling SPA
// navigation. TikTok is a single-page app and puts no conversationId in the URL,
// so a light poll covers both route changes and late chat rendering.

(function () {
  const onMessages = () => location.pathname.startsWith('/messages');
  let mounted = false;
  let lastHref = location.href;

  function ensureState() {
    if (!onMessages()) {
      if (mounted) { TTReact.ui.unmount(); mounted = false; }
      return;
    }
    if (mounted) return;
    if (document.querySelector(TTReact.sel.S.messageList)) {
      TTReact.ui.mount();
      mounted = true;
    }
  }

  setInterval(() => {
    if (location.href !== lastHref) lastHref = location.href;
    ensureState();
  }, 700);

  ensureState();
})();
