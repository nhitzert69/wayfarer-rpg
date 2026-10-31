# Wayfarer v3.0.40 — finer Town Hall placement and camera controls (2026-10-31)

- Town Hall placement grid increased to 250 × 250 divisions (4 gameplay metres per cell) with matching snapping and rotated footprint bounds.
- Added a 90° Rotate button in movement mode, toggling southeast/southwest; confirm saves position and rotation, cancel restores both. Existing position-only saves default to original orientation; account and Sandbox storage remain isolated.
- Increased initial zoom to 5× while retaining maximum 20× and Blender-authored minimum 1×; tuned panning to gradually slow with zoom without the excessive slowdown of the earlier implementation.
- Enlarged Town Hall touch-selection target without changing model size or geometry. Terrain texture not modified.
- Validation: source updated in GitHub; live gameplay, mobile gestures, orientation appearance and deployed cache still require browser verification.

# Wayfarer v3.0.39 — realistic Town Hall and closer camera (2026-10-31)

- Reduced Level 1 Human Town Hall maximum footprint from 8.5% to 3% of the playable area width (30 × 30 game-world metres maximum), preserving its aspect ratio and saved position.
- Set initial camera zoom to 2.5×, increased zoom-in limit to 20×, and preserved the Blender-authored 1× maximum zoom-out.
- Compensated pointer pan sensitivity for zoom level so zooming in no longer reduces the camera's world movement per screen pixel as sharply.
- Placement grid, drag-only movement, cancel/confirm, account isolation, GLB/FBX support remain unchanged.
- Validation: GitHub source edit succeeded; visual gameplay on mobile not yet verified.

# Wayfarer v3.0.38 — full placement snap grid (2026-10-31)

- Display all 50 grid divisions in Move mode, matching the existing 50-division snapping interval rather than showing every other line.
- Keep green overlay, Town Hall drag-only movement, camera controls, rotation, scale, confirm/cancel and saved positions unchanged.
- Validation: GitHub source edit complete; live browser visual check pending.

# Wayfarer v3.0.37 — Town Hall placement controls (2026-10-31)

- Rotated the Human Level 1 Town Hall 180 degrees and halved its previous footprint scale (17% to 8.5% of the playable square).
- Increased camera zoom-in limit from 5.25× to 10× without changing maximum zoom-out.
- Made the placement grid more visible with a bright 25-division grid and translucent green playable-area overlay; placement continues snapping to 50 divisions.
- Removed tap-to-teleport placement. Only dragging the Town Hall moves it; ground drag, wheel zoom and pinch zoom are available in movement mode. Confirm/cancel and per-account Sandbox isolation retained.
- Validation: GitHub source edits only; live browser and touch-device behavior INCONCLUSIVE pending user test.

# Wayfarer v3.0.36 — Level 1 Town Hall placement (2026-10-31)

- Load `human-townhall.fbx` at the centre of `Playable_Area`, size it relative to the authored 10 m square, and expose selection → Move → drag/tap grid → green confirm / red cancel.
- Show a 50×50 placement grid only during Move mode; snap placement within playable-area bounds with the building footprint accounted for.
- Confirm saves Town Hall position in per-account local storage (separate live and Sandbox keys); cancel restores the original position without saving. No Supabase or Wayfarer save changes.
- Preserve GLB terrain, FBX support, Blender camera and camera restrictions. Source-level inspection completed; browser appearance, FBX texture loading and gameplay interactions remain INCONCLUSIVE pending live testing.

# Wayfarer v3.0.35 — preserve Blender camera framing (2026-10-31)

- Backup branch `backup-pre-camera-framing-2026-10-31` created from `039ddc617adfb3fb5eaa043de0b31be2f9cdf2ad` before editing.
- Preserve authored camera position, orientation and perspective. Crop wider browser aspect ratios to the Blender 16:9 reference rather than revealing outside the mountain border; retain zoom-in and ground-footprint panning limits.
- GLB terrain and FBX asset loader remain supported. No saved data or account changes.
- Validation: source inspection and GitHub commit PASS; live browser/mobile framing INCONCLUSIVE pending user test.

# Wayfarer v3.0.34 — GLB terrain and authored camera (2026-10-31)

- Switched Kingdoms terrain loader from FBXLoader to GLTFLoader, loading the user-uploaded `models/terrain/Playmap/terrain_kingdoms.glb` with supported embedded materials/textures.
- Use the camera embedded in the GLB, preserving its exported world transform, orientation, projection, and maximum zoom-out framing. Retain bounded panning, zoom-in and error reporting for missing cameras.
- Updated game rules to name the authoritative GLB asset. Existing FBX is not required; no account, save, theme or game economy changes.
- Validation: repository source review; live browser rendering, GLB camera presence, and material fidelity INCONCLUSIVE pending game launch.

# Wayfarer v3.0.33 — Kingdoms terrain camera visibility hotfix (2026-10-31)

- Aim the exported Blender camera toward the named Playable_Area rather than relying on FBX camera forward-axis conversion.
- Preserve exported camera position and lens, maximum zoom-out, zoom-in, and bounded panning; derive ground level from playable surface instead of mountain bounds.
- No asset, account, save or Wayfarer theme changes. Live browser/FBX verification remains INCONCLUSIVE.

# Wayfarer v3.0.32 — Single Kingdoms map and Blender camera framing (2026-10-31)

- Removed the obsolete three-map selector and per-account map preferences; Kingdoms now loads only `models/terrain/Playmap/terrain_kingdoms.fbx`.
- The viewer uses an exported Blender camera as its initial/widest view and limits zoom-out to that framing. Closer views may pan within the original ground footprint; missing FBX camera reports an actionable loading error.
- Updated game rules and release metadata. Existing accounts, resources, Sandbox, Town Hall assets, and Wayfarer themes remain unchanged. No historical assets deleted.
- Validation: source-level references inspected. Browser rendering and presence of camera inside the uploaded binary FBX are **INCONCLUSIVE** until tested; if the camera was not included in FBX export, re-export it.

# Wayfarer v3.0.31 — Kingdoms 10-metre playable-area authoring rule (2026-10-31)

- Documented the new Greek map authoring reference: a 10 × 10 Blender-metre `Playable_Area` representing a logical 1 × 1 km kingdom, with explicit 1:100 model-to-gameplay metre conversion.
- Clarified consistent future scaling for buildings, units, scenery, placement grids and camera bounds; forest and mountains remain outside the buildable area. No game logic, meshes, saved data or gameplay camera changed.
- Validation: documentation and version/cache metadata updated in repository; live FBX dimensions, browser rendering and placement behavior not tested.

# Wayfarer v3.0.30 — Rectangular replacement arenas (2026-10-30)

- Renamed all 3 replacement arena FBX files and 12 associated PNG textures to concise faction-specific names without altering binary contents or reducing quality.
- Updated the standalone Kingdoms viewer to load the new integrated arena models; removed obsolete separate floor loading and 180° floor rotation.
- Replaced oval camera target limits with independent rectangular X/Z clamps derived from model bounds and current zoom/viewport footprint. Preserved camera angle, zoom controls, input handling, and Wayfarer account data.
- Validation: repository asset paths and source substitutions inspected; no live browser, mobile, or model-render verification performed. Binary model compression not performed because safe FBX recompression is unavailable through the GitHub connector.

# Wayfarer v3.0.29 — Rotate stylized floors 180 degrees (2026-10-30)

- Rotated all three new stylized floor models 180° about the vertical Y axis around their existing exported origins. Original mountain terrain orientation, positions, scales, textures, camera, and saves are unchanged.
- This is a reversible orientation experiment; exact alignment and ground overlap require visual testing on all three maps.

# Wayfarer v3.0.28 — Stylized world-map floors (2026-10-30)

- Added the Human Ashen, Greek Mediterranean, and Undead Mire FBX floors and their color, normal, and roughness textures to the world-map renderer without altering their artist-exported transforms.
- Preserved original terrain and camera behavior; prioritized floor drawing with polygon offset and added floor-aware map picking. Original terrain floor geometry is still present; visual overlap must be checked in-browser.
- Created backup `backup-pre-worldmap-floors-2026-10-30` before updating main. No live visual test claimed.

# Wayfarer v3.0.27 — Organize Kingdoms model assets (2026-10-30)

- Confirmed all three stylized floors and their textures were uploaded to GitHub; renamed them `ashen-floor`, `mediterranean-floor`, and `undead-mire-floor` with matching PBR suffixes.
- Renamed all three terrain and Town Hall FBX/texture sets, plus Town Hall concept images, using concise descriptive filenames; standardized `models/terrain/` and `models/townhall/` subdirectories. All binary files preserved byte-for-byte without recompression.
- Repaired the terrain viewer's asset paths following the user's folder move. New floors are staged as assets only, not yet rendered over the existing terrain to avoid overlapping source floors.

# Wayfarer v3.0.26 — Rename Kingdoms terrain assets (2026-10-30)

- Renamed all 15 existing Meshy-named terrain FBX and texture assets to concise descriptive filenames: `dark-swamp-terrain`, `grassy-meadow-terrain`, and `volcanic-crater-terrain`, retaining original blob bytes.
- Updated the terrain loader's model and texture references. The separate stylized floor files are not included in this commit; their binary upload and game integration remain pending.

# Wayfarer v3.0.25 — Simplify Kingdoms image directory (2026-10-30)

- Moved original faction concept maps and the Town Hall folder from `kingdoms-of-the-unknown/gameassets/images/` to `kingdoms-of-the-unknown/images/`, preserving exact file contents.
- Checked active Kingdoms game scripts, styles, and HTML for references to the old path; none found. Models and textures unchanged. No new backup requested or created.

# Wayfarer v3.0.24 — Kingdoms resources and Build interface (2026-10-30)

- Added a four-resource top-right HUD for Gold, Wood, Stone, and Food, styled after the supplied strategy-game reference and scaled for desktop and landscape mobile.
- Added a prominent gold Build button opening a construction panel. Building placement, costs, and resource generation are intentionally not yet implemented; the panel communicates that status.
- Resource values initialize at zero and read account-specific live or Sandbox resource storage separately. No Wayfarer resources, Supabase data, or existing game saves are changed.
- Preserved terrain navigation, Debug account gating, starfield, login and orientation handling.
- Updated cache namespace and release notes. Source-level changes committed directly to main; no new backup requested or created. Live browser rendering not verified.

# Wayfarer v3.0.23 — Starry world backdrop and Kingdoms Debug Sandbox (2026-10-30)

- Created and verified backup branch `backup-pre-v3-0-23-2026-10-30` from pre-update main; previous backups untouched.
- Replaced the grey terrain backdrop with a deterministic procedural starry night sky on all three maps; existing models, camera controls and oval panning limits remain unchanged.
- Added a Debug entry inside the Kingdoms world menu for authenticated Admin and CHATGPT username/PIN identities only, checked against authenticated email rather than editable profile metadata.
- Added Sandbox mode and visible test-mode badge. Per-account Sandbox map preferences are stored separately from live map preferences; switching modes restores each mode's selected map.
- Kingdoms currently has no saved progression or gameplay mutations beyond map preference; future gameplay Debug tools must explicitly use isolated Sandbox state. Client-side menu gating is not server-side authorization.
- Updated service-worker cache and Debug version references. Source-level implementation; not verified in a live browser.

# Wayfarer v3.0.22 — Full-screen title, map loading overlay, tighter boundaries (2026-10-30)

- Changed Kingdoms title artwork to fill the entire screen on desktop and landscape mobile without black letterbox bars; nonmatching aspect ratios stretch slightly.
- Added a centered animated loading overlay while terrain models and textures initialize, with safe handling of overlapping map loads and navigation away during loading.
- Removed the bottom movement/zoom instruction banner; the game menu remains.
- Tightened the existing zoom-aware oval camera boundary from 47% to 44% of the model dimensions per axis to reduce glimpses outside the mountain perimeter.
- Updated changelog, Debug version and service-worker cache namespace. No backup requested or created; prior backups untouched.
- Code changes committed; physical-device appearance and map-edge limits require live verification.

# Wayfarer v3.0.21 — Organize Kingdoms concept art (2026-10-30)

- Relocated the three existing original faction map concept PNGs to `kingdoms-of-the-unknown/gameassets/images/maps/` without altering image contents.
- Created `kingdoms-of-the-unknown/gameassets/images/townhall/` with an explanatory README. The new Town Hall concept sheet is pending upload because the GitHub connector cannot directly ingest the generated local binary image.
- No terrain models, textures, or game logic changed. No backup requested or created.

# Wayfarer v3.0.20 — Oval terrain camera boundaries (2026-10-30)

- Replaced rectangular X/Z target clamping with an elliptical clamp approximating the mountain-ring perimeter, preventing diagonal corner excursions into the outside background.
- Ellipse radii shrink with the orthographic camera's zoom-dependent visible footprint, retaining zoom-aware access toward all four sides; very wide views recenter when the footprint exceeds a safe radius.
- No changes to model assets, login, zoom values, navigation menu or touch controls. No new backup requested or created; existing backup branches untouched.
- Source-level verification only; the actual irregular terrain silhouette and camera tilt can require further calibration on devices.

