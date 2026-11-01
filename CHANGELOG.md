# Kingdoms standalone cleanup (2026-11-01)

- Removed Return to Wayfarer button and iframe parent messaging from the game.
- Removed the Wayfarer return link from the rotate-phone screen.
- Preserved independent Kingdoms authentication, models, rendering, game menu, saves and Sandbox. Browser verification pending.

# Kingdoms standalone branch split (2026-11-01)

- Created `kingdoms-standalone` from main at `c9609b60be412332b935aa7c54342a92c3519f08`.
- Promoted the existing `kingdoms-of-the-unknown/` directory contents to branch root; kept models, gamecode, images and standalone entry point.
- Wayfarer return links and any shared login/integration assumptions require review before standalone deployment. Runtime verification pending.
- Original main and backups remain unchanged.
