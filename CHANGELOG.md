# Changelog

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
