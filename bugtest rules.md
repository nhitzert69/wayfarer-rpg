# Wayfarer RPG — Bug Test Rules (MANDATORY)
Version: v3.1.19 | Last reviewed: 2026-11-10 | Repository: https://github.com/nhitzert69/wayfarer-rpg | Production: https://nhitzert69.github.io/wayfarer-rpg/

## 0. Purpose, ownership and non-negotiable maintenance
This is the authoritative repeatable end-to-end and regression test plan for Wayfarer RPG. Read this document before every full QA run, release validation, bug fix and feature update, together with `update rules` and applicable `theme creation rules.md` and `artifact rules.md`. The source of truth is the current live main branch, not a ZIP, cached build, old report or assumptions. If a referenced rules file is absent, record that discrepancy; do not invent its contents. In particular, verify whether `game rules.md` exists before claiming it was read.

Every update, including documentation-only changes, MUST review and revise this file: compare the current navigation, registries, features, state fields, rules, prices, levels, unlocks, admin permissions, file paths, service-worker cache and release version against actual source. Add new test cases for new behavior and failure modes; revise obsolete tests, remove references to removed UI, and preserve historical regression coverage. Update this header's version and review date and record the QA-plan change in the top CHANGELOG entry. Never silently carry forward an outdated test plan. Do not mark a test PASS merely because it is written here.

## 1. Scope, test evidence and environment
Test the production GitHub Pages app in a real browser plus the current GitHub main source; where possible test a preview or isolated account before release. Run desktop Chrome and a second browser (Safari/iOS preferred); use mobile viewports 375px and 430px and desktop 1280px+. Include touch, keyboard, screen reader labels where feasible, reduced motion, dark backgrounds, poor network and a hard reload. Verify console errors, unhandled rejections, network 404s, asset decode, PWA/service worker caching, stale script problems, and responsive layout.

Record test date/time, timezone, Git commit SHA, expected and displayed version, browser/device, account type, environment (live or Sandbox), initial state, actions, actual observed result, evidence (screenshots, logs, source line references) and cleanup. Distinguish code inspection, syntax tests, simulated unit tests and real end-to-end browser tests. Status vocabulary: PASS (executed and observed), FAIL (reproduced discrepancy), BLOCKED (cannot execute; explain dependency), NOT TESTED (not attempted), INCONCLUSIVE (insufficient evidence). Never claim production deployment, cloud persistence, audio playback or device behavior without directly checking it.

Use only authorized disposable test accounts and Admin Sandbox. Never access other users' accounts, disclose PINs or secrets, overwrite production progress, or use destructive Debug/reset actions on a real account. Snapshot authorized baseline state and restore/clean up test data where possible. Record blockers rather than guessing.

## 2. Source inventory and static preflight (before opening UI)
1. Read `update rules`, this file, `theme creation rules.md`, `artifact rules.md`, `CHANGELOG.md`, and any other applicable existing rules. Check HEAD and deployed version match.
2. Inspect `index.html`, `codes/styles.css`, `codes/skill-catalog.js`, `codes/skill-service.js`, `codes/tabs/quests.js`, `codes/tabs/skills.js`, `codes/tabs/character.js`, `codes/tabs/store.js`, `codes/tabs/todo.js`, `codes/tabs/groceries.js`, `codes/tabs/journal.js`, `codes/tabs/settings.js`, `codes/tabs/reflux.js`, `codes/tabs/debug.js`, `codes/theme-registry.js`, `codes/theme-service.js`, `codes/theme-music.js`, `codes/artifact-service.js`, `codes/inventory-service.js`, `codes/debug-service.js`, `sw.js`. Adapt if architecture changes.
3. Parse every shipped JavaScript file; check duplicate IDs, missing globals, missing module registrations, undefined functions, event listener duplication, stale selectors, broken lazy-loading, asset references and service-worker precache references. Test both fresh cache and upgraded old cache.
4. Compare actual theme and artifact registries against all Store/Character/Inventory/Debug/equipment/reward code paths; verify icons, portraits, backgrounds, audio and artifact art exist and decode. Validate male and female portraits separately.
5. Check consistent release identifiers in CHANGELOG top, `sw.js` cache, Debug/app display and any versioned URLs. Confirm the expected branch was updated, without assuming GitHub commit equals live deployment.
6. Build a change-impact matrix for every touched state field, event, save path, render path and registry. For each change add positive, negative, boundary, persistence, Sandbox and regression tests.

