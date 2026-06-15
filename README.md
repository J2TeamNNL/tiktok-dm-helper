# TikTok DM — Jump to Last Reacted Video

**Language:** **English** · [Tiếng Việt](README.vi.md)

A **client-side** Chrome extension (Manifest V3) for `tiktok.com/messages`. One click → it scrolls to the **most recent video you reacted to** (a video the other person sent you), centers it on screen, and highlights it. No API calls, no data leaves your browser.

## Install (Load unpacked)
1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** → select this folder.

## Usage
1. Open `https://www.tiktok.com/messages` and enter a conversation.
2. A floating panel appears in the bottom-right corner:
   - **⤴ Latest reacted video** — click to jump to the most recent video you reacted to.
   - **Videos only** (on by default) — uncheck to also count reacted text/image messages.
   - While running, a progress line and a **Cancel** button are shown.

## How it works
- "Your reaction" = a reaction badge on a message the **other person sent** (incoming). Correct for 1-on-1 chats.
- A conversation opens at the bottom (newest). The extension scrolls **up**, lazy-loading older messages, and stops at the **first incoming message with a reaction found from the bottom up** = the most recent one.
- The DOM contains no video link, so the extension only scrolls and highlights; you click the video yourself to watch it.

## Structure
- `manifest.json` — MV3 declaration.
- `src/dom-selectors.js` — all selectors + detection rules (edit here if TikTok changes its DOM).
- `src/finder.js` — scroll-up & scan algorithm.
- `src/ui-panel.js` — floating panel, toggle, progress/cancel, highlight, toast.
- `src/content-script.js` — mount/unmount panel on SPA navigation.
- `styles.css` — panel + highlight styles.

## Notes
- Selectors are based on TikTok's DOM as of June 2026; if TikTok changes its DOM, update `src/dom-selectors.js` (it already logs a `console.warn` when a selector fails to match).
- Purely client-side on your own account (only scrolls/reads the DOM — never sends or adds reactions) → low risk, but still light automation on the TikTok web app.