# Wayfarer v3.0.19 — Zoom-aware map exploration and compact game menu (2026-10-30)

- Created and verified explicit pre-update backup branch backup-pre-v3-0-18-2026-10-30 from main; no subsequent edits to that branch.
- Replaced fixed 8% X/Z camera target clamps with zoom- and viewport-dependent orthographic visible-footprint bounds, allowing deeper panning toward the terrain perimeter as zoom increases.
- Combined in-world Main menu and faction selection into an expandable ☰ Menu; closes on selection, outside click, Escape, and main-menu navigation.
- Set title artwork to contain in landscape to preserve the full illustrated composition, accepting letterboxing rather than cropping.
- Updated cache and Debug version references; game auth, saves, and models unchanged.
- Static code review only; physical phone/desktop panning and model-edge containment require live testing.

# Wayfarer v3.0.18 — Axis-aligned terrain camera (2026-10-30)

- Removed the added 10-degree Y-axis model rotation; original exported model axes are preserved.
- Changed orthographic camera direction to (0, 0.85, 1) so X is screen horizontal and Z screen vertical while retaining elevation angle.
- Aligned drag-to-pan with screen X/Z axes; model files, zoom limits, auth and saves unchanged.
- Updated game rules to require exported axis alignment. No backup created. Live visual testing remains pending.

# Wayfarer v3.0.17 — Replacement arenas and landscape viewport (2026-10-30)

- Updated Human arena to Dark Swamp Terrain, Greek arena to Grassy Meadow Terrain, and Undead arena to Volcanic Crater Terrain, using existing uploaded FBX files and matching color, normal, and roughness texture names.
- Set standalone viewport-fit=cover and explicit full-viewport positioning for the title and terrain stage to improve iPhone landscape use, including display safe areas. Landscape title art uses cover; portrait rotation gate remains.
- Corrected the service-worker standalone JS/CSS matching expression so the intended network-first refresh policy actually applies.
- Preserved existing authentication, touch pinch controls, model rotation, and zoom values. No backup created.
- Source/path checks only. Physical iPhone landscape fit, desktop framing and three-model rendering remain unverified.

# Wayfarer v3.0.16 — Mobile Kingdoms usability and game-code cache refresh (2026-10-30)

- Restored the standalone Kingdoms portrait orientation gate with a rotate-phone message and return link; it works independently of the former Wayfarer overlay.
- Changed the title artwork from cover to contain to prevent cropping on narrow screens, and adjusted landscape mobile controls.
- Added two-finger pinch zoom to the terrain viewer; existing mouse-wheel zoom, click-to-center, and drag-to-pan retained.
- Switched standalone game JavaScript/CSS to network-first service-worker fetching to reduce stale code discrepancies across devices.
- Preserved Supabase login, session storage, model assets, rotation and zoom limits. No backup created.
- Source-level checks only; physical iOS pinch, orientation, and browser cache behavior require live verification.

# Wayfarer v3.0.15 — Fine-tune arena rotation and zoom-out (2026-10-30)

- Replaced the 180° terrain rotation with a small 10° Y-axis adjustment for all three faction arenas, retaining original entrance orientation more closely.
- Lowered the minimum orthographic zoom from 1.4 to 1.1 (approximately 21% lower zoom value), allowing a modestly wider zoom-out. Maximum zoom-in and initial zoom unchanged.
- No authentication, saves, textures, or model assets changed. No backup created, as requested.
- Static source changes checked; live browser verification of entrances, pan limits, and mountain edges remains pending.

# Wayfarer v3.0.14 — Arena orientation, zoom-out and main-branch rules (2026-10-30)

- Rotated all three standalone arena models 180° around their vertical axis to bring their shared entrance side toward the bottom of the camera view. Precise entrance centering remains to be visually verified on each map.
- Increased the minimum terrain zoom from 0.9 to 1.4 to reduce exposed background beyond the mountains. Edge containment across viewport sizes and pan positions requires live testing.
- Updated mandatory update and game rules: future authorized changes go directly to main; backup branches are created or refreshed only on explicit request. Existing backup branches remain unchanged.
- Updated service-worker cache and Debug version references to v3.0.14. Static text checks performed; live browser rendering, navigation, and Supabase behavior unverified.

# Wayfarer v3.0.13 — New Kingdoms terrain assets and angled camera (2026-10-30)

- Updated all three faction arena FBX paths to their new Meshy 20261030 filenames in the existing terrain folders.
- Load matching base-color, normal and roughness texture maps using MeshStandardMaterial, with fallback to imported materials if base-color loading fails.
- Adjusted orthographic camera direction to a more slanted viewpoint; retained zoom controls, terrain 1× scale, and standalone navigation.
- Development branch only. Browser rendering and camera bounds still need testing.

# Wayfarer v3.0.10 — Kingdoms standalone refresh navigation (2026-10-30)

- Character Play now navigates directly to the standalone Kingdoms entry point rather than launching an iframe overlay. Refreshing the browser therefore reloads Kingdoms instead of Wayfarer.
- The game's existing Return to Wayfarer control navigates back to the Wayfarer root when opened standalone. Game authentication remains separate from Wayfarer authentication; no save or Supabase schema changes.
- Development branch only. Browser refresh, sign-in, return navigation, and cache behavior still require live testing.

# Wayfarer v3.0.9 — Original terrain scale restored (2026-10-30)

- Removed the 2× runtime scaling from all three terrain models, restoring their original FBX sizes.
- Retained existing zoom limits and starting zoom; no model assets changed.
- Updated on development branch only. Browser validation pending.

# Wayfarer v3.0.8 — Kingdoms camera zoom-out adjustment (2026-10-30)

- Reduced the minimum orthographic zoom from 4.2 to 1.8, allowing a wider zoom-out view; set initial zoom to 2.2 while retaining maximum zoom-in at 10.5.
- Preserved the 2× scale of all three terrain models and all existing camera movement, texture filtering, account and launcher behavior.
- Updated Debug version and service-worker cache namespace on `update-before-commit` only. Live browser framing and map-edge visibility are INCONCLUSIVE pending user testing.

# Wayfarer v3.0.7 — Kingdoms terrain scaling, closer zoom and texture stability (2026-10-30)

- Uniformly scaled all three imported FBX terrain models 2× in the game viewer, leaving the source files unchanged; bounding boxes and camera framing now use the scaled model.
- Set the previous maximum zoom-in (4.2) as the new minimum zoom, with a closer maximum of 10.5; initial camera zoom starts at the new minimum.
- Enabled logarithmic depth buffering, tightened camera near/far planes, and configured texture mipmapping, linear filtering and anisotropy to reduce visible flickering and shimmering during movement. These changes may not resolve flicker caused by overlapping source mesh surfaces.
- Corrected malformed literal backslash-n tokens in the previous drag-pan handler.
- Updated rules, Debug version and service-worker cache metadata on `update-before-commit` only. Browser WebGL validation remains INCONCLUSIVE; test all three maps, zoom, panning and rendering before promoting to `main`.

# Wayfarer v3.0.6 — Kingdoms terrain camera and duplicate menu correction (2026-10-30)

- Changed the 3D terrain preview from perspective to elevated orthographic strategy framing, using the FBX Y-up convention, centered on the basin and constrained to a conservative central panning area. Limited zoom-out and retained click-to-recenter, drag-to-pan, and wheel zoom.
- Hid the redundant Wayfarer host overlay menu; Kingdoms' own navigation remains visible and its Return to Wayfarer action remains wired to the host overlay.
- Updated cache namespace and Debug version metadata. Changes committed to `update-before-commit` only; `main` and `Latest-backup` untouched.
- Static checks only; live WebGL framing, irregular-map edge containment, touch controls, Wayfarer return and authentication remain INCONCLUSIVE. The viewport may still show some background near irregular terrain edges, which requires in-browser testing and possible terrain-footprint camera bounds.

# Wayfarer v3.0.5 — Kingdoms login and playable terrain preview (2026-10-30)

- Added independent Kingdoms username/PIN login and registration using the existing Supabase Auth project but a separate session-storage key; does not read or write Wayfarer save data. Browser verification and backend account policies remain untested.
- Added a standalone game entry point, Play button after session restoration, FBX terrain viewer for human, Greek and undead models, angled camera, click-to-recenter, drag-to-pan, wheel zoom and model-derived camera-target bounds.
- Wayfarer Character Play still launches the game, now embedded through its standalone entry point. Removed the ENTERING THE UNKNOWN label.
- Documented permanent main/update-before-commit/Latest-backup branch workflow; development branch only, no production merge.
- Viewer uses CDN Three.js and Supabase SDK, and existing Wayfarer-hosted title artwork; fully independent asset packaging and offline operation remain pending. Static source review only; live WebGL, FBX and authentication flows INCONCLUSIVE.

# Wayfarer v3.0.4 — Kingdoms of the Unknown folder separation (2026-10-30)

- Moved the game shell JavaScript and CSS into `kingdoms-of-the-unknown/gamecode/` while keeping the red Character Play launcher in Wayfarer.
- Updated Character lazy-load, game stylesheet, and service-worker precache references; Wayfarer authentication and saved-progress code are unchanged.
- Added a game directory README explaining the standalone boundary and pending asset upload.
- The supplied `gameassets.rar` contains binary terrain models/textures/images that this GitHub text connector cannot upload. These assets are **not yet in GitHub**; the game still references its existing title artwork under Wayfarer assets, so full independent deployment is not yet achieved.
- Static path/version checks required. Live browser and Supabase testing not performed.

# Wayfarer v3.0.3 — QA bug fixes and conservative cleanup (2026-10-30)

- Fixed BUG-001: standalone Short/Day Adventure quests and campaign quests use one shared generation-time reward snapshot for skill and theme bonuses, including locked gold bonuses.
- Fixed BUG-002: Store balance updates from current state whenever the Store catalog renders, including Sandbox grants and purchases.
- Fixed BUG-003: Settings now accurately describes base quest rewards and generation-time bonus locking.
- SUS-001 startup navigation remains unconfirmed and unchanged pending timing-controlled browser reproduction.
- Removed only `assets/images/social-interactions-market.webp`, an unreferenced image with no references found in the application, theme registry, service-worker precache, or project rules/documentation.
- Kept all active scripts, styles, other assets, configuration, login, saved-progress code, and mandatory rules intact. Authentication, cloud persistence and unrelated gameplay logic remain unchanged.
- Aligned Debug report versions, service-worker cache namespace, and update rules. Static source/reference audit performed; live browser and Supabase regression testing not performed.

# Wayfarer v3.0.2 — CHATGPT live testing permissions (2026-10-30)

- Restrict live XP and gold grants to the signed-in CHATGPT test account with confirmation. Admin grants remain Sandbox-only.
- Permit CHATGPT to reset its own live character with two confirmations; Admin cannot reset its live character. Preserve Journal, To Do and Groceries.
- Preserve both accounts’ existing Sandbox grants, resets, and snapshot restoration.
- Update mandatory rules, Debug report version, and service-worker cache. Static validation only; deployed browser and Supabase sync behavior require verification.

# Wayfarer v3.0.1 — Character launcher styling and CHATGPT Debug access (2026-10-30)

- Load the Kingdoms of the Unknown stylesheet with the main page so the Character tab Play button is red from first render; mark the stylesheet to avoid dynamically adding a duplicate when the game starts.
- Extend the existing Debug identity gate to recognize the exact signed-in username `CHATGPT` alongside `Admin`. For this release, CHATGPT receives the same current Debug access; splitting shared and Admin-only permissions remains future work.
- Bump the service-worker cache namespace and embedded Debug report version to v3.0.1 so deployed clients can receive the fix.
- No Supabase schema, credentials, authentication flow, account data, or save format changed. Static validation is required; live browser and account-specific behavior remain unverified until exercised.

# Wayfarer v3.0.0 — Mandatory project rules and release standardization (2026-10-29)