## 3. Authentication, authorization, cloud and local saves
- Fresh browser: signed-out state, login form, invalid username/PIN, valid authorized login, loading/error messaging, duplicate submission, offline login failure and sign-out.
- Verify authorized username/PIN Supabase login, hydration before state mutation, local/cloud sync, refresh, tab resume, close/reopen, second device/session, slow network, cloud failure/retry and stale local data. Confirm no lost or duplicated changes.
- Two separate test accounts: verify skills, XP, gold, inventory, equipment, quests, to-dos, groceries, journal, settings, Reflux diary and Sandbox never leak between accounts. Never test with another person's data.
- Inspect browser console/network for credential leakage, unsafe client-side authorization, unexpected writes and save errors. Verify Admin-only Debug and Reflux Guide are hidden AND access is denied for non-admins; direct tab/navigation attempts must fail.
- Verify state migrations from old versions retain progress and normalize missing/invalid fields without overwriting valid saved values. Check save revision, cloud hydration, conflict scenarios and account isolation.

## 4. Navigation, UI, accessibility and offline shell
Current navigation: Quest Board, Character, Store, Skills, To Do, Groceries, Journal, Settings, plus Admin-only Reflux Guide and Debug. Verify every tab opens, lazy-loads once, renders after switching, returns correctly, respects signed-out and admin gates, and remains functional after refresh.
Test 375px/430px mobile safe areas, touch target sizes, scroll, fixed headers, long names, dynamic text, keyboard focus, labels, modal close/escape, confirmation prompts, disabled states, no overlap or horizontal overflow, and portrait/background readability. Check PWA install/update, online/offline shell, stale cache, version changes and recovery from partial asset failures. Do not imply Supabase cloud writes work offline unless observed.

## 5. Skills: catalog, progression and weekly main/side scheduling
- Confirm catalog categories and all registered skills including Piano and Guitar; selection/deselection, duplicate prevention, skill XP and levels, empty selection, maximum selections if constrained, migration and save persistence.
- Weekly scheduler: each selected skill has Monday–Sunday toggles; none means Side Quest every day, all means Main Quest every day, mixed schedules (Monday/Thursday/Sunday) classify correctly. Multiple skills may be main on one day. Change days rapidly; refresh, sign out/in, reload and cross-device check.
- Compute weekday from the *04:00 Europe/Amsterdam quest cycle date*, not local device day. Test Monday, Sunday, before/at/after 04:00, DST spring-forward and autumn fallback, simulated Debug date if available, and background-tab wake.
- Legacy migration: old Priority skills become seven main days; Secondary become zero. Do not reset existing XP, selections, inventory or completed history. New skill selection gets a sane default without overriding explicit zero-day schedule.
- Main/Side classification must update immediately in Quest Board when changing schedule; no quest duplication, accidental completion reset or extra rewards.

## 6. Quest Board, generation, completion and anti-exploit
- First login, initial automatic generation, 04:00 Amsterdam daily rollover, midnight non-rollover, stale session recovery (focus/pageshow/visibility), offline/reconnect, empty skill set and Sandbox Time Machine. Unfinished prior-day generated quests disappear; earned XP/gold remain.
- Selecting a skill immediately adds exactly one generated quest; deselecting removes only that skill's generated quest, not unrelated manually created or standalone Adventure quests. Reselecting an unfinished skill creates an appropriate quest without multiplying cards.
- After finishing a generated quest, deselect/reselect must NOT create another quest for that skill in the same quest cycle. Repeat 20 rapid toggles, refresh, sign out/in, switch tabs, use two authorized sessions, alter weekday toggles, change time, and check no duplicate rewards. The completion ledger survives all same-day operations and allows a fresh quest only next cycle.
- Test completion confirmation, cancel, completion animation, double-tap, retry, concurrent clicks, invalid IDs, quest history/anti-repeat, generated title selection, missing pool and fallback, estimated time, energy/focus/place and Main/Side display.
- Manual Generate Quests and campaign planner must be restricted to authorized Admin Sandbox (not normal accounts); legacy cooldown/override controls must not reappear. Test normal-user denial, admin normal-mode denial, Sandbox allowed path, and automatic generation unaffected.
- Standalone Adventure generation, rewards and any quest-specific rules must remain functional; verify no custom/adventure quests are unintentionally purged on skill deselection.
- Snapshot XP/gold at generation: switching theme/artifact after quest creation must not retroactively alter that quest's rewards. Test rounding, skill-level scaling and negative/invalid inputs.

## 7. Character, progression, inventory and equipment
- Verify overall XP/level, skill XP/level, gold, character portrait and gender selection; level thresholds and skill-level quest bonuses including the documented 2/1/0.5 progression and cap.
- Inventory shows owned themes and artifacts once, correct levels, icons and ownership after reload. Equip/unequip each category independently; equipped theme changes portrait/background/music, artifact occupies separate slot, and both persist.
- Verify equipment invalid/removed-item fallback, switching male/female portrait, reloading and cross-account isolation. No phantom owned items or duplicate purchases.
- Verify Starter Dungeon and any special Mastery behavior. Test equipment and quest reward snapshots in both normal and Sandbox modes.

