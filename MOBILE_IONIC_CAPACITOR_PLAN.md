# NGO.uz Member App: Ionic + Capacitor Plan

Target: Android + iOS app for a'zo NNT users, built with Ionic + Capacitor, not Flutter.

## Existing System

- Live frontend repo: `sarvsop-crypto/ngouz`, deployed to Cloudflare Pages project `ngouz`.
- Live domains: `www.ngo.uz` on Cloudflare Pages, `api.ngo.uz` on SHARQ TELEKOM hosting.
- API proxy currently used by the web frontend: `https://ngo-api-proxy.sarvsop.workers.dev/v1`.
- API backend: PHP 5.6 application in `/Users/sarvarbeksoporboyev/work/ngouz-audit/api`.
- Member web cabinet source: `/cabinet/*.html` and `/cabinet/js/*.js`.
- Existing Flutter prototype: `nntma_subscriber_app`, should be ignored for this app path.

## Mobile App Shape

Build a real Ionic app that consumes the JSON API directly. Do not wrap the existing cabinet HTML in a WebView.

Recommended stack:

- Ionic React or Ionic Vue with TypeScript.
- Capacitor for Android/iOS shells.
- `@capacitor/preferences` for token/user persistence.
- `@capacitor/filesystem` and native file picker plugin for reports/documents.
- Optional `@capacitor/push-notifications` after backend push token support exists.

## API Base

Short term:

- Use `https://ngo-api-proxy.sarvsop.workers.dev/v1` because `api.ngo.uz` has TLS verification issues in browser-like clients.

Long term:

- Fix the certificate for `api.ngo.uz`, then switch the app to `https://api.ngo.uz/v1`.
- Add native WebView origins to CORS if using browser fetch:
  - `capacitor://localhost`
  - `ionic://localhost`
  - `http://localhost`
  - `http://localhost:*` for development where applicable

## Auth Contract

Login uses a mobile bearer-token flow already implemented:

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "998901234567@phone.ngo.uz",
  "password": "...",
  "client": "mobile"
}
```

Response includes:

- `token`: 64-character session id, sent later as `Authorization: Bearer <token>`.
- `expires_at`: 30-day expiry.
- `user`: includes `id`, `email`, `full_name`, `role`, `organization_id`, `status`.

Phone registration flow:

- `POST /v1/auth/verify-phone`
- `GET /v1/public/organizations?q=<search>&limit=10`
- `POST /v1/auth/register`

Important behavior:

- Registered member users are created with `status = pending`.
- Login only works when user status is `active`.
- Approval is handled through admin membership requests.

## Member Screens

Use these web cabinet pages as product reference, but rebuild as Ionic screens:

- Login: `cabinet/cabinet-login.html`
- Register: `cabinet/cabinet-register.html`
- Dashboard: `cabinet/cabinet-dashboard.html`
- Organization profile: `cabinet/cabinet-organization.html`
- Application status: `cabinet/cabinet-applications.html`
- Reports: `cabinet/cabinet-reports.html`
- Documents: `cabinet/cabinet-documents.html`
- Events: `cabinet/cabinet-events.html`
- News: `cabinet/cabinet-news.html`
- Notifications: `cabinet/cabinet-notifications.html`
- Grants: `cabinet/cabinet-grants.html`
- Support/contact: `cabinet/cabinet-support.html`
- Settings/security: `cabinet/cabinet-settings*.html`

## API Endpoints To Reuse

Public:

- `GET /v1/public/news`
- `GET /v1/public/news/{id}`
- `GET /v1/public/events`
- `GET /v1/public/events/{id}`
- `GET /v1/public/grants`
- `GET /v1/public/grants/{id}`
- `GET /v1/public/documents`
- `GET /v1/public/documents/{id}`
- `GET /v1/public/organizations`
- `GET /v1/public/organizations/{id}`
- `GET /v1/public/regions`
- `POST /v1/public/contact`

Member:

- `GET /v1/me`
- `POST /v1/auth/logout`
- `POST /v1/auth/change-password`
- `GET /v1/cabinet/dashboard`
- `GET /v1/cabinet/organization`
- `PATCH /v1/cabinet/organization`
- `GET /v1/cabinet/reports`
- `POST /v1/cabinet/reports`
- `GET /v1/cabinet/notifications`
- `POST /v1/cabinet/notifications/mark-read`
- `POST /v1/cabinet/notifications/{id}/mark-read`
- `GET /v1/cabinet/membership`
- `POST /v1/cabinet/membership`

## Backend Gaps Before Mobile Release

1. Member file upload is broken by role design.

   Current web cabinet calls `POST /v1/admin/upload` for reports/documents, but `UploadController` requires `regional_admin`. A normal `member_user` cannot upload. Add a member-safe upload endpoint such as `POST /v1/cabinet/upload` that accepts report/document files for the user's own organization only.

2. Document list is currently mostly UI-only.

   `cabinet-documents.html` can upload a file but there is no member document table in the API similar to reports. Decide whether documents are just report attachments or a separate table/workflow.

3. `api.ngo.uz` TLS needs fixing.

   Direct HTTPS works only with certificate verification disabled from this machine. Native apps should not ship with disabled TLS verification. Fix Let's Encrypt/cert chain for `api.ngo.uz`.

4. CORS/native origins need updating if the app uses browser fetch.

   Add Capacitor origins to both PHP config and Worker CORS allow-list, or use Capacitor native HTTP.

5. Push notifications are not implemented.

   Current notifications are pull-based from `/v1/cabinet/notifications`. For real mobile notifications, add device token registration and a push provider.

## First Implementation Milestone

Build MVP with these screens:

1. Auth: login, register, password change.
2. Dashboard: organization summary, notification count, upcoming events.
3. Organization: view/update phone, email, website, address.
4. Membership: application status/history.
5. Reports: list and create report, after adding member upload endpoint.
6. Notifications: list and mark read.
7. Public feed: news, events, grants.

## Local Scaffold Direction

Create the app outside the current static Pages root or under a clearly isolated folder such as `mobile-app/`.

Suggested commands after tooling is allowed:

```bash
npm create ionic@latest mobile-app -- --type=react --capacitor
cd mobile-app
npm install @capacitor/preferences @capacitor/filesystem
npm run build
npx cap add android
npx cap add ios
```

Keep the Cloudflare Pages site and mobile app build/deploy separate. The mobile app should call the same API, not be deployed as part of the static website.
