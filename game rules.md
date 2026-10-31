# Kingdoms of the Unknown — Game Rules (V3.0.0)

**Mandatory:** Read this file before creating, changing, testing, refactoring, packaging, or integrating any Kingdoms of the Unknown code or assets. Also follow the master `update rules`. Follow `theme creation rules.md` only when a game change also touches Wayfarer themes or theme systems.

## Active branch workflow (2026-10-30)
- Apply authorized game updates directly to `main`; `update-before-commit` is retired from ordinary updates. Create or refresh backup branches only when explicitly requested by the user. Preserve `Latest-backup` and historical backups unless explicitly instructed otherwise. Record each version in the changelog with enough detail to understand rollback consequences.
- Kingdoms username/PIN sign-in may use the same Supabase Auth project as Wayfarer, but its runtime and session storage must remain separate and it must never access Wayfarer save tables or application globals.
- Single-map direction: load only `models/terrain/Playmap/terrain_kingdoms.glb`. Preserve its exported Blender camera as the widest permitted view; zooming out past that camera framing is prohibited. Panning at closer zoom must stay within the original visible ground footprint. Export the Camera object in the GLB; missing camera must produce an actionable error rather than an invented view.

## Model loading and authored framing (2026-10-31)
- Support both GLB/glTF and FBX models. The active terrain remains GLB; future units, buildings, and scenery may use FBX.
- The authored Blender camera uses a 16:9 reference frame. Wider game viewports must crop rather than expand its field of view past the mountain border; narrower viewports may crop horizontally. Preserve zoom and pan restrictions.

## Military Camp footprint and dirt-tile shadow fix v3.0.56 (2026-10-31)
- Set the Military Camp placement footprint to 45 × 35 gameplay metres (previously 60 × 40), preserving uniform imported-model scaling and existing camp rotation, save keys, placement and economy.
- Do not allow BuildingsTerrain dirt tiles to cast or receive shadows. Apply shadow casting only to the building visual, not the combined root group containing floor tiles. Preserve building-to-playable-ground shadows.
- Previously saved building centres remain intact, subject to existing snap/clamp logic. Check collisions and shadows in a live browser.

## New Military Camp GLB v3.0.55 (2026-10-31)
- Load the user-uploaded compressed Military Camp asset stored with literal percent signs as `military%20camp%20model%20level%201.glb`; URL-encode each percent sign as `%25` in the loader path.
- Preserve camp gameplay ID, 60 x 40 placement bounds, visual rotation, uniform scaling, dirt tiles, collisions, economy, save state and Sandbox isolation. Live WebGL visual validation is required.

## Barracks asset rename v3.0.54 (2026-10-31)
- Rename the red-roofed Barracks GLB from `military camp level 1.glb` to `barracks level 1.glb` without re-encoding the binary asset; update only the Barracks loader reference. The tent-filled camp remains `military camp model level 1.glb`.
- Preserve model scales, rotations, terrain tiles, gameplay dimensions, placement, economy, saved positions and Sandbox isolation.

## Military Camp asset rename v3.0.53 (2026-10-31)
- Rename the file previously called `barracks level 1.glb` (which actually contains the tent-filled Military Camp) to `military camp model level 1.glb`. Point only the Military Camp loader to the new filename.
- The actual red-roofed Barracks remains in `military camp level 1.glb` pending a separate rename. Preserve all models, rotations, placement, Sandbox and saved progress.

## Model-fitted building terrain v3.0.52 (2026-10-31)
- Size each building's repeated dirt underlay to its actual uniformly scaled visible X/Z model bounds, trimming the last tiles as needed. Do not stretch or resize the models to match terrain.
- Preserve the 50 x 30, 40 x 30 and 60 x 40 gameplay placement and collision footprints, model rotations, saved positions, economy and Sandbox isolation.

