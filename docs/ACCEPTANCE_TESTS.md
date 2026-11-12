# NXTGENCODERS acceptance test matrix

## Authentication and authorization

- [ ] Signup requires valid email, 8+ character password, display name and unique username.
- [ ] Email verification callback creates a session.
- [ ] Blank domain configuration results in `pending`; approved domains result in `approved`.
- [ ] Pending users cannot publish, vote or comment.
- [ ] Students cannot change `role`, `approval_status`, points or streak columns.
- [ ] `/admin` redirects students and moderators.
- [ ] Admin role changes and approvals appear in `audit_logs`.

## Ideas

- [ ] Publishing validates every required field and attachment MIME/size.
- [ ] An open competition is assigned server-side; the client cannot choose one.
- [ ] Similar/remixed ideas preserve `remix_of` attribution.
- [ ] Upvote, downvote, switch and remove produce exactly one active vote.
- [ ] Self-voting is rejected by PostgreSQL.
- [ ] Vote changes are rate-limited and expired competitions reject votes.
- [ ] Threaded comment create/edit/delete follows ownership RLS.
- [ ] Useful-comment votes cannot be duplicated or self-cast.
- [ ] Bookmark state is private to the owner.
- [ ] Reports enter the moderation queue.

## Arena

- [ ] Only admin can create or advance a cycle.
- [ ] Submission/voting dates satisfy start < submission < voting.
- [ ] Advancing voting freezes exactly the current top three (or fewer if fewer entries).
- [ ] Frozen score and discussion totals remain historical.
- [ ] Only a frozen finalist can be selected.
- [ ] Vote count does not automatically choose the winner.
- [ ] Winner records reason, announcement, selector and timestamp.
- [ ] Winner selection creates one official recruiting project and project lead.
- [ ] Archived cycles reject submissions/votes.

## Problem board

- [ ] Problem author can receive multiple solution proposals.
- [ ] Solution votes are unique and reject self-votes.
- [ ] Students can discuss solution limitations.
- [ ] Only problem author or staff can accept a solution.
- [ ] Accepting one proposal unaccepts any prior proposal and awards activity-derived credit.
- [ ] Volunteer uniqueness is enforced per problem/user.

## Projects

- [ ] Duplicate join requests are rejected.
- [ ] Only leader/admin sees all pending requests and can decide.
- [ ] Approval inserts an active member and creates a notification.
- [ ] Active members can create tasks and updates; outsiders cannot.
- [ ] Public users can see overview, milestones and updates but not internal tasks.
- [ ] Realtime refresh reflects new project updates.

## Privacy, reliability and UX

- [ ] Empty database shows zeros and explicit empty states—no fabricated activity.
- [ ] Attachments over 5 MB or outside allowed MIME types fail.
- [ ] Notifications are owner-only and mark-all-read updates only that owner.
- [ ] Keyboard focus is visible across navigation, forms and dialogs.
- [ ] Desktop sidebar and mobile navigation have no broken routes.
- [ ] Loading, error, not-found and setup states render correctly.
- [ ] `/api/health` reports `connected` only after a successful database query.
- [ ] `npm run typecheck` and `npm run build` pass.