- Established `update rules` as the mandatory master standard for safe baselines/backups, source-of-truth handling, architecture ownership, account/Sandbox protection, test evidence, release bookkeeping, and completion criteria.
- Expanded `theme creation rules.md` with a complete theme lifecycle contract, single-source-of-truth integration expectations, asset/accessibility requirements, transaction and reward safety, and a mandatory verification gate. Preserved the prior theme-specific rules below the new standard.
- Added mandatory `game rules.md` for Kingdoms of the Unknown, covering standalone-first architecture, Wayfarer launcher behavior, optional read-only skill integration, independent versioned saves, lifecycle safety, and required tests.
- Updated embedded Debug report versions and service-worker cache namespace to v3.0.0; added the three mandatory rules files to the service-worker asset list.
- No gameplay, authentication, Supabase schema, account data, or user-save behavior was intentionally changed. No speculative code cleanup was made because this release's verified scope is governance/documentation and release metadata.
- Validation: all JavaScript files pass `node --check`; all 82 service-worker asset entries resolve to files; mandatory rule files are present; service-worker cache and both embedded Debug report versions align with v3.0.0; changelog top entry and required project files verified. ZIP integrity checked after packaging. Live browser behavior, deployed PWA behavior, and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.15 — Kingdoms of the Unknown launcher and Sandbox startup fix (2026-10-29)
- Added a red Play button beneath the Character portrait. The Character module lazily loads the game from `codes/game/`, keeping game logic separate from the tab.
- Added the Kingdoms of the Unknown title/loading overlay using the approved fantasy title artwork, a top-left menu, and a Return to Main Menu action that closes the overlay and restores focus to the Character launcher.
- Added a mobile portrait-orientation fallback: the game stage is gated by a rotate-phone prompt until the viewport is landscape. The app does not rely on browser orientation-lock support.
- Hardened Sandbox startup with safe rollback and visible diagnostics if initialization fails, and bind Debug controls as soon as the Debug module loads instead of waiting for a later tab activation.
- Updated the mandatory update rules, Debug report versions, and service-worker cache namespace/precache assets to v2.3.15.
- Validation: JavaScript syntax, game launcher/overlay and orientation-gate static checks, Sandbox startup rollback/handler binding checks, precache existence, version consistency, and ZIP integrity. Live browser interactions, Sandbox behavior in the deployed app, and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.14 — Store structural completion (2026-10-29)

- Completed the Store feature-ownership audit: catalog rendering, category selection, theme purchase/upgrade handling, and purchase validation live in `codes/tabs/store.js`; the core retains authentication, shared account state, Sandbox save isolation, persistence, and global render coordination.
- Replaced per-render purchase-button listeners with one idempotent delegated listener on the stable Store catalog root. The listener resolves purchase requests against the current catalog snapshot, avoiding listener accumulation and stale button/item references after rerenders.
- Normalized Store ownership and transaction ID comparisons to strings, preserving special-unlock exclusions, skill requirements, coin checks, upgrade sequencing, Debug fault injection, and Sandbox Unlock All behavior.
- Updated the mandatory update rules, embedded Debug report versions, and service-worker cache namespace to v2.3.14.
- Validation: JavaScript syntax, static Store ownership/event-delegation checks, transaction smoke tests, module presence, precache paths, version consistency, and ZIP integrity. Real browser purchase interactions and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.13 — Character module boundary audit (2026-10-29)

- Removed Character-to-Store rendering coupling; the core refreshes the active tab and Store owns its catalog.
- Added idempotent delegated equipment handlers on stable theme/pet inventory roots.
- Normalized inventory ID comparisons to strings so saved numeric/string IDs behave consistently.
- Character owns character overview, inventory presentation, and theme/pet equipment interactions; shared theme rules and persistence remain in shared services/core.
- Validation: JavaScript syntax, static ownership/listener checks, service-worker precache paths, release metadata, and ZIP integrity. Live browser/Supabase behavior remains unverified.

# Wayfarer v2.3.12 — Quest Board audit and summary reliability (2026-10-29)

- Completed the Quest Board structural audit: generation, adventure quests, campaign planning, reward calculation, completion handling, rendering, and summary counters remain owned by `codes/tabs/quests.js`; the core retains state normalization, persistence, and global render coordination.
- Hardened quest ID generation for both generated and adventure quests: prefer `crypto.randomUUID`, fall back to `crypto.getRandomValues`, and use a last-resort collision-resistant ID when either secure API is unavailable or throws.
- The Quest Board summary hook now runs when the module registers, so dashboard counters are populated even before the Quest Board is activated. Core render coordination remains in place for subsequent state updates.
- Updated embedded Debug report versions, mandatory update rules, and the service-worker cache namespace to v2.3.12.
- Validation: JavaScript syntax, quest-ID fallback smoke tests, summary registration/order checks, module ownership checks, all precache paths, release metadata, and ZIP integrity. Browser quest completion, counters in a real session, and Supabase behavior remain INCONCLUSIVE until tested live.

# Wayfarer v2.3.11 — Skills event binding and ownership audit (2026-10-29)

- Completed the Skills structural ownership audit: catalog rendering and selection, priority controls, progress cards, and Save selected skills remain in `codes/tabs/skills.js`; catalog/progression/migration rules remain in the shared skill catalog/service; account state, save authority, and global render coordination remain in core.
- Added an idempotent dataset guard to the Save selected skills button so repeated module initialization cannot attach duplicate click handlers. Existing stable-root delegation for catalog choice and priority changes is preserved.
- Updated embedded Debug report versions, update rules, and the service-worker cache namespace to v2.3.11.
- Validation: JavaScript syntax, skill-service progression/migration smoke tests, event-binding ownership/idempotence checks, all precache paths, release metadata, and ZIP integrity. Browser interactions, account persistence, and Supabase behavior remain INCONCLUSIVE.

# Wayfarer v2.3.10 — move Sandbox controls into Debug module (2026-10-29)

- Moved Start Sandbox and Exit Sandbox click handlers from `index.html` into `codes/tabs/debug.js`, so the Debug module owns its lifecycle actions alongside its other controls.
- Used the module's existing idempotent action-binding helper to prevent duplicate click listeners if initialization is repeated.
- Added an explicit Admin gate to both actions. Sandbox state branching and the save override remain in core because they integrate with the shared state and persistence boundary; account restoration and session recovery remain core-owned.
- Updated embedded Debug report versions, this update-rules file, and the service-worker cache namespace to v2.3.10.
- Validation: JavaScript syntax, static handler ownership/gate checks, all precache paths, version consistency, and ZIP integrity. Browser interactions, Sandbox refresh/exit behavior, and Supabase persistence remain INCONCLUSIVE until tested in a live browser.

# Wayfarer v2.3.9 — Settings control ownership audit (2026-10-29)

- Completed the Settings structural audit: the Settings module now owns syncing persisted settings values into their corresponding controls and the visible music-volume label.
- Kept account authentication, account restoration, and cloud persistence in the core; kept soundtrack playback, fading, and audio lifecycle in `codes/theme-music.js`.
- Routed music-control refreshes through the Settings renderer when it is registered, with a safe fallback during early initialization.
- Updated the update rules, embedded Debug report versions, and service-worker cache namespace to v2.3.9.
- Validation: syntax, Settings renderer ownership, audio-service boundary, all precache paths, version consistency, and ZIP integrity. Browser interactions and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.8 — complete Journal module ownership audit (2026-10-29)

- Completed the Journal feature-ownership audit: rendering, summary count, create/edit/delete actions, form reset, and edit navigation remain in `codes/tabs/journal.js`; core retains shared state normalization, save/render coordination, and navigation. Marked Journal structurally complete, with live browser behavior still awaiting regression testing.
- Fixed a module-initialization bug: the stable `journalList` root was declared inside the renderer but referenced outside it when binding delegated actions, which could throw a `ReferenceError` and prevent the module from registering.
- Added dataset guards for Journal form submission and cancel-edit handlers so repeated initialization cannot accumulate listeners.
- Hardened Journal entry ID creation with UUID, secure-random-bytes, and collision-resistant fallback paths, including when secure APIs throw.
- Updated this rules file, the service-worker cache namespace, and embedded Debug report versions to v2.3.8.
- Validation: syntax, module registration and ownership, handler guards, ID fallback smoke tests, all precache paths, version consistency, and ZIP integrity. Browser interactions and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.7 — complete Groceries module ownership audit (2026-10-29)

- Completed the Groceries feature-ownership audit: list rendering, add/check/remove/clear actions, and their event handlers live in `codes/tabs/groceries.js`; `index.html` retains only shared state normalization, save/render coordination, navigation, and tab registration. Groceries is now marked structurally complete, with live runtime behavior still awaiting browser regression testing.
- Made grocery form and clear-button listeners idempotent with dataset guards, matching the stable-root delegated list handlers and protecting against repeated initialization.
- Hardened grocery ID creation: try `crypto.randomUUID`, then `crypto.getRandomValues`, then a timestamp/random fallback if secure APIs are missing or throw.
- Updated this rules file, the service-worker cache namespace, and embedded Debug report versions to v2.3.7.
- Validation: syntax, module ownership, listener guards, ID fallback smoke tests, all precache paths, version consistency, and ZIP integrity. Browser interactions and Supabase persistence remain INCONCLUSIVE.

# Wayfarer v2.3.6 — To Do module audit complete; harden Groceries ID fallback (2026-10-29)

- Completed a focused ownership audit of To Do: rendering, task creation/editing/deletion, completion, form lifecycle, and navigation live in `codes/tabs/todo.js`; the core only supplies shared state/save/render/navigation services and normalizes the account data shape. Marked To Do structurally complete, with live-browser behavior still requiring regression verification.
- Continued the next tab audit with Groceries and made item-ID generation safe when `window.crypto.randomUUID` is unavailable, using the same defensive fallback pattern as To Do. Grocery rendering, form actions, checkbox/removal actions, and list clearing remain in `codes/tabs/groceries.js`.
- Updated the service-worker cache namespace and embedded Debug report versions to v2.3.6.
- Validation: syntax, tab ownership/static checks, precache paths, version alignment, and ZIP integrity. Browser/Supabase behavior remains INCONCLUSIVE.

# Wayfarer v2.3.5 — cross-tab event delegation and Settings rendering (2026-10-29)

- Updated To Do, Groceries, Journal, and Skills to delegate dynamic-row/catalog events from stable containers, preventing per-render listener rebinding and keeping actions tied to current shared state.
- Settings renderer now restores checkbox and range controls as well as ordinary fields, and synchronizes the visible music-volume label.
- Kept state mutation and persistence on the existing core `save()` boundary; no authentication or cloud-sync ownership moved.
- Audited all nine tab entry modules for renderer/module registration; this is a cross-tab reliability pass, not a claim that all remaining core dependencies are eliminated.
- Validation: syntax, module registration, event-delegation guards, service-worker paths, version alignment, and ZIP integrity checked. Live browser/Supabase behavior remains INCONCLUSIVE.

# Wayfarer v2.3.4 — extract shared skill catalog and legacy skill migration (2026-10-29)

- Moved the authoritative skill catalog out of `index.html` into `codes/skill-catalog.js`, shared by Skills, Debug, and the skill progression service.
- Moved the legacy `Social Confidence` → `Social Interactions` migration into `codes/skill-service.js`; both initial local state and hydrated cloud state use the same migration helper, preserving quest attribution and combining XP rather than discarding it.
- Added the catalog module to the service-worker precache and aligned the cache namespace and embedded Debug report versions to v2.3.4.
- Continued the all-nine-tab modularization effort. Authentication, account restoration, shared account state, save/cloud-sync authority, navigation, and tab registry/loading remain in core intentionally.
- Validation target: JavaScript syntax, catalog availability/order, migration behavior (including repeat invocation), service-worker paths, version consistency, and ZIP integrity. Browser interactions and Supabase persistence remain INCONCLUSIVE unless tested in a live browser.

# Wayfarer v2.3.3 — finish cross-tab navigation and summary ownership fixes (2026-10-29)

- Fixed Journal summary-hook registration order: `renderSummary` is now attached after the callable Journal renderer is created, so core summary coordination can update the journal-entry count instead of losing the hook.
- Updated To Do Edit navigation to use `activateWayfarerTab("todo", true)` rather than directly toggling tab/section classes, preserving the core's remembered-tab and navigation lifecycle behavior.
- Removed a duplicate Skills renderer-registry initialization line found during the all-tabs audit.
- Continued the nine-tab architecture audit; this release is a focused integration fix, not a claim that all tab code is fully separated.
- Updated the service-worker cache namespace and embedded Debug report versions to v2.3.3.
- Validation: JavaScript syntax, summary-hook ownership, To Do navigation API usage, all service-worker precache paths, version consistency, and ZIP integrity. Real browser interactions, Supabase persistence, and full end-to-end regression remain INCONCLUSIVE.

# Wayfarer v2.3.2 — repair Quest Board renderer registration and tighten tab ownership (2026-10-29)

- Fixed a critical Quest Board module initialization error: the summary renderer was assigned to `WayfarerTabRenderers.quests` before that property existed, and the renderer is subsequently a function. The summary hook is now attached to the registered renderer function after its definition, allowing the tab script to initialize and the quest counters to update.
- Removed the unused legacy starter-quest array from `index.html`; generated quest behavior and rendering remain in `codes/tabs/quests.js`.
- Character pet equipment now uses the shared normalized inventory classifier, avoiding a separate case-sensitive pet type/category check.
- Store category clicks now use a single delegated, idempotently registered listener on the stable document root instead of attaching listeners to every category button.
- Bumped the service-worker cache namespace and embedded Debug report versions to v2.3.2.
- Validation: JavaScript syntax and module-registration/summary-hook checks, all service-worker precache paths, version consistency, and ZIP integrity. Real browser interactions, theme equipping, and Supabase persistence remain INCONCLUSIVE because they were not exercised in a live browser.

# Wayfarer v2.3.1 — delegate summary rendering to tab modules (2026-10-29)

