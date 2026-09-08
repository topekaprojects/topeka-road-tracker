# Topeka Community Tracker V5 — Multi-Page Edition

Created by Joseph Romero, Topeka, Kansas.

## Pages
- `index.html` — homepage/dashboard and the full road loading screen
- `weather.html` — live current conditions + 7-day NWS forecast
- `roads.html` — road construction, costs and project-status graph
- `closures.html` — KanDrive/KDOT embedded traffic page
- `fixit.html` — Topeka SeeClickFix pothole reporting
- `news.html` — WIBW crime/local/all-news viewer
- `events.html` — Visit Topeka live events calendar
- `report.html` — embedded road-construction PDF
- `about.html` — creator/about and source directory

## Navigation behavior
The full road loading screen appears only on the first homepage visit in a browser session. Moving between local pages uses a short family-car road transition instead. Returning to Home during the same session does not replay the long loader.

## GitHub Pages
Upload every file in this folder to the repository root. Do not upload only `index.html`; `styles.css`, `app.js`, every HTML page, and the PDF are required.


## V5.1 transition assets
Keep `happy.png`, `shocked.png`, and `sadsad.png` in the same root folder as the HTML files. They power the local-page transition in this order: happy driving -> pothole impact/shocked -> stopped/sad. The full road loading screen appears only on the first homepage visit in a browser session.

## V5.3 interaction update
- Pothole repositioned to align with the front tire at the impact beat.
- Shared transition is created by app.js on every page, so all internal navigation uses it.
- Happy -> shocked -> sadsad sequence preserved using the supplied PNG assets.
- Final sad car drifts backward left while the road/camera continues panning right.
- Transition fades in from black, then closes with split swing doors; destination opens with the same doors.
- Homepage dashboard cards react subtly to mouse movement on desktop only.
- Navigation has a cooler glow and animated multicolor underline.
- Scroll-to-top button is injected on every page.
