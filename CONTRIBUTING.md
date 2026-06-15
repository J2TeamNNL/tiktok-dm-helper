# Contributing

Thanks for your interest in improving **TikTok DM Helper**! This guide covers how the extension works and how to contribute.

## Ways to contribute
- **Report a bug** — open an [Issue](../../issues/new). Include: what you did, what you expected, what happened, and your Chrome version. A screenshot or the browser console output helps a lot.
- **Suggest a feature** — open an Issue describing the idea and why it's useful.
- **Send a fix or feature** — fork the repo, make your change, and open a Pull Request. Keep PRs focused on one thing and describe what changed.

## How it works
- "Your reaction" = a reaction badge **you** placed, on any message (yours or theirs). TikTok paints your own reaction badge with a red outline (`#FF4C3A`, `outline-style ≠ none`); other people's reactions have no outline. This is the only reliable inline signal — message direction (who *sent* it) does **not** tell you who *reacted*.
- A conversation opens at the bottom (newest). The extension scrolls **up**, lazy-loading older messages, and stops at the **first message with your reaction found from the bottom up** = the most recent one.
- A message can carry several reaction badges (e.g. in a group); it matches if **any** badge is yours. Group threads have not been tested against live DOM yet — the logic generalizes, but verify if you have a group chat.
- The DOM contains no video link, so the extension only scrolls and highlights; the user clicks the video to watch it.

## Project structure
- `manifest.json` — MV3 declaration.
- `src/dom-selectors.js` — all selectors + detection rules (edit here if TikTok changes its DOM).
- `src/finder.js` — scroll-up & scan algorithm.
- `src/ui-panel.js` — floating panel, toggle, progress/cancel, highlight, toast.
- `src/content-script.js` — mount/unmount panel on SPA navigation.
- `styles.css` — panel + highlight styles.

## Local development
1. Clone the repo.
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the folder.
3. After editing files, click the **reload** icon on the extension card to apply changes.

## Notes for maintainers
- Selectors are based on TikTok's DOM as of June 2026; if TikTok changes its DOM, update `src/dom-selectors.js` (it already logs a `console.warn` when a selector fails to match).
- The extension is purely client-side: it only scrolls and reads the DOM — it never sends messages or adds reactions.