- Moved Quest Board summary rendering (daily completion count, lifetime completions, streak, date label, and shift-aware note) from `index.html` into `codes/tabs/quests.js`.
- Moved the Journal entry count update into `codes/tabs/journal.js`. The core `render()` now coordinates these tab-owned summary refresh hooks instead of directly manipulating tab-specific summary elements.
- Updated Journal's Edit action to use the core navigation API, preserving per-account active-tab memory and consistent tab lifecycle behavior.
- Added `codes/inventory-service.js` as a shared source for normalized theme/pet/artifact classification and inventory ownership lookup. Character, Store, Debug, and theme lifecycle code now use the same classification helpers, reducing inconsistent case/category checks across tabs.
- Kept authentication, account hydration, shared state, save/cloud sync, navigation coordination, and audio controls in their intended core/audio boundaries. Settings remains intentionally thin because its non-core controls are owned by the audio module and account/auth controls belong to the core.
- Validation: JavaScript syntax, summary-renderer ownership, navigation hook, precache paths, version/cache consistency, and ZIP integrity checked. Live browser/Supabase behavior remains INCONCLUSIVE unless actually tested.

# Wayfarer v2.3.0 — shared skill service and Admin resource grant fix (2026-10-29)

- Fixed Debug “Grant XP & gold”: available to Admin in Sandbox or live mode. Live grants require explicit confirmation, require an authenticated Admin account, and use the normal core save/cloud-sync path; Sandbox grants remain temporary. The UI labels the target environment clearly and reports the result. Zero-value grants are rejected. Removal, reset and snapshot restore remain Sandbox-only.
- Extracted shared skill progression and normalization helpers into `codes/skill-service.js`: skill-name lookup, selected-skill normalization/priorities, XP thresholds/progress, skill levels, quest-level XP bonuses, and level-band calculation. The core retains ownership of account state and the skill catalog; tabs consume the shared service.
- Moved the Quest Board category-icon mapping into `codes/tabs/quests.js` and removed unused legacy quest helpers from `index.html` after confirming no callers remained. Quest generation and completion remain owned by `codes/tabs/quests.js`.
- Moved Debug-only snapshot creation/restoration helpers, sandbox character tool guard, and quest inspection renderer into `codes/tabs/debug.js`; the core retains Sandbox lifecycle, session recovery, and shared save boundary.
- Added `codes/debug-service.js` for cross-tab Debug fault gates, quest override state, event logging, and save inspection. This removes Debug-only utilities from the core while preserving access during pre-tab Sandbox restoration.
- Updated Debug report version, service-worker cache namespace and precache manifest for the shared skill service.
- Validation: syntax checks, static ownership checks, XP threshold/reward-bonus tests, grant guard/confirmation checks, precache path/version consistency and ZIP integrity. Live browser and Supabase sync behavior remain INCONCLUSIVE until tested in the deployed app.

# Wayfarer v2.2.0 — extract remaining Debug action handlers (2026-10-29)

- Built from the user-confirmed working v2.1.9 release. Moved the remaining Debug action handlers for Sandbox quest cooldown, resource grants/removal, character reset/restore, Time Machine, XP labs, coin grants, disposable test quests, planner runs, save inspection, and event-log clearing into `codes/tabs/debug.js`.
- Added an idempotent Debug action binder so reinitializing the module cannot duplicate click handlers. Core Sandbox lifecycle controls (Start/Exit), account identity, shared state, and persistence authority remain in `index.html` intentionally.
- Kept Settings music controls in the dedicated `codes/theme-music.js` audio system; Settings account/authentication controls remain core-owned. This avoids incorrectly moving shared account or audio responsibilities into the Settings tab.
- Continued the theme ownership audit: the registry/service/music architecture remains in `codes/`, and theme styles remain in the stylesheet layer. No theme equip/purchase rules were changed in this release.
- Updated diagnostic report version and service-worker cache namespace to v2.2.0.
- Validation: JavaScript syntax, handler ownership/uniqueness, Sandbox guard presence, precache paths, version/cache consistency, and ZIP integrity checked. Live browser/Supabase behavior remains INCONCLUSIVE unless actually tested.

# Wayfarer v2.1.8 — finish theme ownership boundaries and move Debug feature handlers (2026-10-29)

- Made theme appearance activation data-driven: active body classes are derived from registered theme metadata rather than a hard-coded class list in the theme service.
- Removed duplicate theme-to-soundtrack mappings for registered themes. `codes/theme-music.js` now uses each registered theme's `debugMusic` metadata and retains only legacy aliases plus a Dungeon fallback.
- Moved the shared theme lifecycle fault-injection gate into `codes/theme-service.js`; `index.html` no longer owns that theme-specific decision.
- Made Debug's Sandbox portrait lock use registered `debugCharacter` metadata instead of a second hard-coded theme-ID-to-filename map.
- Moved Debug theme fault-injection and Sandbox theme/quest-rule switch handlers into `codes/tabs/debug.js` with idempotent listener registration. Core still owns the Sandbox/save isolation boundary and calls Debug's exported reset/apply hooks at lifecycle transitions.
- Preserved the account-specific active-tab and gender persistence fixes, Quest Board consolidation, theme level 1–5 grants, and all registered theme definitions and CSS.
- Updated the diagnostic report version and service-worker cache namespace to v2.1.8.
- Validation: JavaScript syntax, theme metadata references, duplicate soundtrack mapping removal, migrated handler ownership, all service-worker precache paths, release-version consistency, and ZIP integrity checked. Live browser/Supabase checks remain INCONCLUSIVE unless actually run.

# Wayfarer v2.1.7 — extract shared theme implementation (2026-10-29)

- Moved all registered theme item definitions and the independent theme Debug baseline from `index.html` into `codes/theme-registry.js`, including CEO, Fitness/Roman Discipline, Orthodox/Faith, Mozart's Salon, Bloodthirst, and the remaining registered themes. `UNLOCKABLE_ITEMS` and theme perk skill mapping now have a shared module source.
- Added `codes/theme-service.js` for Dungeon state normalization, unlock and fault-injection gates, theme XP/gold perk calculations, equipment validation, and theme appearance application (body class, portrait, equipped icon, and crest). Character rendering now calls the shared service instead of maintaining its own theme-to-art/class/name mapping.
- Theme music now resolves the soundtrack from registered theme metadata first, with the existing audio mapping retained for reserved aliases and fallback. Theme CSS remains in the stylesheet layer.
- Moved Debug Sandbox theme-isolation switch behavior and its event listeners into `codes/tabs/debug.js`; the core invokes the exported refresh hook for Sandbox lifecycle events.
- Continued modularization without moving authentication, account hydration, shared state ownership, Sandbox isolation, or persistence out of `index.html`. Preserved the v2.1.6 gender and selected-tab fixes and Quest Board consolidation.
- Updated Debug report version and service-worker cache namespace to v2.1.7; added both new theme modules to the precache list.
- Validation: JavaScript syntax, registry-reference, appearance/perk smoke tests, service-worker path, version consistency, and ZIP integrity checks. Live browser/Supabase checks remain INCONCLUSIVE unless actually performed.

# Wayfarer v2.1.6 — persistent Admin gender and remembered active tab (2026-10-29)

- Fixed Admin gender persistence by treating `state.profile.gender` as authoritative when valid and using auth metadata only as a fallback for legacy saves. Moved the gender-change click handler into `codes/tabs/debug.js` with idempotent registration; live changes continue through the core save/sync path, while Sandbox changes remain temporary.
- Added account-specific active-tab persistence. The selected tab is restored after login/session hydration and module preload; unauthenticated access still opens Settings, and a remembered Debug tab falls back to Quest Board for non-Admin accounts.
- Consolidated Adventure chooser/generation, campaign/quest generation, quest reward awarding, and quest completion from three standalone scripts into `codes/tabs/quests.js`. The Quest Board module now owns this gameplay flow and its event handlers; shared account state and the core `save()` boundary remain in `index.html`. Removed the duplicate standalone scripts and their precache entries.
- Kept account/session, shared state, navigation, and persistence authority in `index.html`; Debug now owns its gender action. Preserved all nine tabs.
- Updated the service-worker cache namespace and embedded Debug report version to v2.1.6.
- Validation: JavaScript syntax, gender authority/handler ownership, active-tab restore paths, Quest Board exports, service-worker precache paths, version consistency, and ZIP integrity checked. Live browser/Supabase checks remain INCONCLUSIVE because they were not run here.

# Wayfarer v2.1.5 — move Debug diagnostic suites into the Debug module (2026-10-29)

- Moved Theme Integration Tests, Quest System Tests, Store tests, and Equipment Lifecycle Test Suite orchestration from `index.html` into `codes/tabs/debug.js`.
- Moved Store purchase/upgrade transaction decision and state mutation logic into `codes/tabs/store.js`; the core still owns saving, cloud synchronization, shared account state, and Sandbox isolation.
- Kept authentication, account hydration, shared gameplay decision helpers, save/cloud synchronization, and Sandbox isolation authority in the core. The migrated diagnostics use isolated or synthetic inputs and do not save test mutations.
- Debug test controls now register with the Debug module after account-aware module loading; the module initializer remains idempotent through the existing once-only tab loader.
- Updated embedded diagnostic report versions and service-worker cache namespace to v2.1.5.
- Validation: JavaScript syntax, migrated-handler ownership, service-worker precache paths, and ZIP integrity checked. Live browser/Supabase behavior remains INCONCLUSIVE because it was not run here.

# Wayfarer v2.1.4 — remove theme reset and expand tab-module ownership (2026-10-29)

- Removed the Admin “Reset all themes to Store” button and its handler, as requested.
- Moved Debug “Unlock all items” behavior and the theme-level selector event handling from `index.html` into `codes/tabs/debug.js`. The module now owns those interactions; the core retains Sandbox validation, authoritative state, and the shared save/render boundary.
- Moved Store category selection state and panel-switching logic from `index.html` into `codes/tabs/store.js`, keeping category navigation and Store rendering together.
- Preserved the existing nine-tab preload/lifecycle model and did not restructure the remaining modules in this release.
- Updated Debug report version strings, service-worker cache namespace, and the top changelog entry.
- Validation: pending JavaScript syntax, moved-handler uniqueness, removed-control, module/cache path, version consistency, and ZIP integrity checks. Live browser and Supabase checks remain INCONCLUSIVE unless actually performed.

# Wayfarer v2.1.3 — Theme reset and theme-level Debug controls (2026-10-29)

- Rebuilt from the confirmed v2.1.2 baseline; retained the existing tab-module separation without further restructuring.
- Added an Admin-only “Reset all themes to Store” action available both outside and inside Sandbox. It confirms before acting, preserves Dungeon as the owned/equipped fallback, resets only unlockable theme inventory, and leaves artifacts, pets, currency, XP, and unrelated progress unchanged. When Sandbox is active, it affects only the temporary Sandbox state; otherwise it saves to the live account.
- Added a Theme Level selector with levels 1–5 for the existing Sandbox “Unlock all items” control. Granted themes receive the selected theme level and corresponding theme perks; non-theme items are granted without alteration. Changing the level while the override is active reconciles the temporary theme grants.
- Updated Debug report version strings and the service-worker cache namespace to `wayfarer-v2.1.3`.
- Validation: pending static checks for syntax, selector values, theme-only reset filtering, level assignment, version/cache consistency, and ZIP integrity. Live browser and Supabase persistence checks remain INCONCLUSIVE unless performed in the deployed app.

# Wayfarer v2.1.2 — Sandbox save boundary and tab refresh fixes (2026-10-29)

- Fixed the Character renderer dispatch: the renderer registry stores Character as an object, so the old core call attempted to invoke the object as a function and could abort the rest of `render()`. It now calls `renderCharacterOverview()` explicitly, allowing equipped theme art/classes and inventory to refresh immediately.
- Refresh shared skill-progress cards on every core render, not only while the Skills tab is active.
- Routed To Do and Skills writes through the core `save()` boundary instead of writing directly to localStorage/cloud from tab modules. This preserves temporary Sandbox state and normal account persistence rules.
- Added a second guard in `syncCurrentState()` so an active Sandbox cannot enqueue cloud writes even if a future caller bypasses `save()`.
- Updated the service-worker cache namespace to `wayfarer-v2.1.2`.
- Validation: JavaScript syntax, core/module persistence-path checks, cache/version consistency, and ZIP integrity. Live browser testing of login/refresh, theme activation, and live-vs-Sandbox isolation remains INCONCLUSIVE and must be tested in the deployed app.

# Wayfarer v2.1.1 — account-aware tab module preload and Skills refresh fix (2026-10-29)

- Added a central tab-module registry with loading/loaded/failed status, and a one-time loader for all nine tab modules.
- After successful login and after session restoration on refresh, preload every tab module only after account state has been restored; then render the active view and explicitly refresh Skills progress/catalog so selected skills appear without opening the Skills tab.
- Wrapped each tab file in an isolated scope so all modules can safely be loaded together without colliding top-level `const`/`let` declarations. Existing shared account, session, cloud-save, and gameplay state remains in the core.
- Updated release identifiers and service-worker cache namespace.
- Validation: syntax checks, module path/cache checks, and ZIP integrity. Live browser login/refresh, Debug controls, Store transactions, and account persistence remain unverified.

