WAYFARER — REAL-LIFE RPG (working prototype)

Files:
- index.html: responsive app, quest board, XP/levels, character attributes, journal, settings, backup import/export
- manifest.json: installable web app metadata
- sw.js: basic offline cache

Try it locally:
1. Unzip the folder.
2. Open index.html in a modern browser. Core features should work, although PWA installation/offline features require hosting over HTTPS (or localhost).
3. Progress is saved in that browser on that device using localStorage.

To add to iPhone Home Screen:
1. Host these files on an HTTPS static host (for example GitHub Pages, Netlify, or Cloudflare Pages).
2. Open the hosted URL in Safari.
3. Tap Share > Add to Home Screen.

Important:
- This prototype has no account or cloud sync; browser data is local to the device.
- Export Backup regularly if you want a portable copy of progress.
- AI-generated quests, cross-device sync, push notifications, and real authentication are not included yet.
- This is an initial working prototype; test and refine it before relying on it as your only record.
