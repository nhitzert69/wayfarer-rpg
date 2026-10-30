# Kingdoms of the Unknown

Standalone game project, separate from Wayfarer RPG application logic and account data.

- `gamecode/`: game runtime and styles, currently launched from Wayfarer's Character Play button.
- `images/`: game-specific artwork and reference images (large binary assets awaiting upload).
- `models/`: terrain models and textures (large binary assets awaiting upload).

The existing game shell is not yet a fully standalone playable build. It currently uses the title image in Wayfarer's `assets/images/`; move/copy that asset here and update the reference before independent deployment. Game assets from `gameassets.rar` have **not** been uploaded by this text-only GitHub connector. No new terrain models are wired into the runtime yet.