## Military Camp visual orientation v3.0.51 (2026-10-31)
- Rotate only the tent-filled Military Camp GLB visual 90 degrees around Y before uniform scaling. Preserve its 60 x 40 metre plot, tile orientation, collision bounds, player-saved rotation and all other buildings.

## Daytime lighting stage 1 v3.0.50 (2026-10-31)
- Preserve imported terrain/building meshes, textures, gameplay scale, authored camera, positions and Sandbox data. Render with sRGB output, ACES filmic tone mapping and modest 1.12 exposure.
- Use one warm directional sun for illumination and local shadow casting, with a cooler sky/warm-ground hemisphere fill. Avoid double-counting a second key light. Maintain the existing 2048 shadow map, Town Hall-following shadow frustum and mobile-friendly PCFSoftShadowMap; modestly soften shadow radius and reduce normal bias.
- Stage 1 does not add postprocessing, ambient-occlusion passes, day/night transitions or edits to source Blender models. Verify lighting and mobile GPU performance live before declaring visual quality final.

## Correct Barracks/Camp GLB assignments v3.0.49 (2026-10-31)
- The two uploaded files had been assigned the opposite names: load the red-roofed barracks visual from `military camp level 1.glb` for the Barracks gameplay ID, and the tent-filled camp visual from `barracks level 1.glb` for the Military Camp gameplay ID. Do not rename gameplay IDs or move existing saves.
- Remove the mistaken imported-model 90° rotation and independent X/Z stretching. Preserve source geometry proportions with uniform scaling inside the 40 × 30 and 60 × 40 m gameplay footprints. Existing plot dimensions, ground tiles, prices, placement, saves and Sandbox isolation remain unchanged.
- This corrects the visual/model mapping and supersedes the v3.0.48 camp-specific rotation/stretching instruction.

## Building ground alignment and Military Camp orientation v3.0.48 (2026-10-31)
- Keep Town Hall, Barracks and Camp placement footprints at 50 × 30, 40 × 30 and 60 × 40 gameplay metres respectively. Fit each visible model to its designated footprint so terrain does not extend beyond the model's rectangular ground perimeter.
- Rotate the Military Camp's imported visual 90° to put its long axis along the 60 m footprint; retain the existing player-controlled 90° rotation and collision bounds.
- Align the highest surface of the building terrain tiles nearly flush with the Playable_Area instead of placing the lowest tile vertex above ground. Maintain slight depth clearance against z-fighting.
- Do not modify existing saved positions, transactions or Sandbox state.

## Starting buildings, placement and Sandbox v3.0.47 (2026-10-31)
- Start with Town Hall 50 × 30 m, Barracks 40 × 30 m and Military Camp 60 × 40 m, with the latter two near the Town Hall.
- Underlay each building with repeated BuildingsTerrain GLB tiles clipped to the building's rectangular plot. Use the existing 250 × 250 placement grid; invalid overlaps must turn the grid red and disable confirmation.
- Barracks and Military Camp can be sold for 1,000 gold, 150 wood, 100 stone each and rebuilt for 1,250 gold, 200 wood, 150 stone each. Town Hall is not sellable.
- Sandbox uses an in-memory snapshot of the live game resources and building state; sandbox selling, buying, moving and rotating must never modify live storage. Exiting Sandbox discards test changes. Live data remains locally account-scoped; this release does not add cloud persistence.
- Preserve existing Town Hall placement by migrating the previous local save on first building-state write; retain account isolation and original camera behavior.

## Buildings directory v3.0.46 (2026-10-31)
- Rename `models/buildings level 1/` to `models/buildings/` while retaining `level one/` and all existing GLB bytes. Update the Town Hall model loader accordingly; placement, scaling, saved positions and rotation remain unchanged.

## Building model folder v3.0.45 (2026-10-31)
- Rename `models/townhall/` to `models/buildings level 1/`, preserving all contents, including the Level 1 Town Hall GLB. Load the Town Hall from its new URL-encoded folder path. No geometry, placement, save or camera changes.

