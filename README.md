# NXTGENCODERS

**THINK IT. SHARE IT. BUILD IT.**

A production-oriented innovation and collaboration network for NIAT students. NXTGENCODERS combines idea review, monthly competitions, a real-world problem board, official project workspaces, contribution-based rankings, achievements, notifications, and protected moderation.

> This repository contains no fake users, votes, comments, competition results, or community statistics. Empty states stay honest until the database receives real activity.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS with reusable shadcn-style primitives
- Framer Motion and Lucide icons
- Supabase Auth, PostgreSQL, Storage, Realtime, and Row Level Security
- Vercel deployment configuration

## Implemented routes

| Route | Purpose |
|---|---|
| `/` | Live database-backed home dashboard |
| `/login`, `/signup`, `/forgot-password` | Authentication and recovery |
| `/explore` | Searchable/filterable idea feed |
| `/ideas/new`, `/ideas/[id]` | Idea publishing, voting, bookmarks, remixing, threaded discussion, reporting |
| `/problems`, `/problems/new`, `/problems/[id]` | Problem posts, proposals, solution votes/discussions, acceptance, volunteering |
| `/arena`, `/arena/[id]` | Current cycle, live rankings, frozen finalists, winner and archive |
| `/projects`, `/projects/[id]` | Project hub, applications, team approvals, tasks, milestones and build updates |
| `/leaderboard` | Weekly/monthly/all-time contribution ranking |
| `/notifications` | Read/unread notifications with Realtime refresh |
| `/profile/[username]` | Student work, skills, badges and project history |
| `/settings` | Profile, links, skills, password and account controls |
| `/search` | Global discovery across ideas, problems, projects and profiles |
| `/admin` | Protected competition, approval, roles, reports, announcements, categories and project controls |

## 1. Local installation

Requirements: Node.js 20.9+ and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase variables the app deliberately starts in **setup mode**: the visual system and public empty states render, while data-mutating actions explain that the backend is not configured.

## 2. Environment variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Comma-separated, verified official domains only. Never invent a domain.
# Leave blank to use admin-approved registration.
NIAT_ALLOWED_EMAIL_DOMAINS=

# Optional and server-only. Not required by the web application.
# Use only for controlled maintenance scripts. Never expose it client-side.
SUPABASE_SERVICE_ROLE_KEY=
```

The publishable key is designed for browser use and is constrained by RLS. A legacy anon key remains supported as an optional compatibility fallback. The service-role key must never use a `NEXT_PUBLIC_` prefix and should not be added unless an operational script genuinely needs it.

## 3. Supabase database setup

### With the Supabase CLI

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### With the SQL editor

Run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_security_and_collaboration.sql`
3. `supabase/migrations/003_simple_posting.sql`
4. `supabase/migrations/004_public_problem_comments.sql`
5. `supabase/migrations/005_storage_buckets_and_realtime.sql`

The migrations create:

- All requested normalized product tables plus milestones, categories, audit logs, contribution events, solution comments and rate-limit ledgers.
- Foreign keys, checks, unique vote constraints, search/feed indexes and immutable competition history.
- RLS on every user/content/operations table.
- Secure RPCs for idea/comment/solution votes, accepted solutions, competition advancement, winner selection, role changes and project application review.
- Trigger-derived contribution points and achievement awards.
- Notification triggers for discussion, accepted solutions, project activity and competitions.
- A compatibility `attachments` bucket plus dedicated `avatars`, `idea-attachments`, `problem-attachments`, and `project-assets` buckets with ownership, membership, MIME, and size restrictions.
- Selective Realtime publication for comments, notifications, project activity, vote updates, and competition changes.

### Auth URL configuration

In **Supabase → Authentication → URL Configuration**:

- Site URL: your production Vercel URL
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR_DOMAIN/auth/callback`
  - `http://localhost:3000/settings`
  - `https://YOUR_DOMAIN/settings`

Enable email confirmation. Do not disable verification in production.

## 4. Bootstrap the first admin

Roles can never be self-assigned. Create and verify the first account, then run this once in the Supabase SQL editor (replace the email exactly):

```sql
update public.profiles
set role = 'admin', approval_status = 'approved'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

After that, use `/admin` for approvals and role management. Role changes are server-authorized and audited. Do not add a public “become admin” flow.

## 5. Registration policy

- If `NIAT_ALLOWED_EMAIL_DOMAINS` contains verified domains, signup accepts only those domains and verified accounts are approved.
- If it is blank, signup still requires email verification, but new profiles remain `pending` until an admin approves them.
- No NIAT domain is assumed or hardcoded.

## 6. Security model

- Vote totals, comment totals, ranks and leaderboard points are derived in PostgreSQL, never accepted from the client.
- One vote per user/entity is enforced by composite primary keys.
- Authors cannot vote on their own ideas, comments or solutions.
- Competition vote RPCs reject frozen/expired cycles.
- Ranking freezes preserve top-three scores and discussion counts.
- Winner selection requires an admin and one of the frozen finalists; selecting a winner creates the official recruiting project transactionally.
- Profile triggers prevent self-promotion or client-authored contribution points.
- Project policies limit internal tasks to active members and management to leaders/admins.
- File type and size restrictions are enforced in both server actions and Storage.
- Sensitive writes use server actions plus RLS/security-definer functions.
- Content and vote operations have database-backed rate limits.
- Reports and important administrative changes are written to `audit_logs`.

Review policies after every schema change. Never use a service-role client in a Client Component.

## 7. Vercel deployment

1. Import or connect this repository to a Vercel project.
2. Select the **Next.js** preset.
3. Add the environment variables above for Production, Preview and Development as appropriate.
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
5. Deploy.
6. Update Supabase redirect URLs with the final domain.
7. Visit `/api/health`; expected production response includes `"database":"connected"`.

The application builds without backend credentials to support CI, but that deployment is visibly marked setup mode and is not a completed production integration.

## 8. Quality checks

```bash
npm run typecheck
npm run build
curl http://localhost:3000/api/health
```

Recommended Supabase integration tests before launch:

- Two students cannot create duplicate votes for the same idea.
- An author cannot vote for their own idea.
- A student cannot update their role, score, competition status, or another profile.
- Voting fails after the competition deadline/status freeze.
- A moderator can resolve reports but cannot select a winner.
- An admin can freeze finalists and must manually select the winner.
- A project applicant cannot approve their own request.
- A non-member cannot read project tasks or create project updates.
- A user sees only their own notifications.

See `docs/ACCEPTANCE_TESTS.md` for the full manual matrix.

## Product principles

- Bold comic-tech editorial identity, not a generic SaaS dashboard.
- Constructive criticism over popularity.
- Human-admin winner selection over automatic vote supremacy.
- Transparent, derived scores over mutable counters.
- Honest empty states over fabricated activity.
- Real student privacy over unrestricted direct messaging.
