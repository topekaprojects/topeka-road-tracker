# Topeka Community Tracker

A static GitHub Pages community dashboard for Topeka, Kansas.

## Included
- True full-screen animated loader with a longer 4.2-second minimum display and clean page handoff
- Mobile-first responsive layout
- Live National Weather Service weather + active alert lookup
- Weather pill in the top-right navigation
- Embedded KanDrive/KDOT traffic and road-closure map with fallback source link
- Embedded Topeka SeeClickFix pothole/city issue reporting portal with fallback source link
- Embedded WIBW Crime / News / Local tabs with fallback source link
- Upcoming Topeka event cards + embedded Visit Topeka calendar
- 12-project road construction tracker with filters
- Embedded September 2026 road-construction PDF

## Publish with GitHub Pages
1. Create a public GitHub repository, e.g. `topeka-community-tracker`.
2. Upload the contents of this folder to the repository root.
3. Commit the files.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select **main** and **/(root)**, then Save.

## Third-party embeds
Some websites send browser security headers that can block themselves from appearing inside an iframe. This site intentionally includes the requested iframe embeds, plus an **Open full source** link for every external module so the feature remains usable if the provider blocks framing. This cannot be overridden by GitHub Pages code.

## Live weather
The site uses the official `api.weather.gov` public API for central Topeka. If the API is temporarily unavailable, the weather module falls back to a direct National Weather Service link.