## Level 1 Town Hall GLB and footprint v3.0.44 (2026-10-31)
- Load the uploaded compressed GLB from `models/townhall/level one/townhall%20level%201%20compressed.glb` (literal percent signs in the GitHub filename require `%25` URL escaping).
- Reserve a 50 × 30 gameplay-metre rectangular placement footprint, swapping axes on 90° rotation. Preserve original GLB proportions, the 250 × 250 placement grid, per-account saves, camera and existing FBX asset as a fallback in the repository.
- This supersedes the earlier 30 × 30 maximum footprint rule for the active Level 1 Town Hall. Live browser verification remains required.

## Playable-area lighting refinement v3.0.43 (2026-10-31)
- Use 12% playable-only desaturation and 3% brightness reduction. Balance global ambient and sunlight to reveal contact contrast. Keep the dedicated southeast light and its shadow camera centered on the moving Town Hall for northwest shadows; preserve decorative terrain textures and all placement controls. Live mobile/WebGL testing remains mandatory.

## Playable-area lighting v3.0.41 (2026-10-31)
- Restrict colour grading to Playable_Area material instances (7% less saturation, 3% less brightness), preserving source textures and decorative perimeter. Enable directional Town Hall shadows pointing northwest on playable terrain only; avoid altering camera and placement controls. Verify mobile performance and shadow rendering in browser.

## Town Hall placement and camera tuning v3.0.40 (2026-10-31)
- Use a 250 × 250 grid (4 gameplay metres per cell) with snap and rotated bounds for the 30 m Town Hall. Movement mode toggles between original and +90° orientation; confirm persists position/rotation, cancel reverts both. Default initial zoom 5×, maximum 20×, minimum 1×. Pan sensitivity reduces gradually at closer zoom. Preserve account and Sandbox isolation.

## Town Hall scale and camera tuning (2026-10-31)
- Level 1 Town Hall has a maximum 30 × 30 gameplay-metre footprint (3% of the 1,000 m square per axis), preserving original proportions. Initial camera zoom is 2.5×, maximum zoom-in 20×, maximum zoom-out 1×; compensate pan sensitivity for zoom.

## Town Hall placement (2026-10-31)
- The Level 1 Human Town Hall is loaded from `models/townhall/Level1/human-townhall.fbx`. Selecting it offers Move; moving reveals a 50×50 grid over `Playable_Area`. Confirm commits the snapped position; cancel returns to the exact pre-move position.
- Keep placement inside the playable square and isolate saved building positions by user and live/Sandbox mode. Do not modify Wayfarer account data or saved progress.

## Single-map and camera authority (2026-10-31)
- Kingdoms has one terrain, one active theme, and one Level 1 Town Hall. Do not expose a map/faction selector; historical map preferences must not affect game loading.
- The Blender camera saved in the current terrain GLB defines the widest permitted camera framing. Camera zoom may move inward, but never outward beyond the Blender framing. The original ground footprint is the allowed view boundary. Preserve the authored camera transform and lens/projection.
- Do not delete historical Git assets or alter Wayfarer themes merely because the Kingdoms faction system was retired.

## 0. Map authoring scale — 10 m playable square (2026-10-31)
- The current single map's authoritative Blender `Playable_Area` is **10 × 10 Blender metres**. This replaces the earlier 256 × 256 m art-space assumption; do not automatically resize the authored terrain or forest.
- The gameplay design target remains a **1,000 × 1,000 gameplay-metre** kingdom. For this map, **1 Blender metre = 100 gameplay metres** and **1 gameplay metre = 0.01 Blender metres**. This is a game-world conversion convention, not a claim that Blender geometry is physically life-sized.
- All newly authored scenery, buildings, units, camera distances, collision footprints, navigation, and building-placement grids must use a consistent documented conversion. At a proposed 4 gameplay-metre grid interval, one cell spans **0.04 Blender metres** and the square has **250 × 250 logical cells**. This is a proposed grid, not yet implemented gameplay.
- Preserve the `Playable_Area` object as the buildable-boundary marker; forests and mountains are decorative perimeter scenery outside it. Keep asset proportions visually readable at game camera distances rather than blindly shrinking already-authored models.
- Do not assume the current Three.js viewer implements this scale. Before adding placement or unit movement, verify GLB export transforms and bounds, the playable mesh's actual dimensions, camera controls, and picking in the loaded game, then implement conversion explicitly.