## 8. Store: themes, artifacts and pets
- Themes: display permanent theme name and Level 0/5 through 5/5; one-tier Mastery displays 0/1 or 1/1. Next upgrade shown separately. Maxed themes remain visible, marked Max, cannot charge again. Check locked, affordable, unaffordable, eligible, already owned, max level, double-click and refresh.
- Standard skill-theme base: unlock at skill level 3, price 100; upgrade levels 2–5 at skill levels 8/13/18/23, prices 200/300/400/500. Bonuses: +5 matching-skill XP per theme level and +2 matching-skill gold per upgrade above level 1. Verify actual registry exceptions rather than forcing a standard rule on special themes.
- Mastery (saved ID `bloodthirst-theme`): any skill level 5, cost 300, one tier, +2 XP and +2 gold globally; do not offer duplicate purchase.
- All registered themes: Adventurer, Academy, Social Butterfly, Heartkeeper, Faith/Orthodox, Roman Discipline, Mozart's Salon, CEO, Spartan Endurance, Andalusian Serenade, Mastery and starter Dungeon. Use actual registry for exact display names and IDs.
- Artifacts: 10 registered items including The Serenader's Guitar. Display Level 0/3–3/3, skill requirement 6/15/25, prices 150/250/400; own skill bonuses +3/+6/+12 XP and gold. With matching theme equipped, add +1/+2/+4 XP and gold to every skill including its own. Test matching and mismatched combinations, upgrades, gold deduction, locked and maxed states.
- Pets: verify current empty state and no phantom purchases unless a pet registry has actually been introduced. Verify Store gold balance and UI refresh after purchases, refunds (if any), Sandbox grants and reload.

## 9. Theme assets, music and artifact artwork
For each theme registered in `codes/theme-registry.js`: verify store icon, desktop/mobile background, male/female full-body portrait, body CSS palette, responsive contrast, dedicated soundtrack path, music start/pause/stop/switch, mute and persisted volume, audio permission handling, offline/cache behavior and no broken requests. Check Dungeon fallback and Mastery legacy ID.
For each artifact registered in `codes/artifact-service.js`: visually verify artwork matches its name (not merely HTTP 200), Store card, Character inventory and equipment slot. Test matching-theme synergy at levels 1, 2, 3; test reward snapshot and no effect on unrelated quest rewards when unmatched. Specifically cover Andalusian Serenade's six media assets and Sonican Spanish Guitar Solo; preserve licensing/source metadata and avoid claiming copyright clearance from audio playback alone.

## 10. To Do, Groceries, Journal and Settings
- To Do: create/edit/complete/uncomplete/delete entries, duplicate names, empty and long text, ordering, persistence, rapid edits, reload, account isolation and Sandbox exit.
- Groceries: add/edit/check/uncheck/remove items, quantity/notes if supported, duplicate items, empty lists, long strings, persistence, account isolation and Sandbox exit.
- Journal: create/edit/save/delete entries as supported, multiline text, special characters, empty/long entries, date handling, persistence and account isolation.
- Settings: signed-in/out copy, sound/music controls, gender/profile settings, account/cloud save status, sign-out and reset confirmations where authorized. Verify changes reflect immediately in other tabs, survive refresh and do not cross accounts. Test only controls actually present in the current source.

## 11. Admin-only Reflux Guide and dated diary
Verify non-admin denial and admin navigation. Read-only food guidance should render without unintended writes. Test dated morning/afternoon/evening diary entries, explicit Did/Didn't/Not logged habits, symptom severity, catch-up dates, previous-bedtime eating question, following-morning attribution, End Day confirmation, partial/missing answers, correction, legacy history separation, weekly comparisons and date boundaries. Never fabricate symptom history or imply correlation proves causation. Confirm cloud save, reload, Sandbox isolation and no exposure to another account.

## 12. Debug, diagnostics and Sandbox isolation
- Verify Debug visible only to authorized admin. Enter Sandbox; test XP/gold grants, skill levels, reset, theme/artifact grants and independent selectors (themes 1–5, artifacts 1–3), inventory ownership, equipment, purchase costs and diagnostics.
- Test Time Machine day shift and simulated 04:00 quest rollover without modifying live account; XP Lab edits persist across supported Sandbox reloads. Debug grant toggles and selectors should reflect persisted Sandbox state.
- Confirm Sandbox status survives refresh if designed to; exit restores original live account completely. Verify every save, reward, event handler, cloud sync and UI render path honors Sandbox isolation. Run failed purchase, insufficient gold, locked item, duplicate purchase, fault injection and diagnostic recovery paths.
- Diagnostics must include all current themes and artifacts, correct special Mastery unlock, equipment lifecycle and reward snapshot checks; PASS/FAIL must reflect real observed behavior rather than injector flags or hardcoded expectations.

