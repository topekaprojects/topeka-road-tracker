# Topeka Community Tracker V5.4

This update fixes the pothole transition shock frame and synchronizes the roadwork loader props with the moving perspective road.

- `shocked.png` is held visibly after impact before `sadsad.png`.
- The car and road markings freeze together at pothole impact.
- Road Closed sign, small cone, and large cone move toward the viewer with the loader road perspective.
- All existing multi-page navigation, live weather, road tracker, embeds, transitions, and mobile behavior are preserved.


## V5.5 additions
- SE 29th / Butcher Creek verified closure notice and official detour; city source dated Sep 30, 2026.
- Crime page with authoritative official data links. No fabricated current crime rate.
- Faster pothole navigation (~1.5s vs 4.5s), shorter arrival and first-visit loader.
- Scheduled news headline refresh via GitHub Actions every 6 hours. Requires repository Actions enabled and workflow write permissions; not an official closure-status feed. Site checks generated JSON every 15 minutes while open.
- Official KanDrive map continues to supply near-real-time state traffic. City street closures require manual confirmation or a future verified city API.