## 1. Product direction and ownership
- The game is named **Kingdoms of the Unknown**.
- The game is intended to become independently deployable. Its architecture must not make Wayfarer a runtime requirement.
- Keep game-specific code and assets inside a clearly bounded game directory, now `kingdoms-of-the-unknown/gamecode/` for the in-app prototype. Game-specific styles belong in the game stylesheet, not global Wayfarer styles unless explicitly shared by contract.
- The Character tab may own a launch button and the smallest possible lazy-load trigger. It must not own game mechanics, screens, saves, or lifecycle logic.
- Do not claim the existing prototype is already fully standalone until it has a separate entry point and has been tested without Wayfarer loaded.

## 2. Standalone-first architecture
- The game must have its own entry point, initialization, lifecycle, UI/screens, game systems, asset references, settings, save/load boundary, and game version.
- Game modules must not require Wayfarer's authentication, Supabase client/schema, account state, selected-tab state, local-save format, or global render functions to launch and play.
- Do not reach into Wayfarer globals or DOM outside the documented integration contract. Do not mutate Wayfarer state directly from game code.
- Shared libraries may be used only when they are documented, stable, and do not make Wayfarer a runtime dependency. Keep integration adapters separate from core game logic.
- Keep game CSS scoped to the game root/overlay to prevent styles leaking into Wayfarer. Ensure event listeners are cleaned up when the game closes and repeated open/close cycles do not duplicate listeners or audio.
- A future standalone deployment must be able to load the game entry point and its assets without loading `index.html` or Wayfarer modules.

## 3. Wayfarer launcher and return behavior
- The agreed Wayfarer entry is a red **Play** button beneath the Character portrait.
- The game opens in its own overlay/stage. Game-specific navigation remains inside the game.
- The game menu includes **Return to Main Menu**. In the Wayfarer-hosted mode this closes the game overlay and returns focus to the Character launcher without changing authentication, character progress, or the selected Wayfarer tab.
- On small portrait screens, show a clear rotate-device prompt and gate the intended play stage until landscape is detected. Do not rely exclusively on the Screen Orientation API's lock capability.
- Handle viewport resizing and orientation changes. Avoid trapping the user in an overlay if game initialization fails.

## 4. Optional Wayfarer skill integration
- Integration with Wayfarer skills is optional and disabled by default.
- With integration disabled, all Wayfarer-derived bonuses are exactly zero and game mechanics must remain fully playable.
- When enabled, consume a validated, read-only snapshot through a documented adapter. Never read arbitrary Wayfarer globals throughout game logic.
- Missing, stale, malformed, or unknown skill data must fall back safely to zero bonuses and must not prevent the game from launching or loading saves.
- Any bonuses must be small, capped, documented, deterministic, and tested at boundary values. Define the exact mapping and caps before implementing them; do not invent or silently change balance values.
- Game progress must not award or modify Wayfarer XP, quests, coins, equipment, account settings, or cloud saves unless a future explicit feature specification authorizes a separately tested write-back contract.
- The game must not bypass Wayfarer's authentication or authorization boundaries.

## 5. Game save model and versioning
- Game saves are owned by the game and must be independent from Wayfarer's account save schema.
- Define a versioned save schema with validation, safe defaults, and explicit migration functions before persistent progression is introduced.
- Saving must not overwrite a valid save with malformed or partial state. Keep recoverable previous state when writing a new save where the platform allows it.
- Handle unavailable storage, corrupted saves, unsupported schema versions, and failed writes gracefully with clear user feedback.
- Keep game release version and save-schema version distinct from Wayfarer's release version.
- Any future account linking or cloud synchronization is a separate feature requiring explicit design, security review, and tests; do not assume Wayfarer's Supabase tables are suitable for game saves.