# Wayfarer v2.1.0 — lazy tab functionality extraction (2026-10-29)

- Moved Skills save actions, To Do create/edit/delete actions, Journal create/edit/delete actions, Groceries add/remove/clear actions, Store category interaction, and Character Inventory/equipment click handlers out of `index.html` into their matching lazily loaded tab scripts.
- Changed the core render coordinator to render the active tab only; shared counters, account/session handling, save/sync, and gameplay services remain core-owned.
- Kept the existing nine-tab lazy loader and module caching.
- Updated app/debug version strings and service-worker cache namespace.
- Validation in this package: JavaScript syntax, asset paths, service-worker references, and ZIP integrity. Browser behavior remains INCONCLUSIVE until tested in the deployed app.

# Wayfarer v2.0.9 — quest rendering and Debug tab reliability fixes (2026-10-29)

- Made quest rendering resilient to missing/uninitialized quest arrays and bound completion actions once per quest grid to prevent duplicate listeners.
- Ensure the currently selected tab module is requested after core renders when it has not loaded yet, so quest boards refresh when the module becomes available.
- Made Sandbox start/exit button states explicit in the Debug renderer; kept all other Sandbox-only controls and handlers in the core.
- Static syntax, asset paths, service-worker entries, and ZIP integrity checked. Browser behavior remains unverified.

# Wayfarer v2.0.8 — on-demand tab rendering extraction (2026-10-29)

- Moved the tab-specific render responsibilities for all nine tabs into their matching lazily loaded `codes/tabs/*.js` files: Quest Board, Character, Store, Skills, To Do, Groceries, Journal, Settings, and Debug.
- Added a shared tab-renderer registry so core state remains authoritative while loaded tab views refresh through the existing `render()` path.
- Kept account/session/save logic and existing form/action event handlers in the core for compatibility; this release extracts tab rendering, not every tab-specific event handler.
- Preserved the Admin live/Sandbox gender-change behavior from v2.0.7.
- Static checks only; live browser behavior, authentication refresh, and account persistence require user testing.

# Wayfarer v2.0.7 — lazy tab entry points and Admin gender control (2026-10-29)

- Added nine tab-specific JavaScript entry files and a one-time lazy loader. Each entry file is requested when its tab is selected and reused on later visits; the Quest Board entry is initialized after page load.
- This is a compatibility-first foundation, not the completed extraction of all tab business logic: the interconnected renderers, form handlers, and shared state logic remain in the existing inline application script so their behavior is not silently changed. Further extraction should move bounded logic tab-by-tab after dependency mapping and browser validation.
- Enabled the Admin character-gender control outside Sandbox. Applying a live change now requires confirmation and uses the existing save/sync path; in Sandbox it remains temporary and is discarded on exit. Other destructive/resource Debug tools remain Sandbox-only.
- Updated Debug release identifiers, service-worker cache namespace, and offline precache entries for the tab entry files.
- Validation: JavaScript syntax, module path/cache checks, and ZIP integrity. Browser navigation, login/refresh persistence, lazy-load timing, live gender cloud sync, and full tab behavior have not been browser-verified.

# Wayfarer v2.0.6 — incremental extraction of music, adventures, quest generation, and quest rendering (2026-10-29)

- Rebuilt from the supplied v2.0.3 archive, avoiding the v2.0.4/v2.0.5 feature-tab extractions associated with the refresh-login regression.
- Extracted theme music, adventure chooser/generation, quest-pool/campaign generation, and quest-card/reward completion into four classic scripts under `codes/`.
- Kept Core Account, App Startup, Debug, To-Do, Journal, and Groceries inline. Shared account state, reward calculations, and save paths remain in the original application.
- Updated script loading, offline precache, cache namespace, and release version identifiers.
- Validation: JavaScript syntax and static path/archive checks. Login persistence, browser interactions, quest completion, music playback, and background rendering have not been browser-verified.

# Wayfarer v2.0.3 — Fix Bloodthirst page background (2026-10-29)

- Fixed the default Dungeon-background CSS selector so it explicitly excludes the equipped Bloodthirst theme.
- Kept the existing Bloodthirst background artwork, dark crimson overlay, palette, character art, soundtrack, perks, and theme/equipment logic unchanged.
- Updated the Debug report version and service-worker cache namespace to v2.0.3.
- Validation performed: CSS selector assertions, asset-path checks, JavaScript syntax, version/cache/changelog consistency, and ZIP integrity. Browser rendering, Supabase, and deployment were not tested.

# Wayfarer v2.0.2 — Bloodthirst, theme upgrades, and Sandbox-only Debug mutations (2026-10-29)

- Added the Bloodthirst theme assets, crimson/ember/antique-gold visual identity, character portraits, soundtrack, registry metadata, equipped-theme rendering, and Debug baseline. It is not Store-purchasable; its kill threshold remains unset rather than invented. Sandbox “Unlock all items” can grant it for testing.
- Added five levels to skill themes. Unlock levels are 3, 8, 13, 18, and 23; perks scale from +5 XP/+0 gold through +25 XP/+8 gold; upgrade prices are 100, 200, 300, 400, and 500 coins. Store shows only the next upgrade and hides themes at level 5.
- Locked theme XP and gold rewards when quests are generated; reward completion awards each stored bonus once. Bloodthirst gives +2 XP and +2 gold on every skill quest while equipped.
- Restricted XP/gold grant/removal, character reset/restore, quest-cooldown reset, and character-gender testing to Admin Sandbox. Sandbox saves now remain in temporary session state and do not write Sandbox mutations to the live local/cloud save.
- Preserved the conservative v1.18.4-based structure: CSS remains external, while the interconnected application JavaScript stays inline.
- Static validation performed: JavaScript syntax, reward/upgrade boundary assertions, Debug handler guards, referenced asset checks, release/cache/changelog consistency, and ZIP integrity. Browser, real Supabase, account-isolation, and deployed-app behavior remain unverified.

# Wayfarer v2.0.1 — conservative first-step code separation (2026-10-29)

- Rebuilt from the supplied v1.18.4 archive as the actual source baseline.
- Extracted the ten existing inline CSS blocks into one external stylesheet at `codes/styles.css`, preserving their original order and rule contents. Adjusted asset URLs for the stylesheet's location.
- Kept the interconnected application JavaScript inline and in its original execution order; no gameplay, login, Supabase, save, quest, reward, theme, or Debug logic was intentionally changed.
- Updated the diagnostic release identifiers and service-worker cache namespace to v2.0.1, and added the stylesheet to the service-worker precache list.
- Preserved the existing assets, configuration, `update rules`, `theme creation rules.md`, and prior changelog history.
- Validation performed: original CSS block count and order, stylesheet URL/path checks, JavaScript syntax, service-worker asset existence, release-version consistency, required-file checks, and ZIP integrity. Browser, Supabase, account-isolation, and deployed-app behavior were not live-tested.

# Wayfarer v1.18.4 — Store category tabs and compact item cards (2026-10-28)

- Organized the Store into separate Themes, Artifacts, and Pets tabs with clear active-state and accessible tab/panel semantics.
- Kept all currently registered purchasable themes in the Themes tab. Artifacts and Pets have dedicated empty states because no store items of those types are currently registered; the tabs are ready for future catalog entries.
- Reduced theme card artwork from 92px to 60px (52px on narrow screens), tightened spacing and text sizing, and made purchase buttons more compact to reduce scrolling on mobile.
- Preserved the existing theme purchase, unlock, Sandbox, inventory, and save paths.
- Validation performed: JavaScript syntax, tab/category rendering assertions, version/cache/changelog consistency, required-file checks, and ZIP integrity. Live browser, purchase-flow, Supabase, and GitHub deployment tests were not performed.

# Wayfarer v1.18.3 — Skill-level quest XP scaling (2026-10-28)

- Added cumulative skill-level XP bonuses to newly generated quests: +3 XP for each attained skill level from 2–9, +2 for levels 10–19, and +1 from level 20 onward.
- Applied the bonus only to quests for the matching skill and kept it additive with the base quest reward and eligible theme bonus. The reward and skill level are locked when the quest is generated, so existing quests remain unchanged.
- Displayed the skill-level bonus on generated quests and added isolated Debug checks for the level 1, 2, 9, 10, 19, 20, and 21 boundaries.
- Added permanent requirements for XP scaling, reward locking, and tier-boundary testing.
- Validation performed: JavaScript syntax, XP-curve boundary assertions, quest reward-path assertions, version/changelog/cache alignment, required-file checks, and ZIP integrity. Live browser/Supabase testing and GitHub deployment were not performed.

# Wayfarer v1.18.2 — Protect quest and XP persistence (2026-10-28)

- Kept the local save revision timestamp aligned with the `updated_at` timestamp written to Supabase, so startup does not incorrectly prefer an older cloud save when a newer local quest/XP save failed to sync.
- Waited for queued cloud saves before signing out. If the latest cloud save failed, sign-out is stopped and the account state is retained rather than silently clearing unsynced progress.
- Applied the same revision timestamp handling to the selected-skills save path and updated the service-worker cache namespace and Debug build identifiers.
- Validation performed: targeted persistence-path assertions, JavaScript syntax, asset/rule-file presence, version/changelog/cache consistency, and ZIP integrity. Live Supabase and browser refresh/logout tests were not available in this environment; deployment was not performed.

# Wayfarer v1.18.1 — Replace CEO theme background (2026-10-27)

- Replaced the CEO theme's existing full-screen background with the newly supplied VOC merchant's office and harbor sunset artwork.
- Optimized the new background to WebP and retained the existing `ceo-background.webp` path so theme registration, CSS, Debug expectations, and service-worker asset mapping remain intact.
- Updated Debug/build version identifiers and service-worker cache namespace to v1.18.1.
- Validation performed: background image decoding/dimensions, referenced asset existence, version consistency, JavaScript syntax, and ZIP integrity. Live browser rendering and deployment were not tested.

# Wayfarer v1.18.0 — Replace and compress theme soundtracks (2026-10-27)

- Replaced the Spartan Endurance/Cardio soundtrack with the newly supplied `cardio-theme.mp3` and the Roman Discipline/Fitness soundtrack with the newly supplied `fitness-theme.mp3`, preserving the existing stable asset paths and theme mappings.
- Re-encoded the two replacement tracks and the existing CEO soundtrack to 160 kbps stereo MP3 at 44.1 kHz to reduce download/storage size while retaining the web-friendly MP3 format.
- Added a permanent theme-creation rule requiring all audio assets, including existing tracks brought into a release, to be compressed/optimized with settings appropriate to the source, while preserving intelligible musical quality, duration, looping behavior, and browser compatibility.
- Updated the app's Debug report versions and service-worker cache namespace to v1.18.0. Existing service-worker audio paths remain unchanged.
- Validation performed: audio metadata/duration and size comparison, asset-path/theme-mapping checks, rule/changelog/version consistency, JavaScript syntax, and ZIP integrity. Live browser playback, subjective audio quality, mobile playback, and deployment were not tested.

# Wayfarer v1.17.9 — Correct Test theme perk label (2026-10-27)

- Corrected the Test theme's Inventory/equipment perk label from “Fitness +5 XP/quest” to “Test +5 XP/quest”.
- Kept the actual Test XP reward logic unchanged; this is a display-text correction only. Roman Discipline continues to display its Fitness skill bonus.
- Updated app Debug report versions and the service-worker cache version to v1.17.9.
- Validation performed: targeted label assertions, JavaScript syntax, required rule files, release-version consistency, and ZIP integrity. Live browser behavior and deployment were not tested.

# Wayfarer v1.17.8 — Fix equipped-theme background switching (2026-10-27)

- Fixed the default Dungeon background selector so it no longer overrides CEO, Mozart's Salon, or Spartan Endurance theme backgrounds due to higher CSS selector specificity.
- Added the missing newer theme classes to the mobile background positioning rule so their dedicated backgrounds remain responsive on smaller screens.
- Preserved Roman Discipline's existing dedicated `fitness-background.webp` mapping and its theme palette; no gameplay, login, saved progress, or music behavior changed.
- Updated app/Debug version identifiers and the service-worker cache version to v1.17.8.
- Validation performed: JavaScript syntax, targeted CSS selector/background registration checks, referenced asset existence, changelog/version consistency, and ZIP integrity. Live browser rendering and deployment were not tested.

# Wayfarer v1.17.7 — CEO icon and immediate soundtrack switching (2026-10-27)

- Replaced the CEO theme icon with the supplied transparent-edged artwork, optimized as WebP while preserving transparency.
- Changed theme soundtrack switching to stop and reset the previous track immediately before starting the newly equipped theme's soundtrack, preventing overlapping songs or the previous track fading on behind it.
- Kept music volume at the configured level for the new track rather than fading it in. Existing browser autoplay restrictions still apply; if playback is blocked, the app continues to offer the Play music control.
- Updated app diagnostic versions, service-worker cache version, and release metadata to v1.17.7.
- Validation scope: source syntax, asset references, ZIP integrity, icon transparency, and release-version consistency checked locally. Live browser playback and deployment were not tested.