## 13. Security, robustness, performance and compatibility
Test malformed/legacy saves, missing fields, empty inventory, large lists, unicode/HTML-like user text (must escape safely), failed network, expired session, repeated navigation, back/forward, double clicks, slow CPU, offline/online transition, multiple tabs and cache updates. Check for uncaught exceptions, memory leaks from duplicate listeners, stale rendered data, unexpectedly expensive work and audio continuing after theme change. Verify no credentials in logs and no unauthorized admin actions.

## 14. Required test execution strategy
A. **Smoke:** app loads; sign in; all allowed tabs; selected skill quest; one completion; Store; Character; save/reload; sign out. No critical console/network failures.
B. **Feature matrix:** execute all sections above from a clean test account with positive, negative and boundary cases; use Admin Sandbox for costly levels, grants and destructive flows.
C. **State transitions:** test fresh install, legacy save migration, logged-in reload, multi-tab, slow cloud hydration, Sandbox enter/reload/exit, 04:00 rollover and DST.
D. **Change-focused regression:** for every changed module, test direct functionality plus all dependent modules. A change in quest role must retest Skills, Quest Board, completion ledger, save/cloud and Debug; a theme change must retest Store, Inventory, Character, audio, assets, rewards and Sandbox.
E. **Final independent pass:** fresh browser with cleared/stale service-worker cache, production version check, repeat smoke, confirm no test artifacts or unintended production changes.
If automation is available, prefer repeatable browser scripts for critical paths, but also manually inspect visual and audio behavior. Never fake time passing in production; use authorized Sandbox simulation or deterministic unit tests and label the method.

## 15. Reporting, severity and release gate
Every test case: ID, area, scenario, preconditions, exact steps, expected outcome, observed outcome, environment, evidence and PASS/FAIL/BLOCKED/NOT TESTED/INCONCLUSIVE. Every bug: unique ID, severity, affected version/commit, reproducible steps, expected vs actual, screenshots/logs, relevant code path, likely root cause, recommended minimal fix, regression risks and retest result. Severity: Critical (data loss/security/cross-account contamination), High (core flow broken/duplicate rewards), Medium (feature malfunction), Low (cosmetic/copy). Mark suspected root causes as hypotheses.

Deliver: executive summary; full test matrix; pass/fail/blocked counts; prioritized bug list; source-level analysis; account/Sandbox isolation evidence; mobile screenshots; asset/network/console summary; release readiness and untested risks; suggested fix order. Never mark a test PASS solely on code inspection, syntax validation, or an earlier release's report. Do not edit code during an audit unless explicitly authorized. If critical/high defects remain or account isolation/persistence cannot be verified, state release risk clearly and do not certify the release as fully tested.

## 16. v3.1.19 targeted regression gates (WF-317-001/002/003)
- WF-317-001: Existing selected Adventure/Piano profile opens Skills without a console exception, shows all seven weekdays, and retains selections. Selecting Guitar immediately creates exactly one generated quest. Deselecting Guitar while Adventure remains selected removes Guitar's generated quest but keeps Adventure's; reselect unfinished Guitar restores one quest.
- WF-317-002: With two saved selections, simulate catalog-render failure or empty catalog markup; pressing Save must preserve both selections, XP, schedules and board, and must not show a false success toast. Deliberately deselecting all through working controls must still clear only generated quests. Reload and check persistence.
- WF-317-003: In authorized Sandbox, advance +1 day twice; each activeDate and lastDailyQuestCycle must advance monotonically. A Wednesday-only skill must appear Main on simulated Wednesday, Side on Thursday. Complete, deselect and reselect on simulated Wednesday: no duplicate; next simulated day may generate fresh quest. Normal mode must ignore Sandbox simulated dates and retain 04:00 Amsterdam DST-safe rollover.
- Test all above with empty and legacy accounts, 0/3/7 weekdays, rapid toggles, reload, mobile 375/430px and error logs. Keep separate static and real-browser evidence.

## 17. Mandatory update checklist for future maintainers
On EVERY Wayfarer update: [ ] read live main + all applicable rules; [ ] inspect new/removed UI, tabs, data fields and registries; [ ] update this file's version/date; [ ] revise scenarios and expected behavior; [ ] add boundary/negative/regression tests for changed behavior; [ ] confirm privacy/Sandbox/legacy migration coverage; [ ] align release identifiers and top CHANGELOG entry; [ ] run static checks; [ ] run accessible real-browser tests or explicitly report blockers; [ ] verify main commit and deployed build separately. Documentation-only releases must also complete the review and version/changelog/cache steps.
