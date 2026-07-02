# NGO.uz Project Memory

This file stores non-secret project context for future Codex sessions.

## Deployment Split

- The public frontend is deployed from this GitHub/Cloudflare-side repo.
- Public API calls use `https://ngo-api-proxy.sarvsop.workers.dev/v1`.
- The Cloudflare Worker in `worker/src/index.js` proxies upstream to `http://api.ngo.uz`.
- The real PHP API backend is hosted on `hosting.st.uz` under `www/api.ngo.uz`.
- The old/public PHP site on hosting is under `www/ngo.uz`; do not assume frontend-only changes cover backend CMS behavior.

## Admin Ownership

- `/visual-admin` owns public website content editing.
- `/admin-dashboard` should not duplicate public CMS modules moved to `/visual-admin`.
- `/nntlar` registry data is managed in `/admin-dashboard` / superadmin, not `/visual-admin`.
- Big operational workflows such as membership applications, payments, registry cards, E-IMZO signing, logs, notifications, backups, and exports belong to the internal admin/cabinet backend rather than static page editing.
- `/cabinet` login is phone + password. Public users do not self-create passwords: they request access by selecting an existing registry organization from autocomplete and entering a phone number. The request routes to the organization's regional admin; on approval the admin sees a one-time generated password to send to the requester.

## Visual Admin Content Storage

- Visual Admin static-page overrides are Cloudflare-side.
- News, events, grants, and official documents are database/API-backed content from `api.ngo.uz`.
- Media uploads for CMS content go through the hosted PHP API upload endpoint.
- As of 2026-06-30, news/events/grants/documents support `media_gallery` for multiple images/videos in addition to `cover_image`.

## Hosting Backend Notes

- Backend framework is plain PHP 5.6-compatible code under `www/api.ngo.uz`.
- Key backend files:
  - `controllers/AdminContentController.php`
  - `controllers/PublicController.php`
  - `controllers/UploadController.php`
  - `routes.php`
  - `migrate.php`
  - `migrations/`
- Do not store or print hosting, database, Cloudflare, or E-IMZO credentials in repo files.
