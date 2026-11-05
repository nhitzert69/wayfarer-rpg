# Wayfarer Artifact Rules — v3.1.5

- Nine artifacts, one each for Adventure, Reading, Social Interactions, Relationships, Orthodox Christianity, Fitness, Piano, Business and Cardio. No Dungeon or Mastery artifact.
- Each artifact uses a separate equipment slot; exactly one artifact may be equipped at once, independently of the theme and pet.
- Sequential purchases: level 1 at skill level 6 for 150 gold; level 2 at skill level 15 for 250 gold; level 3 at skill level 25 for 400 gold. Reject invalid, duplicate, unaffordable or premature purchases.
- Equipped artifact gives its own skill +3/+3 XP/gold at level 1, +6/+6 at level 2, +12/+12 at level 3. Matching theme additionally gives all skills (including its own) +1/+1, +2/+2 or +4/+4 XP/gold, respectively. No global synergy for nonmatching themes.
- Snapshot rewards when quests are generated. Never recalculate an existing quest after equipping, upgrading or switching themes. Existing account progress, Supabase, Sandbox, inventory, theme and pet features must be preserved.
- Asset filenames `artifact-01.png` to `artifact-09.png` were numbered before visual identification. The proposed skill-to-image mapping by number remains provisional until actual images are inspected. Do not claim visual identity confirmed.
- Test Store, Inventory, equipment, quest rewards, refresh/persistence, Sandbox isolation, and asset decoding before marking complete.

## Debug artifact levels — v3.1.7
- Admin Sandbox Get All Items grants every artifact at the independently selected level 1, 2, or 3, default 3. The theme selector remains independent (1–5).
- Changing the artifact selector while Unlock All Items is active immediately updates the temporary Sandbox inventory. Disabling the grant restores the pre-Sandbox live-owned artifacts; no live Supabase progress is modified.