## 6. Input, accessibility, assets, and performance
- Define supported keyboard, mouse, and touch interactions for each implemented screen. Controls must be visible, understandable, and usable at supported viewport sizes.
- Scope responsive layout and orientation behavior to the game. Do not break the Wayfarer layout when opening or closing the game.
- Use optimized image/audio assets and correct relative paths. Add every required offline asset to the service-worker precache for hosted mode; standalone packaging must include all assets it needs.
- Handle missing or failed assets without a permanent blank screen. Do not start duplicate audio or animation loops on repeated initialization.
- Respect reduced-motion/accessibility needs where applicable and ensure text/control contrast over fantasy backgrounds.

## 7. Error handling and lifecycle
- Game startup, shutdown, pause/resume, overlay close, and return-to-Wayfarer actions must be idempotent where repeated calls are possible.
- Initialization failures must clean up partially created DOM, listeners, timers, and audio, and return the user to a usable Wayfarer screen.
- Do not swallow exceptions silently. Provide useful diagnostics without exposing secrets or sensitive account data.
- Do not allow game errors to prevent Wayfarer authentication, navigation, saving, or other tabs from working.

## 8. Testing requirements
For every game change, run relevant tests and report PASS, FAIL, or INCONCLUSIVE:
1. Syntax and module-load checks.
2. Standalone entry-point launch without Wayfarer globals, once the standalone entry exists.
3. Wayfarer Character launch and repeated open/close cycles.
4. Return to Main Menu and restoration of the Character screen/focus.
5. Portrait prompt, landscape play stage, and resize/orientation changes.
6. Save/load, corrupted/unavailable storage, and migration cases when saves exist.
7. Skill integration disabled, enabled with valid data, and enabled with missing/invalid data.
8. Asset paths, service-worker precache, and graceful asset failure.
9. Regression checks for authentication, character progress, selected tab, persistence, and Sandbox isolation.
10. Keyboard/mouse/touch behavior at supported viewport sizes.

Static checks do not prove browser behavior. Mark any untested browser, mobile, storage, or integration behavior INCONCLUSIVE.

## 9. Change and release discipline
- Read the current `update rules`, `theme creation rules.md` when relevant, and this file before changing project files.
- Inspect current game files and callers before editing. Keep changes focused and reversible.
- Record each release in the top of `CHANGELOG.md`; align applicable version metadata and verify the complete ZIP.
- Do not claim the game is standalone, save-safe, mobile-verified, or integrated with skills until those properties have been actually tested.
- Preserve existing Wayfarer features and do not use game development as justification for unrelated core rewrites.

## v3.0.57 Military Camp and ground alignment
- Military Camp uses a 45 by 30 metre placement footprint.
- Building dirt tiles are flattened and aligned close to Playable_Area; do not enable shadow casting or receiving on these tiles. Building visuals retain shadows.

## v3.0.58 Dirt terrain shadows
- Building dirt tiles must receive building shadows, but must not cast shadows. Keep tiles nearly flush with Playable_Area; building visual meshes cast shadows.

## v3.0.59 Dirt tile texture continuity
- Adjust UVs of partial BuildingsTerrain edge tiles in separate cloned geometry to preserve texture density; never mutate the shared imported GLB geometry. Preserve flush positioning and shadow reception without tile shadow casting.

## v3.0.60 Building model filenames and entrances
- Load Townhalllvl1.glb, Militarybarrackslvl1.glb and Militarycamplvl1.glb from the level one building models directory.
- Updated models are intended to include invisible entrance markers for future road generation. Do not treat markers as visible building geometry or include them in placement footprint calculations; verify marker names, transforms and dimensions before implementing roads.

