# Wayfarer — Update Log

This file is the release history for Wayfarer. Add a new dated/versioned section whenever the project changes. Keep older entries intact; append new releases at the top.

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
