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
