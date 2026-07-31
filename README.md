# Race Pace

A single-file mobile web app for planning race pacing, splits, breaks, and cutoffs for ultras and long race days. Supports Distance, Timed, and Backyard Ultra race formats.

## Running locally

No build step, no dependencies. Just open `index.html` directly in a browser, or serve the folder with any static server.

## Deploying

Push `index.html` to the repo and enable GitHub Pages (Settings → Pages → deploy from branch). That's the only file needed — data is stored locally in the browser via `localStorage`, so there's no backend to set up.

## Notes

- Vanilla JS/HTML/CSS, no external libraries.
- Themed SVG backdrops per race (Alpine, Forest, Desert, Night, Coastal, Snow, Track, City).
- Saved races persist in `localStorage` only — clearing browser data or switching devices loses them (no sync yet).
