# Wayfarer — Theme Creation Specification

Every new theme must follow these rules unless explicitly changed.

## 1. Theme Perks and Rewards
- Every theme must provide a defined XP bonus, coin bonus, or another explicitly specified perk.
- Before implementation, specify the perk type, amount and target skill.
- Display the perk clearly in the Store and Inventory.
- A theme perk applies only to quests generated while that theme is equipped.
- Apply each perk exactly once; never accidentally duplicate or stack it.

## 2. Quest Generation and Reward Locking
- **Quest generation is the reward-locking boundary.** Save applicable XP, coin and other perk bonuses with each quest when it is generated.
- Saved rewards remain unchanged until completion, regardless of later equipment changes.
- Equipping or unequipping a theme never changes rewards on existing quests.
- Equipment changes affect only quests generated afterward.
- Regenerated or replacement quests use the equipment and perks active at their own generation time.
- Saved rewards must survive refreshes and returning to the application.

### Multiple Skill Bonuses
- A quest may receive bonuses from multiple themes when it contains multiple matching skills.
- Each equipped theme whose target skill matches a skill associated with the quest may contribute its perk.
- Example: a quest containing Reading and Adventure receives both bonuses if both corresponding themes are equipped when it is generated.
- Apply every eligible bonus exactly once.

## 3. Theme Artwork and Asset Storage
- Every new theme requires all three image asset files to function: (1) a personalized theme icon, (2) a male character asset, and (3) a female character asset.
- Store all new theme image files in the project's existing `assets/` folder.
- Use clear, consistent filenames that identify the theme and asset type (for example, `relationships-theme.webp`, `male-relationships.webp`, and `female-relationships.webp`).
- The male and female character assets may use the exact same image only when explicitly requested; do not crop, zoom, or otherwise alter shared artwork when the user asks for the exact same image.
- Artwork fits the theme and follows Wayfarer’s established visual style unless specified otherwise.
- Shared artwork between themes is allowed only when explicitly requested.
- Reference assets using correct relative paths and update the service-worker asset cache when appropriate.
- Verify every referenced asset exists and loads correctly on mobile and desktop.

## 4. Themed Interface
- Equipping a theme changes the top-left application icon to its personalized icon.
- Each theme applies a coordinated colour palette fitting its setting.
- Maintain readable text, accessible contrast and clear interactive elements.
- Theme changes must not break unrelated layouts or navigation.

## 5. Store and Unlock Requirements
- Every theme is available through the Store.
- Specify coin cost and skill-level unlock requirement before implementation.
- The Store displays name, icon, description, price, unlock requirement and perk, including while locked.
- Locked themes remain unavailable until requirements are met.
- Purchased themes remain owned and available in Inventory.
- Purchasing does not automatically equip a theme unless explicitly specified.
- Preserve existing ownership, currency and progression.

## 6. Inventory and Equipment
- Every owned theme appears correctly in Inventory, and the equipped theme is identifiable.
- Equipping updates the relevant appearance and prepares perks for future quest generation.
- Equipment changes never modify rewards saved on existing quests.

### Mandatory Equipment Integration Checks
- Every new theme ID must be added to every relevant equipment selection, click-handler allowlist, validation condition, and theme-switching branch.
- Do not assume that registering a theme in the shared unlockable registry automatically makes it equipable.
- Trace the complete flow: Store purchase → Inventory ownership → Inventory interaction → equipment state update → save/persistence → visual theme and character update.
- Verify that tapping the theme actually equips it, updates its equipped indicator, saves the change, and remains equipped after refresh.
- Prefer deriving available themes and valid equipment IDs from the shared registry instead of maintaining separate hard-coded allowlists where practical.
- Include a specific test that equips each newly added theme from Inventory on mobile and desktop.

## 7. Debug Compatibility
- Every theme integrates with the existing Debug system.
- “Unlock All Items” correctly unlocks the new theme and makes it available in the appropriate Store/Inventory states.
- Debug actions must not corrupt ownership, equipment, XP, coins, progress or account data.
- Existing themes and debug functionality must continue to work.

## 8. Regression Testing and Preservation
- Test Store listing, purchase requirements, Inventory, equipment, icon, artwork and palette.
- Verify perks are saved at generation time and remain unchanged after equipment changes.
- Test quests with multiple skills and confirm all eligible bonuses apply exactly once.
- Test regeneration, refresh and return-to-app persistence.
- Test existing themes and “Unlock All Items”.
- Verify mobile and desktop behaviour.
- Preserve username/PIN Supabase login, database configuration, account isolation, saved progress and unrelated functionality.
- Update version, changelog and service-worker cache as appropriate. Validate JavaScript syntax, asset paths and ZIP integrity.

## 9. Implementation Rules
- Build on the current approved Wayfarer baseline.
- Reuse existing theme, equipment and reward systems wherever possible.
- Do not remove or modify existing features unless explicitly requested.
- Deliver the complete updated project ZIP, not individual files only.