# Wayfarer v1.17.6 — CEO theme (2026-10-27)

- Added CEO as an unlockable Business theme at Business level 3 for 100 coins, with +5 Business XP on eligible newly generated Business quests while equipped.
- Added an optimized dedicated VOC-inspired background, male/female merchant portraits, theme icon, and navy/antique-gold/ivory/Dutch-red palette.
- Registered CEO across Store, Inventory perk label, theme equipment/class rendering, character artwork, soundtrack crossfade mapping, service-worker assets, and independent Debug theme baseline.
- Added the selected “Sailing Adventures” soundtrack as `assets/sound/ceo-theme.mp3`.
- Preserved previous theme IDs, account/login configuration, saved progress behavior, project rules, and full changelog history.
- Validation performed: JavaScript syntax, static theme registration/baseline/asset checks, image/audio existence, and ZIP integrity. Browser rendering, real purchase/equip flow, mobile playback, Supabase/account isolation, and deployed-app behavior were not live-tested.

# Wayfarer v1.17.5 — Correct Mozart's Salon perk labels and Spartan icon asset (2026-10-27)

- Corrected Mozart's Salon Store perk copy to show +5 Piano XP per eligible newly generated Piano quest while equipped.
- Added the missing Piano +5 XP/quest label to Mozart's Salon in Inventory.
- Preserved the uploaded corrected Spartan Endurance icon, optimized it to WebP, and aligned the registry and service-worker cache path with the actual asset.
- Preserved theme IDs, skill targets, unlock/price rules, artwork, palette, soundtrack, Roman Discipline display rename, account configuration, and previous changelog history.
- Validation performed: JavaScript syntax, targeted perk-label and theme-registry checks, asset reference checks, and ZIP integrity. No live browser, Supabase, or GitHub deployment test was performed.

# Wayfarer v1.17.4 — Mozart's Salon theme and Roman Discipline rename (2026-10-27)

- Added Mozart's Salon as a Piano theme, unlocked at Piano level 3 for 100 coins, with +5 Piano XP on eligible quests generated while equipped.
- Added optimized dedicated background, male/female 18th-century portraits, and theme icon; registered the sapphire/ivory/antique-gold palette, soundtrack, Store/Inventory/equipment, character display, and independent Debug theme baseline.
- Renamed the Fitness theme's display label to Roman Discipline while preserving its stable `fitness-theme` ID, Fitness skill/perk, saved ownership, and progression.
- Updated Debug/build version and service-worker cache; preserved prior changelog history and project rule files.
- Validation performed: JavaScript syntax, theme registry/baseline checks, referenced asset checks, and ZIP integrity. No live browser, Supabase, or GitHub deployment test was performed.

# Wayfarer v1.17.3 — Spartan Endurance theme, rebuilt safely from v1.17.2 (2026-10-27)

- Rebuilt from the known v1.17.2 project baseline after the previous v1.17.3 package introduced a startup-breaking theme declaration edit.
- Added Spartan Endurance as an unlockable Cardio theme: unlock at Cardio level 3 for 100 coins, with +5 Cardio XP on eligible Cardio quests generated while equipped.
- Preserved the existing V0_TEST_THEME_ITEM declaration and inserted Spartan Endurance as a separate registry entry.
- Added optimized WebP background (1672×940), male and female portraits (1024×1536), and theme icon (512×512).
- Registered the theme in Store/Inventory labels, theme visual palette, top-left icon, character portrait selection, Debug baseline metadata, and the existing Cardio soundtrack mapping.
- Added the new image assets to the service-worker cache and synchronized app Debug version, cache version, changelog and ZIP filename.
- Validation performed: JavaScript syntax, theme/registry invariants, literal asset references, required rule files, and ZIP integrity. No live browser, Supabase, GitHub edit, or GitHub Pages deployment is claimed.

# Wayfarer v1.17.2 — Finance category and Business skill (2026-10-27)

- Added a Finance skill category containing the new Business skill, with a description focused on developing and operating a business.
- Added 22 foundational Business quest templates plus dedicated growth, advanced, and master templates covering focused work sessions, research, customers, offers, marketing, planning, operations, and review.
- Updated campaign time estimation to respect explicit minute durations in quest titles/descriptions, so timed Business work sessions fit campaign planning more accurately.
- Included Business in the campaign planner's productive-focus weighting.
- Added Finance to Journal entry types.
- Updated Debug report version identifiers and the service-worker cache to v1.17.2.
- Static validation performed for JavaScript syntax, package integrity, required files, and asset references; no live-browser, Supabase, GitHub edit, or deployment test is claimed.

# Wayfarer v1.17.1 — Stronger update and theme creation rules (2026-10-27)

- Expanded `update rules` with mandatory real-behavior testing, shared gameplay paths, immediate UI refresh checks, Sandbox/normal-account isolation, regression coverage, release validation, and honest reporting of what was actually tested.
- Expanded `theme creation rules.md` with observed lifecycle testing, shared unlock/purchase/equip/reward logic, injector verification, immediate refresh requirements, Sandbox isolation, and theme regression checks.
- Aligned visible Debug report version strings and the service-worker cache with v1.17.1. No unrelated gameplay behavior was intentionally changed.
- Based on the approved v0.test.12 project. Static validation and ZIP integrity are checked for this rules-focused release; no live-browser test or deployment is claimed.

# Wayfarer v0.test.12 — Live theme refresh and persistent Sandbox session (2026-10-27)

- Changed lifecycle fault-injection toggles to refresh the rendered theme, Store, Inventory, character overview, and Debug panel immediately, without requiring a full page reload.
- Added same-tab session persistence for an active Admin Sandbox: refreshing the page restores the temporary Sandbox state and its separate live-state backup after account hydration. Sandbox state remains in `sessionStorage`, never in the normal local/cloud save; explicitly exiting Sandbox clears the temporary session.
- Advanced the app/build and service-worker cache versions to v0.test.12. Preserved prior changelog entries and project rules. Verification is syntax/archive-level only; no live-browser test or GitHub deployment is claimed.

# Wayfarer v0.test.11 — Restore lifecycle runner and isolate Sandbox skill selection (2026-10-27)

- Fixed the Equipment Lifecycle Test Suite crash caused by an undefined requirement-injector variable; the report now describes the observed shared unlock-gate result.
- Prevented skill selection and quest-priority edits made in Sandbox from writing to local storage or syncing to the real account. Sandbox selections remain in the temporary state and are discarded on exit.
- Kept normal-account skill saving unchanged, and advanced the app/build and service-worker cache versions to v0.test.11.
- Based on v0.test.10; prior changelog history and project rules are preserved. Syntax and archive checks are performed for this package; no live-browser test or GitHub deployment is claimed.

# Wayfarer v0.test.10 — Real gameplay fault injection and Test quest registration (2026-10-27)

- Updated the visible lifecycle injectables so Test-theme unlock, purchase, equip, and XP-bonus faults affect shared gameplay decision paths rather than forcing the test report to fail artificially.
- Routed theme Inventory equipping through a shared equip helper used by both the real Inventory click handler and the lifecycle runner; the equip injectable now blocks the actual equip operation.
- Added a dedicated eligible `Test` quest template to the shared quest pool so selecting Test can generate a real Test quest.
- Updated lifecycle tests to call the shared purchase/equip/reward helpers and report observed results.
- Preserved the v0.test.8 baseline and all prior changelog history; no GitHub deployment was performed.

# Wayfarer v0.test.8 — Show Test skill in Sandbox and correct Test quest/perk (2026-10-27)

- Added the Test skill to the actual skill catalog under Sandbox testing; the existing catalog filter keeps it hidden outside Sandbox mode.
- Renamed the Test skill's generated quest to exactly “Test” and updated its description.
- Corrected the Test theme's Inventory and Store perk text to show +5 Test XP for eligible newly generated Test quests, instead of incorrectly displaying Fitness XP.
- Updated the independent theme baseline's display name and Debug report version to “Test” / `v0.test.8`.
- Updated the service-worker cache version to `wayfarer-v0.test.8`; prior changelog history preserved.
- Validation performed: JavaScript syntax, targeted Test skill/theme/quest labels, cache/changelog version alignment, and ZIP integrity. No live-browser test or GitHub edit performed.

# Wayfarer v0.test.7 — Hide legacy Debug panels without deleting their code (2026-10-27)

- Hid the legacy Quest System Tests, Theme Integration Tests, and Feature Isolation Switches panels from the Debug interface.
- Preserved their markup, JavaScript functions, event handlers, and feature-switch plumbing in the project for recovery and compatibility; this is a presentation-only hide, not code deletion.
- Kept the Equipment Lifecycle Test Suite as the visible new Debug test system, including its four Test-theme fault injectors.
- Updated lifecycle/theme diagnostic report version strings and service-worker cache version to `v0.test.7`.
- Validation performed: JavaScript syntax, required project files, changelog/version/cache alignment, and ZIP integrity. No live-browser test or GitHub edit performed.

# Wayfarer v0.test.6 — Merged legacy diagnostics and equipment lifecycle suite (2026-10-27)

- Restored the v0.test.3 Debug panels and feature-isolation switches as the base; did not remove the legacy Quest System Tests or Theme Integration Tests.
- Added the Equipment Lifecycle Test Suite and four Test-theme fault injectors alongside the legacy system.
- Added the Sandbox-only Test skill and Test theme configuration (Test skill level 3, 100 coins), plus a Test quest template.
- Retained the existing theme test baseline and legacy debug fault-injection plumbing.
- Validation performed: JavaScript syntax and ZIP integrity checks; no live-browser testing performed.

# Wayfarer v0.test.3 — Independent theme compliance baseline (2026-10-27)

- Added a separate `THEME_DEBUG_BASELINE`, maintained independently of `UNLOCKABLE_ITEMS`, for every currently registered theme including Dungeon and `v0.test`.
- Debug now compares each theme's registered display name, body class, icon, background, male/female artwork, and soundtrack against the independent baseline. A newly registered theme without a baseline is reported as INCONCLUSIVE rather than being assumed correct.
- Debug checks computed palette variables (`--bg`, `--panel`, `--panel2`, `--line`, `--gold`, `--gold2`, `--cream`, `--muted`, `--green`, `--red`) against the independent expected palette while temporarily applying each theme class.
- Added a palette identity check to catch unintended Dungeon palette reuse; the intentional `v0.test` Dungeon visual reuse is explicitly documented in the baseline.
- Tightened rendered-surface coverage so inspecting surfaces without measurable styling no longer automatically passes.
- Updated Debug report version and service-worker cache to `v0.test.3`; preserved previous changelog history, project rules, login/configuration, account isolation, and saved-progress paths.
- Validation performed: JavaScript syntax, baseline-to-registry consistency checks, asset existence, changelog/version/cache agreement, and ZIP integrity. No live-browser run was performed.

# Wayfarer v0.test.2 — Registry-driven Debug theme discovery (2026-10-27)

- Reworked Theme Integration Tests to discover Dungeon plus every registered theme in `UNLOCKABLE_ITEMS`, instead of a hardcoded list of seven themes.
- Added explicit Debug metadata to registered themes for their theme body class, background asset, male/female character assets, and soundtrack. Missing metadata now fails or reports INCONCLUSIVE rather than silently skipping coverage.
- Each discovered theme is checked for registry/display name, icon/background HTTP response and image decoding, both character assets, soundtrack response, CSS class/surface selectors, and computed background/UI surfaces.
- Updated feature-lock image/music expectations to use registered metadata, including `v0.test` despite its intentional reuse of Dungeon assets.
- Kept the v0.test Store offer free and without a level requirement. Preserved account/authentication, saved progress, theme perks, and previous changelog history.
- Updated the Debug report version and service-worker cache identifier to v0.test.2.
- Validation performed: JavaScript syntax, referenced asset existence, and ZIP integrity. No live-browser run was performed.

# Wayfarer v0.test.1 — Free Store access for Debug test theme (2026-10-27)

- Kept `v0.test` in the Store as a normal registered theme, with no skill-level requirement and a price of 0 coins.
- The Store labels the item “Free” and offers “Get for free”; it remains listed until added to Inventory.
- Preserved the unique theme ID, duplicated Dungeon visuals, +5 Fitness XP perk, and the intentionally unchanged hardcoded Debug coverage lists so the auto-discovery test remains valid.
- Updated the Debug report version and service-worker cache identifier to `v0.test.1`.

