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

  // TikTok's red highlight color (#FF4C3A) applied as an outline to the badge
  // of the reaction the LOGGED-IN USER placed. Other people's reaction badges
  // render with outline-style:none. This is the only reliable inline signal.
  SELF_REACTION_OUTLINE: 'rgb(255, 76, 58)',

  // Did the logged-in user place a reaction on this message?
  //
  // NOTE: flex-direction (row/row-reverse) of [data-area="Actions"] only tells
  // you who SENT the message, NOT who reacted — confirmed by a reaction the
  // other person placed on one of my own (row-reverse) messages. The badge
  // markup, aria-* and hashed css-* classes are identical regardless of who
  // reacted. The single distinguishing signal is the red self-outline TikTok
  // paints on your own reaction badge. A message may carry several reaction
  // badges (e.g. in a group); we match if ANY of them is mine.
  isMyReaction(item) {
    const badges = item.querySelectorAll(this.S.reactionDisplay);
    for (const b of badges) {
      const cs = getComputedStyle(b);
      if (cs.outlineStyle !== 'none' && cs.outlineColor === this.SELF_REACTION_OUTLINE) {
        return true;
      }
    }
    return false;
  },

  isSharedVideo(item) {
    return !!item.querySelector(this.S.sharedVideo);
  },

  // Stable per-message id (snowflake-ish; also implies chronological order).
  getMsgId(item) {
    const ic = item.querySelector(this.S.msgIdIcon);
    return ic ? ic.id.replace('more-action-icon-msg-', '') : null;
  },

  // Target test: a reaction *I* placed, optionally restricted to shared videos.
  // Works for 1-1 and group threads alike — direction is irrelevant.
  matches(item, videoOnly) {
    return this.isMyReaction(item) &&
      (videoOnly ? this.isSharedVideo(item) : true);
  },

  // The URL has no conversationId; identify the current conversation by header name.
  convKey() {
    const n = document.querySelector(this.S.convName);
    return n ? n.textContent.trim() : '';
  }
};
