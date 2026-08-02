# Collaboration frontend API contract

The frontend calls the cookie-authenticated `/v1/admin` API through `NgoApi`. Mutations include `X-CSRF-Token`, validation errors use the shared JSON error envelope, and versioned writes can return `409`.

## Tasks

- `GET /admin/tasks?page&limit&q&status&priority&due&sort&direction` returns `{ items,total,page,limit,pages,kpis }`. KPI keys are `total,new_count,in_progress_count,blocked_count,done_count,overdue_count`.
- Task representations include `id,title,description,status,priority,progress,version,scheduled_at,due_at,due_state,assignees[],regions[],watchers[],labels[],discussion_thread_id,allowed_actions[]`.
- `GET /admin/tasks/:id` returns `{ item }`.
- `GET /admin/tasks/:id/events?limit` returns `{ items }`.
- `GET /admin/tasks/labels`, `GET /admin/messages/users`, and `GET /public/regions` supply editor choices. There is no task-options endpoint.
- `POST /admin/tasks` and `PATCH /admin/tasks/:id` accept task fields plus `assignee_user_ids`, `region_codes`, `watcher_user_ids`, `label_ids`, `scheduled_at`, and `due_at`. Updates include `version`.
- A status transition is a versioned `PATCH /admin/tasks/:id` with `status`; transitions to `blocked` and `done` also require `blocked_note` and `completion_note`, respectively.
- `POST /admin/tasks/:id/watch` accepts `{ watch }`; super admins can archive with versioned `PATCH /admin/tasks/:id` and `{ archived:true }`.
- The task Files panel is derived from attachments on the task's discussion messages. Tasks do not expose a standalone `attachments` field.

## Messaging

- `GET /admin/messages/users` returns `{ items }` containing authorized conversation candidates.
- `GET /admin/messages/threads?limit` returns `{ items }`; threads include `id,type,title,task_id,participants,last_body,last_created_at,unread_count,allowed_actions`.
- `POST /admin/messages/threads` accepts `{ type:'direct',recipient_user_id }` or `{ type:'group',title,participant_user_ids }`.
- `GET /admin/messages/threads/:id?limit&before_id&after_id&q` returns `{ items,total,next_before_id,next_after_id }`.
- Messages include `id,thread_id,body,sender_user_id,sender_name,created_at,edited_at,deleted_at,version,mine,reply_to_message_id,attachments[],read_by[],allowed_actions[]`.
- `POST /admin/messages/threads/:id` accepts `{ body,reply_to_message_id,client_message_id,attachments }`; `client_message_id` is a UUID and `attachments` contains private upload paths.
- `POST /admin/messages/threads/:id/read` accepts `{ message_id }`.
- `POST /admin/messages/threads/:id/presence` accepts `{ is_typing }`.
- `PATCH /admin/messages/:message_id` accepts `{ body,version }`; `DELETE /admin/messages/:message_id` deletes a message; `GET /admin/messages/:message_id/revisions` returns edit/delete history.
- `POST /admin/collaboration/upload` accepts one multipart `file` and returns `{ path,upload_id,mime,size }`.
- `GET /admin/collaboration/attachments/:attachment_id` returns an authenticated binary response.
- Supported attachment types are JPEG, PNG, WebP, GIF, MP4, WebM, OGG, PDF, DOCX, and XLSX.
- `GET /admin/collaboration/events?bootstrap=1` returns the current recipient cursor without replaying retained history. Subsequent `GET /admin/collaboration/events?after_id&limit` calls return `{ items,cursor,retry_after_ms }`.
- Event types consumed by the client are `message.created`, `message.updated`, `message.deleted`, `thread.updated`, `thread.read`, and `presence.changed`. A bootstrap is followed by thread/current-message reconciliation so events created after the cursor are picked up by the next poll.

Authorization, participant membership, regional isolation, upload ownership, and attachment access are enforced by the API independently of the UI.
