# NNT Cabinet Portal Scope (Step 1)

## Goal
Separate member/subscriber portal for NGOs (`cabinet.ngo.uz`) with private content and workflows that are not public.

## Primary roles
- `member_user`: NGO operator (submits reports, tracks applications, joins events)
- `member_manager`: NGO leader (approvals, legal confirmations)
- `portal_moderator`: support team (limited support tools, not full admin)

## Core modules (MVP)
1. `Auth & Profile`
- Login, password reset, profile, organization card

2. `My Organization`
- Organization details, legal docs, status, renewal dates

3. `Applications`
- Membership application history, requests, statuses, comments

4. `Reports`
- Upload reports, draft/save, status timeline, return reasons

5. `Member-only Events`
- Private events feed, invitations, RSVP, attendance history

6. `Notifications Center`
- Targeted messages (only for selected NGOs/segments)

7. `Documents Vault`
- Private files, downloadable templates, signed docs

## Phase 2 modules
- E-signature integration (ERI)
- Billing/subscription (if needed)
- Murojaat/support chat
- Mobile app API profile

## Suggested first screens to build
1. `cabinet-login.html`
2. `cabinet-dashboard.html`
3. `cabinet-events.html` (private events)
4. `cabinet-reports.html`
5. `cabinet-notifications.html`

## Data objects to plan early
- `User`
- `Organization`
- `MembershipApplication`
- `ReportSubmission`
- `PrivateEvent`
- `Invitation`
- `Notification`
- `Document`

## Non-functional requirements
- RBAC by role
- Audit log for sensitive actions
- File validation + antivirus scanning in backend
- Privacy/consent/legal pages mapped to portal forms
- Uzbek/Russian/English language support