## Automatic entrance roads (v3.0.62)
- Use Blender-exported Entrance or Entrence marker nodes to find building road access points; do not display marker meshes. Roads link Town Hall to present buildings and re-route around occupied plots when buildings are moved, rotated, built, or sold. Keep roads visual-only, no resource cost or save format changes.
- Cache invalidation is mandatory: update root sw.js CACHE identifier with every game release and version the standalone module entry URLs. Verify actual browser rendering before asserting that roads or entrance marker dimensions are correct.

## v3.0.63 building terrain and collision
- Dirt underlays must cover each building's entire reserved gameplay plot, including Barracks and Military Camp. Keep dirt flat, shadow-receiving, and tiled at consistent texture density.
- Building-to-building collision checks use scaled visible model dimensions (including 90-degree rotations) rather than the oversized reserved plot, so players can place buildings closer without visual mesh overlap. Keep grid placement and map-edge limits based on reserved dimensions.

## v3.0.64 road geometry
- Flat road planes must rotate around world vertical Y after being laid in the XZ ground plane; avoid Euler order causing raised/diagonal panels. Connect each road path to the actual exported doorway marker at both ends. Validate in browser before declaring visually verified.

## v3.0.67 dirt fitting
- Building dirt extents can be independently adjusted in terrain.js using grid-cell margins. Keep Town Hall dirt tighter and enlarge Barracks and Military Camp coverage; do not change building models, saved placements, collision, or road geometry for cosmetic dirt corrections.

## v3.0.68 authored building ground
- Do not load the deleted TerrainTiles/BuildingsTerrain.glb. Building ground comes from Plane meshes embedded in each building GLB. Preserve their transforms and textures, keep them shadow-receiving and non-shadow-casting, and avoid adding old procedural dirt tiles. Do not conflate ground planes with building collision or entrance markers.

## v3.0.69 ground shadows and road borders
- Authored building Plane or BuildingGround meshes receive shadows but do not cast them; do not override this with a blanket visual castShadow=true. UV-mapped ground planes may use feathered alpha edges to blend into the terrain. Preserve their source material texture and building transform.
- Road edge stones must follow the curved road UVs at the left and right edges, not form straight world-space segments. This release uses generated stone edging pending a verified uploaded road image.

## v3.0.70 UV edge-blend regression
- Never use fract(repeating texture UVs) as a building ground silhouette/alpha mask: it creates transparent internal grid seams. Ground material textures must remain unmodified until a geometry-boundary-based edge mask is implemented and visually validated. Ground receives shadows and does not cast them.

## v3.0.71 title artwork organization
- Keep Kingdoms title/login artwork inside kingdoms-of-the-unknown/images/titlecreens. When moving an image, update CSS and service-worker precache references in the same commit, and bump cache version. Preserve existing login behavior; the separate Lanterns image is reserved for loading-screen integration.

## v3.0.72 road placement and cinematic loading
- Roads draw above imported ground Plane meshes with a small depth bias and below building meshes/steps; preserve depth testing, building shadows, and entrance marker positions. Taper road width at both ends toward each entrance's authored or fallback opening width. Never change gameplay collision footprints or saved placements to adjust visual road widths.
- Display Lanterns Beneath the Ominous Castle.png only while the standalone map is loading, keeping the separate login title image intact. Update service-worker cache and versioned standalone assets together.

## v3.0.73 CSS image relocation check
- When relocating a title-screen image, search the entire CSS file for repeated later background-image overrides and update every reference, not just the first shorthand declaration. Keep the login and loading images separate.

## v3.0.74 read-only Visual QA
- Authorized Debug users can select local camera presets and download PNG screenshots from WebGL-enabled browsers. Do not mutate saved placements, resources, authentication or Sandbox state. Do not claim this enables WebGL in cloud browsers. Clean up QA callbacks on world exit.
