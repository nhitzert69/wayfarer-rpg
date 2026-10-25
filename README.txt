WAYFARER v44 — CLOUD ACCOUNTS

The app is still a static GitHub Pages website. Cross-device cloud saves require a Supabase project that you own. This ZIP includes the account UI, Supabase client integration, and SQL schema, but it is NOT connected to a live database until you configure your project below.

SETUP (one time)
1. Create a project at https://supabase.com/.
2. In Supabase Dashboard > Authentication > Sign In / Providers, enable Email authentication and turn OFF email confirmations. Wayfarer uses a synthetic internal email alias based on the username because Supabase Auth securely hashes credentials and issues sessions. No actual email is sent or needed; account recovery is not available with username + PIN alone.
3. In Project Settings > API, copy the Project URL and the publishable/anon key.
4. Open index.html and find the WAYFARER CLOUD CONFIG section near the bottom. Replace YOUR_SUPABASE_PROJECT_URL and YOUR_SUPABASE_ANON_KEY with your own values. Never use a service_role key in the website.
5. In Supabase > SQL Editor, run the complete contents of supabase-schema.sql. This creates a save table with row-level security so each authenticated account can access only its own saved state.
6. Commit the updated project files to the root of your GitHub repository. Keep supabase-schema.sql in the repo for your records; it is not required by the browser.

ACCOUNT USE
- Choose a username (3–20 letters, numbers, underscores, or hyphens) and an 8-digit numeric PIN.
- Use the same username and PIN on each device.
- On first account creation/sign-in, if no cloud save exists, the current device's local progress is uploaded.
- If a cloud save already exists, that cloud save is loaded onto the device.
- Once signed in, app changes are saved locally and synchronized to the cloud.
- Use “Sign out” before sharing the device.

SECURITY NOTES
- Supabase Auth handles password hashing and session management; the PIN is never stored in the Wayfarer database table as plaintext.
- Use an 8-digit PIN at minimum; a longer random numeric PIN is safer. A numeric PIN is weaker than a strong password, so do not reuse a banking or phone-unlock PIN.
- Supabase Auth applies its own rate limits. Do not expose a service_role key in index.html.
- Username + PIN has no recovery channel. If forgotten, you may lose access to that cloud account. Consider a recovery method later if needed.
- Cloud save sync is last-write-wins; avoid editing the same account simultaneously on multiple devices.
- Existing local data is not deleted by signing in or signing out. Keep a backup of the current app data before major changes.