## v0.test — Debug theme auto-discovery test
- Added a unique `v0-test-theme` registry/equipment ID displayed as `v0.test`, unlocked at Fitness level 3 for 100 coins, with a +5 Fitness XP perk for newly generated eligible Fitness quests.
- Intentionally reused Dungeon's icon, male/female character artwork, full-screen background, color palette, and soundtrack to isolate whether Debug discovers a new unique theme independently of its visual assets.
- Registered the theme for Store/Inventory, equipping, save persistence, theme class, perk display and music selection.
- Deliberately left the Debug Theme Integration Tests' theme list and character-image mapping unchanged so this test can reveal whether the existing hardcoded Debug checks automatically recognize the new theme.
- This is a test build, not a production theme release. Preserved all prior changelog entries.

# Wayfarer v1.16.2 — Mandatory changelog rule clarification (2026-10-27)

- Strengthened `update rules` to explicitly require every single update—including small fixes, configuration changes, Debug-only changes, and documentation/rule edits—to receive its own entry at the top of `CHANGELOG.md` before packaging.
- Preserved the existing update rules and all prior changelog history.
- Updated Debug build identifier and service-worker cache version to v1.16.2.

# Wayfarer v1.16.1 — Live Generate Quests cooldown reset (2026-10-27)

- Added an Admin-only Debug control to reset the live account's four-hour Generate Quests cooldown without entering Sandbox.
- The control refuses to run while Sandbox is active, confirms before changing state, clears only `questGenerationCooldownUntil`, saves the live state, and refreshes the Generate Quests button.
- Existing quests, skills, XP, coins, inventory, and other progress are not changed by this control.
- Updated the Debug build identifier and service-worker cache version to v1.16.1.

# Wayfarer v0.15.60 — Generate every selected skill (2026-10-27)

- The campaign time window prioritizes Main Quests but does not suppress Side Quests. Generate one quest for every selected skill whenever its quest library has an eligible entry.
- Removed the time-budget cutoff from quest selection; estimated duration is informative, not a cap on skill coverage.
- If a selected skill has no quest matching the chosen location, fall back to a suitable quest for that skill rather than silently omitting it.
- Updated the campaign preview to explain that Side Quests can be completed later.
- Preserved the campaign planner, theme XP calculation, four-hour full-refresh cooldown, and existing quest state handling.

## v0.15.59 — Restored campaign planner entry point
- Restored the Plan Your Campaign panel as the action opened by the main Generate Quests button.
- Kept the existing campaign planner controls, connected quest-selection logic, 4-hour cooldown, and quest-generation behavior intact; quest generation occurs when the user confirms the plan.
- Based this release on the v0.15.57 project baseline to avoid the unrelated code removals introduced in v0.15.58.
- Verified the top changelog entry and Debug build identifier match v0.15.59.

## v0.15.57 — Direct quest generation and 4-hour cooldown
- The Generate Quests button now generates a connected, balanced set immediately; it no longer opens the Plan Your Campaign panel.
- Preserved the existing campaign quest-selection logic and its balanced focus, normal-energy, mixed home/outside defaults so generated quests continue to complement one another.
- Reduced the full quest-generation cooldown from 8 hours to 4 hours and updated user-facing cooldown messages.
- Kept the planner functions and Debug planner test bench in the project for compatibility; the main Generate Quests action no longer depends on the planner UI.
- Updated the Debug build identifier and service-worker cache version.

## v0.15.56 — Corrected color and character-image lock detection
- Fixed the theme integration test so the color-lock check compares the actual rendered palette across all core theme CSS variables against the same equipped theme with only the Dungeon lock removed. A forced Dungeon palette now fails for a non-Dungeon equipped theme.
- Fixed the character/theme-image lock check to compare the actual rendered character image filename (and theme icon when present) against the expected asset for the equipped theme, rather than merely checking a checkbox.
- Unknown/unmapped theme character assets are reported as a failed image integration check when a non-Dungeon theme is equipped, so adding a theme without registering its image mapping cannot silently pass.
- Updated the Debug report version and service-worker cache version to `v0.15.56`.

## v0.15.55 — Changelog latest-release correction and release rule
- Added this release entry at the very top of `CHANGELOG.md` so the latest update is immediately visible in Debug Version History.
- Added a permanent update rule requiring every project update to prepend a dated/versioned entry at the top of `CHANGELOG.md`, preserve all prior entries, and verify the top entry matches the delivered project version before packaging.
- Updated Debug's reported build version and service-worker cache version to `v0.15.55` so the build can be distinguished from older deployed versions.

## v0.15.53 — Behavior-based Debug fault injection and theme-lock detection
- Debug feature locks now force the actual Dungeon background, palette, character/theme images, and soundtrack source in Sandbox; the music lock selects the Dungeon track rather than muting audio.
- Academy fault injection now alters the actual Academy unlock decision, purchase handler, and quest-generation bonus calculation, gated to Admin Sandbox.
- Store tests exercise the same unlock/purchase decision helpers using isolated level/gold values; they do not spend gold or mutate inventory.
- Quest tests inspect generated Academy Reading quests against their stored base XP and bonus metadata instead of manufacturing a failure based on the checkbox.
- Theme integration tests inspect rendered background, palette, character image, and active music source to detect when a Dungeon lock overrides a non-Dungeon equipped theme.
- Updated service-worker cache version and corrected its asset-list separator.

## v0.15.51
- Added an Admin Debug control to remove a specified amount of character XP and gold, with a confirmation prompt, non-negative balance protection, status reporting, and Debug log entry. Works in live mode or Sandbox, consistent with the existing resource-grant tool.

## v0.15.5
- Replaced six existing theme backgrounds (leaving Fitness untouched) with optimized 1672×940 WebP assets.
- Corrected theme checks: Dungeon is treated as starter equipment, and empty artifact/pet slots are not expected to be theme-styled.
- Added Sandbox-only feature isolation switches, quest checks, and Store catalog checks.
- Added Admin character recovery tools: confirmed reset, snapshot restore, and XP/gold grants in live or Sandbox mode. Journal, To Do, and Groceries are preserved during reset.

## v0.15.4
- Renamed theme display labels to Adventurer, Social Butterfly, Faith, Heartkeeper, and Fitness without changing stable theme IDs or skill names.
- Expanded Debug theme integration checks to verify registry names, HTTP asset availability, image decoding, background application, computed UI surfaces, and lower Inventory/Store styling.
- Expanded theme CSS coverage so equipped palettes style lower panels, Inventory, equipment slots, Store cards, and controls, including the Faith theme.

## v0.15.3 — Roman Fitness visual integration and Debug tests
- Completed Roman crimson/gold/bronze/charcoal styling for major UI components.
- Ensured Fitness background rules apply on mobile and desktop.
- Added read-only Debug Theme Integration Tests with structured pass/fail diagnostics.
- Added permanent theme visual integration test requirements to theme creation rules and update rules.

# Wayfarer v0.15.1 — Roman Fitness

- Added the Roman Fitness theme to the shared theme registry, Store and Inventory.
- Unlock requirement: Fitness skill Level 3; Store price remains consistent with existing themes.
- Added +5 Fitness XP to eligible newly generated Fitness quests while Roman Fitness is equipped. The bonus is stored on the quest at generation time.
- Added optimized Roman Fitness icon, full-screen Roman training courtyard background, male legionary artwork and Athena-inspired female character artwork.
- Added crimson/gold/bronze theme accents and a dark full-screen background overlay for readability.
- Uses the existing `fitness-theme.mp3` soundtrack.
- Added a permanent full-screen background requirement to `theme creation rules.md` and the general `update rules`.
- Updated the service worker cache for the new theme assets.

## v0.14.5 — Music default and Dungeon icon fix
- Music is enabled by default for new and existing users on first load of this update; users can still pause it in Settings.
- Fixed the Dungeon theme icon in Inventory by resolving theme icons from the canonical theme registry instead of potentially stale saved item paths.
- Migrated the saved Dungeon inventory icon to the current optimized WebP path.
- Bumped the service-worker cache version.

## v0.14.5 — Theme Music System
- Added Settings controls for music enable/pause, independent volume, and explicit mobile-friendly playback.
- Added looping soundtracks for all six current themes and reserved soundtracks for future Fitness, Cardio, and Piano themes.
- Added theme-aware soundtrack selection, crossfade transitions, and saved music preferences.
- Added the permanent mandatory-theme-audio rule and new `update rules` file requiring image compression.
- Compressed the supplied Piano WAV soundtrack to MP3 for web delivery.

# Changelog

## v0.14.5 demo b1 — Dungeon music test
- Added an original, procedurally composed dark ambient loop for the Dungeon theme.
- The track loops continuously and is only allowed to play while the Dungeon theme is equipped.
- Playback begins after user interaction to accommodate mobile browser autoplay restrictions.
- Switching to another theme stops the Dungeon track; switching back allows it to start again.
- Added the audio file to the service-worker asset cache and bumped the cache version.
- This demo does not add music for any other theme and does not add music controls or settings.

## v0.14.2 — Orthodox theme inventory equip fix
- Fixed the Inventory theme click handler so the Orthodox Christianity theme is accepted as an equipable theme.
- Added the correct Orthodox Christianity label when equipping the theme.
- Preserved the existing theme unlock, purchase, reward-locking and character artwork behavior.
- Updated the service-worker cache version to ensure the fix is refreshed after deployment.

## v0.14.1 — Orthodox Christianity theme
- Added Orthodox Christianity as a Store theme, unlocked at Orthodox Christianity skill level 3 for 100 coins.
- Added the Imperial palette with purple, crimson, antique gold and marble-ivory accents, plus the Orthodox church background.
- Added dedicated male and female kneeling-prayer character artwork and the transparent Orthodox inventory/theme medallion.
- Registered the theme for Store listings, Inventory, equipment, top-left app icon switching, character appearance and Debug “Unlock All Items”.
- Added +5 Orthodox Christianity XP to eligible quests generated while the theme is equipped; the bonus is saved at quest generation and does not change existing quests.
- Preserved the existing skill catalog, login, Supabase configuration, account isolation and saved progress.

# Changelog

## v0.13.3 — Relationships theme
- Added Relationships to the Store and shared unlockable-item registry, unlocked at Relationships skill level 3 for 100 coins.
- Added warm oak and amber theme styling and a gold-framed tankard-toast icon.
- Added the exact same full tavern conversation photo as both male and female character assets, without cropping, zooming or resizing.
- Added +5 Relationships XP to eligible Relationships quests generated while equipped; the bonus is saved at quest generation.
- Registered the theme with Inventory, equipment, character appearance, Debug “Unlock All Items” and service-worker caching.
- Updated theme creation rules to require a theme icon, male character asset and female character asset in `assets/` for every new theme.


## v0.13.2 — Debug sandbox visual indicator
- Added a persistent 4px red frame around the viewport while Debug sandbox mode is active.
- The frame appears immediately when the sandbox starts and disappears when the sandbox is exited.
- The frame does not intercept clicks or affect the layout, and is synchronized with sandbox state when the Debug panel refreshes.
- Preserved the existing sandbox isolation and account/login behavior.

## v0.13.1 — Social Interactions theme
- Added Social Interactions as a Store theme, unlocked at Social Interactions skill level 3 for 100 coins.
- Added the burgundy-and-gold theme palette and handshake medallion icon.
- Added the shared medieval marketplace conversation artwork for both male and female character selections.
- Added the +5 Social Interactions XP perk to eligible quests generated while equipped, saved at quest generation so existing quest rewards do not change.
- Registered the theme with Inventory, equipment, Debug “Unlock All Items”, character appearance and service-worker caching.
- Preserved existing login, Supabase configuration, progress and theme systems.

## v0.12.5
- Replaced the male Dungeon character artwork with the updated realistic medieval linen outfit.
- Replaced the female Dungeon character artwork with the updated realistic medieval linen outfit.
- Kept the existing Dungeon asset paths and included the permanent `theme creation rules.md` reference.
- Updated the service-worker cache version.

## v0.12.3 — Theme perks and generation notice
- Added an Inventory notice explaining that XP and Gold bonuses activate on the next quest generation and do not change rewards on already-generated quests.
- Added clear perk descriptions to Store theme cards, including locked themes: Adventure grants +5 Adventure XP per quest generated while equipped; Academy grants +5 Reading XP per quest generated while equipped.
- Preserved the existing theme purchase requirements, inventory behaviour, quest-generation reward snapshots and username/PIN Supabase login.

## v0.15.2 — Academy inventory perk label
- Added the visible “Reading +5 XP/quest” perk label beneath the Academy theme in Character > Inventory, matching the Adventure theme card.
- Preserved the existing quest-generation perk snapshot behavior and username/PIN Supabase login.

## v0.15.2 — Quest-generation perk snapshots
- Theme XP bonuses are now captured when each quest is generated, so later equipment changes cannot alter existing quests.
- Academy adds +5 XP to Reading quests generated while equipped; Adventure adds +5 XP to Adventure quests generated while equipped. The quest card displays the full XP reward (for example, +20 XP) and identifies the included theme bonus.
- Completion awards the saved quest XP and no longer checks the currently equipped theme, preventing mid-session swaps from changing rewards or double-counting the bonus.
- Preserved the username/PIN Supabase login, save structure, and existing account progress.