## Mandatory Theme Audio (v0.14.5)
- Every theme must include its own dedicated audio track. This is required for all future themes; a theme is not complete without artwork and audio.
- Store all audio files in `assets/sound/` and use compressed, web-friendly formats such as MP3 or OGG.
- Register each theme's soundtrack in the shared theme-music mapping. Equipping a theme must select its matching track; switching themes must crossfade smoothly rather than cut abruptly.
- Music must loop, respect the user's Play/Pause toggle and independent volume setting, and persist those preferences across refreshes using the existing settings/save system.
- Support mobile autoplay restrictions: do not assume playback can begin before a user gesture; provide an explicit Play button and recover gracefully when playback is blocked.
- Future theme tracks may be included before the corresponding theme is registered, but must remain reserved and must not make that theme equipable prematurely.
- Verify each theme's audio path, looping, theme switching, fade transitions, volume, saved preferences, mobile play gesture, and service-worker cache.

## Required Details Before Creating a Theme
1. Theme name and description.
2. Associated skill(s) and unlock level.
3. Store price in coins.
4. Exact perk type, amount and target skill.
5. Personalized icon and character artwork.
6. Colour palette or visual direction.


## Asset Folder Organization (v0.14.5 demo b2)
- Keep all image assets in `assets/images/`. This includes theme icons, character artwork, theme backgrounds, and other UI images.
- Keep all audio assets in `assets/sound/`.
- Update every HTML/CSS/JavaScript reference and the service-worker cache whenever an asset moves.
- Every theme should use its own full-screen background image where available, with a dark overlay and responsive positioning so interface text remains readable. Preserve theme palettes and opaque card surfaces.
- The current theme background files are `dungeon-background.webp`, `adventure-background.webp`, `academy-background.webp`, `social-interactions-background.webp`, `relationships-background.webp`, and the existing `orthodox-theme-background.webp`, all in `assets/images/`.


## Permanent full-screen app background requirement (added for v0.15.1)
- Every theme must include its own dedicated full-screen app background image, in addition to its theme icon and male/female character artwork.
- Optimize and compress every background before inclusion; store it under `assets/images/` and use a consistent registered path.
- Register the background with the theme so it appears behind the application interface when that theme is equipped, with a dark readability overlay that preserves text and controls contrast.
- Verify desktop and mobile rendering, positioning, scrolling, and legibility. Confirm the background changes with the equipped theme and does not leak into other themes.


## Mandatory theme visual integration tests
Every theme must have a dedicated, registered full-screen background and a complete theme-specific color system—not merely an icon and character artwork. The theme stylesheet must define its own palette and apply it to active tabs, buttons, cards/panels, progress bars, form controls, borders, and character portrait framing as appropriate. The background must be layered behind the app with a readability overlay on desktop and mobile.

The Debug Theme Integration Tests must verify: (1) theme registry entry; (2) icon/background asset references; (3) theme-specific body class; (4) theme-specific background CSS; (5) distinct color rules for key UI components; (6) Store visibility and unlock requirement; (7) Inventory ownership and equip action; (8) character art selection; (9) soundtrack mapping; and (10) perk/reward-locking rules. A theme must fail testing if it inherits Dungeon colors or background unintentionally. Report each failure with test ID, expected behavior, actual behavior, and suggested investigation.


## Theme display identity and visual regression enforcement
- Display names may be changed without changing stable internal theme IDs, skill names, unlock keys, saved equipment IDs, or quest reward keys.
- Debug theme compliance tests must verify actual browser-computed styles and the lower interface (including Inventory and equipment surfaces), not merely the existence of CSS text.
- Test theme background and icon HTTP responses and image decoding. Report each failure individually with expected/actual details and suggested investigation. Never report a theme as passed solely because its asset path or selector exists.
- When checking non-active themes, use temporary in-memory class changes only and restore the original body classes immediately; never mutate saved user progress during visual tests.


## Debug and recovery safeguards (v0.15.5)
- Theme/quest/store diagnostic tests and feature-isolation switches must be restricted to Admin while Sandbox mode is active.
- Dungeon is the starter theme and must not be expected in the unlockable Store catalog. Only the theme equipment slot is required to show theme-specific changes; empty artifact/pet slots may remain blank.
- Debug must clearly distinguish PASS, FAIL, and INCONCLUSIVE. A catalog/style presence check is not proof of end-to-end behavior.
- Character reset must require explicit confirmation, preserve Journal, To Do, and Groceries, and offer one-step restoration from a snapshot. Explain which character fields are reset before confirmation.
- XP/gold grant tools are Admin-only, can run in live or Sandbox, and must clearly state which environment is being changed.
- Store and quest tests must not alter real progress; simulated purchase/reward flows should run only against isolated sandbox state.
