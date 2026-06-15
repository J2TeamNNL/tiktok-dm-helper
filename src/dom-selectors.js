// TikTok DM DOM selectors & predicates — single source of truth.
// Anchors use stable data-e2e attributes (NOT hashed css-xxxxxx classes),
// based on DOM reconnaissance of tiktok.com/messages (2026-06).
// If TikTok changes its DOM, this is the only file that needs editing.

window.TTReact = window.TTReact || {};

TTReact.sel = {
  // Centralized raw selectors.
  S: {
    messageList: '[data-e2e="dm-new-message-list"]',
    item: '[data-e2e="dm-new-chat-item"]',
    horizontal: '[data-area="Actions"]',
    reactionDisplay: '[data-e2e="dm-new-reaction-display"]',
    sharedVideo: '[data-e2e="dm-new-shared-video"]',
    msgIdIcon: '[id^="more-action-icon-msg-"]',
    convName: '[data-e2e="dm-new-chat-nickname"], [data-e2e="chat-uniqueid"]'
  },

  // The element that ACTUALLY scrolls the message list.
  // The outer [data-e2e="dm-new-message-list"] has overflow:auto but does not
  // scroll; the real scroller is its first child (scrollHeight > clientHeight).
  getScroller() {
    const list = document.querySelector(this.S.messageList);
    if (!list) return null;
    const first = list.firstElementChild;
    if (first) {
      const oy = getComputedStyle(first).overflowY;
      if (/(auto|scroll)/.test(oy) && first.scrollHeight > first.clientHeight) return first;
    }
    // fallback: scan descendants for the scrollable one
    for (const cand of list.querySelectorAll('div')) {
      const o = getComputedStyle(cand).overflowY;
      if (/(auto|scroll)/.test(o) && cand.scrollHeight > cand.clientHeight + 40) return cand;
    }
    return null;
  },

  getItems() {
    const items = document.querySelectorAll(this.S.item);
    if (!items.length) console.warn('[TTReact] no message items matched', this.S.item);
    return [...items];
  },

  // A reaction the logged-in user placed sits on an INCOMING message (the other
  // person's bubble). Incoming vs outgoing is told ONLY by the computed
  // flex-direction of the horizontal container: row = incoming (B),
  // row-reverse = outgoing (me). Avatar presence / hash classes are unreliable.
  isIncoming(item) {
    const h = item.querySelector(this.S.horizontal) || item.querySelector('[data-area]');
    if (!h) return false;
    return getComputedStyle(h).flexDirection === 'row';
  },

  // The already-placed reaction badge is always in the DOM (not hover-only),
  // distinct from the hover "react" button [data-e2e="dm-new-reaction-btn"].
  hasReaction(item) {
    return !!item.querySelector(this.S.reactionDisplay);
  },

  isSharedVideo(item) {
    return !!item.querySelector(this.S.sharedVideo);
  },

  // Stable per-message id (snowflake-ish; also implies chronological order).
  getMsgId(item) {
    const ic = item.querySelector(this.S.msgIdIcon);
    return ic ? ic.id.replace('more-action-icon-msg-', '') : null;
  },

  // Target test: my reaction (=> incoming) + has a reaction, optionally video-only.
  matches(item, videoOnly) {
    return this.isIncoming(item) && this.hasReaction(item) &&
      (videoOnly ? this.isSharedVideo(item) : true);
  },

  // The URL has no conversationId; identify the current conversation by header name.
  convKey() {
    const n = document.querySelector(this.S.convName);
    return n ? n.textContent.trim() : '';
  }
};