## v0.15.1 — Debug XP and coin tools
- Added a sandbox-only Coin Lab with a configurable coin amount and immediate balance/UI refresh.
- Fixed overall XP and skill XP debug setters so all XP-dependent UI updates immediately without requiring a quest completion.
- Added immediate refreshes for the character display, skill progression, debug metrics, and save inspector after debug changes.
- Preserved sandbox isolation: debug changes are discarded when exiting and do not write to the real character or cloud save.

## v0.15 hotfix — Restore Unlock All Items debug
- Restored the missing `applyUnlockAllItems` handler used by the Debug sandbox checkbox.
- The handler uses the shared unlockable registry, including the Academy theme, and keeps temporary unlocks sandbox-only.

# Wayfarer Changelog

## v0.15 — Academy theme
- Added the Academy theme perk: completing any quest while it is equipped grants an additional +5 Reading skill XP, alongside the quest’s normal skill XP. The completion confirmation and toast display the bonus.
- Added the Academy theme with a transparent owl medallion icon and male/female low-poly Greek scholar scenes.
- Added Academy theme styling using Aegean midnight, marble ivory, antique gold, and Mediterranean teal.
- Added the Academy Store unlock requirement: Reading level 3, followed by a 100-coin purchase.
- Integrated Academy ownership, inventory display, equipping, character selection, theme icon, and saved equipped-theme state through the existing systems.
- Registered Academy in the shared unlockable-item registry for the existing Debug sandbox.
- Standardized the Adventure theme purchase price at 100 coins, consistent with the established v0.14.6 specification.
- Preserved the existing Dungeon default theme, username/PIN Supabase login, save schema, and account-specific progress.

## v0.14 — Character Details text layout polish
- Updated narrow-screen Character Details slots to give Theme, Artifacts and Pets readable horizontal text space instead of forcing words to wrap vertically.
- Kept the three equipment slots, previews, theme behavior, and overall visual design intact.

## v0.14 — Character frame and Adventure perk polish
- Character artwork now fills its portrait frame edge-to-edge without the thin gray side gaps; Adventure uses a distinct leather-and-bronze explorer frame while Dungeon keeps its stone frame.
- The label below the character portrait now shows the signed-in account username instead of the generic “Wayfarer” label.
- Removed the redundant “Equipped” and “Tap to equip” inventory labels and the extra green “EQUIPPED” stamp, preserving a compact card size.
- Adventure theme inventory cards show a small “Adventure +5 XP/quest” perk note without changing their overall sizing.
- While Adventure is equipped, each completed quest adds 5 bonus XP to the Adventure skill, shown in the completion confirmation and toast. This is skill XP, separate from the quest's normal XP and +5 coins.

## v0.14 — Adventure theme, coins and unlock testing
- Polish follow-up: quest cards now show both XP and the +5 coin reward before completion.
- Adventure theme now recolors cool gray panels, cards, stat tiles, navigation, form fields, borders and secondary buttons into warm leather, umber and bronze tones; Dungeon retains its original stone palette.
- Every completed quest now awards 5 coins in addition to its existing XP reward.
- Added the Adventure theme as a Store item, initially locked until Adventure reaches level 3; then it costs 30 coins. After purchase it moves to Inventory.
- Added Adventure theme equipment behavior: the theme icon, female/male adventurer portraits, and warm explorer palette switch together. Dungeon remains the default owned theme.
- Added a sandbox-only Debug option, Unlock all items, backed by a shared unlockable-item registry so future themes, pets and artifacts can be registered for the same testing override.
- Added the Adventure icon and both user-provided adventurer portraits to assets.
- Preserved existing username/PIN authentication, Supabase save schema, quest safeguards, Pets, and prior release history.

## v0.13 — Admin Debug session persistence and gender testing
- Added an Admin-only Character Gender Test control in Debug to switch the signed-in account's saved character between male and female for portrait testing.
- Requires confirmation because it changes the real account profile, not the temporary sandbox; the control is disabled while sandbox mode is active.
- Updates both the Supabase user metadata (`wayfarer_gender`) and the account's saved app state, then refreshes the Character portrait and Debug status.
- Preserves existing username/PIN authentication, cloud-save schema, and prior release history.


## v0.13 — Admin Debug session persistence hotfix
- Persist the last signed-in username locally so the Admin identity can be restored when session metadata is incomplete.
- Restore username from Supabase metadata first, then the synthetic account email, with the saved username as a fallback.
- Reapply the account navigation gate and refresh the Debug tab after auth state/session restoration.
- Clear the remembered username on sign-out to avoid leaking Admin visibility between accounts.
- Existing username-based Supabase login and cloud save schema remain unchanged.

# Wayfarer — Update Log

This file is the release history for Wayfarer. Add a new dated/versioned section whenever the project changes. Keep older entries intact; append new releases at the top.

## v0.12 — 2026-10-26

### Added: Quest generation cooldown and safer completion
- Added an eight-hour cooldown after a full quest generation. The remaining time is shown on the Generate quests button and survives refreshes and account session restoration through saved app state.
- During the cooldown, generating quests for newly selected skills adds quests only for those new skills and preserves existing quests, their completion state, and the original cooldown timer.
- During the cooldown, quest generation is disabled when there are no newly selected skills. Once the cooldown expires, generating quests creates a fresh set for the currently selected skills and starts a new eight-hour cooldown.
- Removed the redundant checkbox from quest cards; the Complete button is the single completion control.
- Added a confirmation prompt before a quest is completed and XP is awarded.

### Added: Optional sandbox overrides for testing
- Added an Admin Debug Workshop checkbox, disabled unless the isolated sandbox is active, to override quest safeguards on demand.
- When enabled, the sandbox can bypass the eight-hour quest-generation cooldown and skip the quest-completion confirmation prompt for rapid testing.
- The override is off by default, is reset when the sandbox starts or exits, and never changes normal account behavior.

### Fixed: Admin Debug session restoration
- Normalized the username restoration path and added an auth-state listener so the Admin Debug tab is recalculated when Supabase restores or changes the session, without requiring a manual re-login.
- Preserved the username/PIN login, Supabase project configuration, existing saved account data, Pets, and prior changelog entries.

### Notes
- The cooldown is enforced in the client app state. It discourages ordinary repeat clicks, but a tamper-resistant anti-cheat rule would require server-side enforcement.

---

## v0.11 — 2026-10-26

### Added: Pet equipment and inventory
- Added a Pets equipment slot to Character Details, alongside Theme and Artifacts.
- Added a Pets category to the Character Inventory, with an empty state until pets are owned.
- Pet items in saved inventory (with `type: "pet"` or `category: "Pet"`) can be equipped and unequipped by tapping them; the equipped pet is tracked in `state.equipment.pet`.
- Equipped pet name and icon are reflected in the Character Details slot. Pets are cosmetic only in this release; no XP or gameplay bonuses are applied.
- Preserved the existing username/PIN login, Supabase cloud-save flow, existing equipment, and v0.10 changelog history.

### Notes
- No pets are granted by default; the Pets inventory displays “No pets yet.” until pet items are added by a future store/unlock feature.

---

## v0.10 — 2026-10-26

First release using the new `v0.10` version-numbering scheme. This entry documents the feature set present in the v0.10 project baseline.

### Core RPG and quest system
- Fantasy-themed, responsive real-life RPG interface with a campaign/quest-board home view and navigation between app sections.
- Daily quest board with quest categories, skill association, XP rewards, completion tracking, and completion history/counters.
- Quest creation/editing workflow and generated quest templates tied to selected skills.
- Campaign principles that encourage action over perfection, social courage, exploration, and rest without missed-day penalties.
- Character XP and overall levels: every 100 overall XP earns a character level; missed days do not remove XP.
- Separate XP progression for individual skills, with progressive level bands (60 / 90 / 120 / 150 / 180 / 225 / 270 / 300 XP thresholds).
- Quest generation uses skill and progression context; reading quests target 10 pages, piano/instrument practice quests target 10 minutes, and generated quests award 15 XP.

### Skills and personal development
- Skill catalog organized by improvement area; users choose which skills to develop.
- Selected skills appear on the Quest Board and guide quest generation.
- Skill XP is retained if a skill is deselected and selected again.
- Save-selected-skills workflow and skill progression/attribute display.

### Character, inventory, equipment, and store
- Character profile with male/female character artwork and saved character choice.
- Character Details panel for equipped theme and artifacts.
- Inventory separated into Theme and Artifacts categories.
- Dungeon theme item and artwork; theme can be equipped from inventory.
- A theme is normally required to remain equipped. Admin sandbox has an optional exception for testing the no-theme state.
- Adventurer's Store section with an in-game Gold balance and equipment/collectibles concept; no real-money purchases.

### Journaling and everyday tools
- Adventure Journal for recording experiences and reflections, with entry creation/editing and a chronicle list.
- Journal entry types match the current skill group names: Lifestyle & personal growth, Instruments & music, Fitness & movement, and Faith.
- Personal To Do list with optional due dates, priority, notes, editing, and completion/list management.
- Grocery list with item quantities, check-off, removal of checked items, and clear-list action.

### Accounts, saves, and security
- Username + numeric PIN account interface using Supabase Auth with a synthetic internal email alias; no actual email is sent.
- Supabase cloud-save integration to load and synchronize an account's app state across devices when the owner configures a Supabase project.
- Local browser persistence alongside cloud saves; existing local data is not automatically deleted by signing out.
- Supabase SQL schema for a per-user save table with row-level security so each authenticated account can access its own save.
- Character choice, inventory/equipment, quests, skills, journal, to-do items, groceries, and related app state are included in the saved app state where implemented.
- The distributed project uses placeholder Supabase URL/public-key values until configured with the owner's project. Never put a service-role key in client code.

### Admin Debug Workshop
- Admin-only Debug tab visibility based on the signed-in username `Admin` (front-end convenience gate, not server-side authorization).
- Isolated sandbox started from a copy of the current character; sandbox edits are discarded when exiting and do not overwrite the real character save.
- Sandbox-only campaign Time Machine for shifting the active date by 1, 7, 30, or 365 days.
- XP & Level Lab for testing overall XP, skill XP, and calculated level progression.
- Quest Lab for inspecting quests and adding a disposable test quest.
- Campaign Planner Test Bench with presets for available time, energy, focus, and location.
- Save Inspector and temporary event log; the inspector avoids displaying raw PINs or authentication secrets.
- Admin username restoration from auth metadata or the synthetic email local part so the Debug tab can reappear after session restoration.

### App delivery and documentation
- Static-site deployment structure suitable for GitHub Pages.
- Progressive Web App manifest and service worker for caching/offline fallback and update checks.
- Character and theme artwork stored under `assets/`.
- `README.md` includes setup, Supabase configuration, account-use, and security guidance.
- Version/cache identifiers use `v0.10` / `wayfarer-v0.10`.

### Known boundaries at v0.10
- Cloud saves work only after the owner configures the Supabase project URL, public/anon key, authentication settings, and SQL schema.
- The Debug tab's username gate is not a security boundary for privileged backend operations; enforce authorization on the backend for any future privileged actions.
- Some store/artifact systems are foundations for future expansion; do not assume every planned purchase, artifact perk, or theme-unlock milestone is implemented yet.

---

## Future release template

When making the next update, copy this template to the top of the log and describe only changes actually made and tested:

### v0.11 — YYYY-MM-DD
- **Added:**
- **Changed:**
- **Fixed:**
- **Removed:**
- **Notes / migration:**

## v0.14.5 — Persistence hotfix
- Fixed selected skill changes so they sync to the signed-in account's cloud save.
- Prevented overlapping cloud-save requests from overwriting newer state with older snapshots.
- Added a local save timestamp fallback: if a cloud upload was interrupted, newer local progress is restored and synced on next sign-in/refresh.
- Stopped clearing active quests solely because the calendar date changed; quests and the 8-hour generation cooldown now remain available across refreshes.
- Preserved the existing username/PIN authentication and account-specific cloud save structure.


## v0.14.6 — Navigation and Store price
- Fixed selected-tab persistence so refreshing returns to the page the player last selected instead of unexpectedly switching to Settings.
- Changed the Adventure theme price from 30 to 100 coins, including the Store label and insufficient-funds message.

## v0.13.4 — Relationships App Icon Fix
- The top-left app crest now switches to the Relationships theme icon when Relationships is equipped.
- Updated the Relationships icon asset to the transparent-background version.


## v0.14.5 demo b2
- Added immersive full-screen background artwork for Dungeon, Adventure, Academy, Social Interactions, and Relationships; retained and integrated the existing Orthodox Christianity background.
- Added theme-specific dark overlays and responsive mobile background behaviour for readability.
- Organized static assets into `assets/images/` and `assets/sound/`, updating app references and service-worker precache entries.
- Preserved the Dungeon-only looping music demo.


## v0.14.5 demo b3 — compressed assets
- Converted project image assets to optimized WebP files to reduce repository size while retaining transparency where present.
- Updated application, service-worker, and theme-rule asset references.
- Preserved the Dungeon looping music and existing app behaviour.
