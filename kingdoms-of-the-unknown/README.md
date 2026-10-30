# Kingdoms of the Unknown

Game entry point: `index.html`. Game source: `gamecode/`. Terrain models and textures: `models/`. Reference images: `images/`.

The game has an independent username/PIN login and map viewer, and can be launched through the Wayfarer Character Play button. It uses the existing Supabase Auth project, with a distinct browser session key, and does not access Wayfarer saves. For this prototype, account credentials are shared with Wayfarer, but account sessions are separate. Existing Wayfarer title artwork is referenced from the parent repository, so fully standalone asset packaging is pending. Three.js and Supabase SDK currently require CDN access. Browser rendering, login, and model compatibility have not been verified.
