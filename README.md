# Todo Clean

A todo list app built with **clean architecture** on *both* ends: the backend
is a feature-first Express/TypeScript API, and the frontend is a feature-first
TypeScript SPA (no framework, no bundler) that mirrors the same layering.
Every feature — backend and frontend alike — owns its full vertical slice
(domain → application → infrastructure → presentation), and features are
wired together only at a composition root.

## Features

| Feature | Responsibility |
|---|---|
| `auth` | Register/login, **email OTP verification** (SendGrid), password hashing, JWT |
| `projects` | Create/read/update/delete projects, project ownership |
| `tasks` | Create/read/update/delete/move tasks within a project |
| `views` | Read-only projections of tasks — **list** view and **kanban** (drag-and-drop board) view |
| `collaboration` | Invite/remove project collaborators, role management (editor/viewer) |

## Backend architecture

Each feature under `src/features/<name>` is organized in four layers, from
innermost (no dependencies) to outermost:

```
src/features/<feature>/
  domain/           entities + repository interfaces (pure, no framework code)
  application/      use-cases (business rules) + ports (interfaces) the use-cases need
  infrastructure/   concrete implementations of domain/application interfaces
                     (in-memory repositories, bcrypt, JWT, SendGrid, ...)
  presentation/      HTTP controllers, routes, request/response DTOs
  index.ts           the feature's composition function — the only file other
                     code should import from
```

Dependencies always point inward: `presentation` depends on `application`,
`application` depends on `domain`, and `infrastructure` implements `domain`/
`application` interfaces. Nothing in `domain` or `application` imports Express,
JWT, bcrypt, or SendGrid directly.

### Cross-feature boundaries

Some behavior inherently spans features — e.g. "can this user edit this
project?" depends on both `projects` (who owns it) and `collaboration` (who
was invited). Rather than one feature importing another feature's concrete
classes, cross-feature contracts are expressed as small **ports** (TypeScript
interfaces):

- `shared/application/ports/project-access-policy.ts` — `assertCanView` /
  `assertCanEdit`, used by `projects`, `tasks`, and `views`.
- `features/projects/application/ports/project-membership-provider.ts` — lets
  `projects` list projects a user was invited to, without importing
  `collaboration`.
- `features/collaboration/application/ports/{project-lookup,user-lookup}.ts` —
  let `collaboration` check project ownership and resolve invite emails,
  without importing `projects` or `auth` internals.

The **composition root** (`src/composition/`) is the one place allowed to know
about multiple features at once. `InMemoryProjectAccessPolicy` implements the
shared access-policy port using both the `projects` and `collaboration`
repositories, and `src/composition/container.ts` wires every feature's module
together and hands out the shared instances each feature needs.

```
src/
  shared/            cross-cutting kernel: errors, ids, HTTP middleware, shared ports
  features/          one folder per feature (see above)
  composition/        cross-feature glue (access policy, DI container)
  app.ts             Express app assembly (static frontend + API routes + SPA fallback)
  server.ts          process entrypoint
```

### Persistence

Repositories are defined as interfaces in each feature's `domain` layer and
currently backed by in-memory implementations in `infrastructure`. Swapping in
a real database means writing a new class that implements the same repository
interface — no application or presentation code changes.

## Email verification (OTP)

Registration doesn't log the user in immediately. `POST /api/auth/register`
creates the account as unverified, generates a 6-digit code, hashes it, and
emails it; the account can't log in until `POST /api/auth/verify-otp`
succeeds (`POST /api/auth/resend-otp` re-sends a fresh code, rate-limited to
one per 30 seconds).

Email delivery is a port (`EmailSender`) with two adapters, chosen
automatically by the auth feature's composition (`src/features/auth/index.ts`):

- **`SendGridEmailSender`** — used when `SENDGRID_API_KEY` and
  `SENDGRID_FROM_EMAIL` are set.
- **`ConsoleEmailSender`** — the fallback when they aren't. It logs the email
  (including the code) to the server console, so the whole signup flow works
  out of the box with zero external setup.

```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Data model

- **User** — id, name, email, password hash, `isVerified`
- **OtpCode** — email, hashed code, expiry, attempt count (in-memory, 10 min TTL)
- **Project** — id, name, description, ownerId
- **Task** — id, projectId, title, description, status (`todo` / `in_progress`
  / `done`), position (ordering within its column), assigneeId
- **Membership** — projectId, userId, role (`editor` / `viewer`) — collaborators
  invited to a project; the owner is implicit via `Project.ownerId`

## API

All routes except `/health` and `/api/auth/*` require `Authorization: Bearer <token>`.

```
POST   /api/auth/register              { name, email, password } -> sends an OTP, no token yet
POST   /api/auth/verify-otp            { email, code }            -> { user, token }
POST   /api/auth/resend-otp            { email }
POST   /api/auth/login                 { email, password }        -> 403 EMAIL_NOT_VERIFIED if unverified

POST   /api/projects                   { name, description? }
GET    /api/projects                   -> projects you own or are a member of
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId        { name?, description? }
DELETE /api/projects/:projectId        (owner only)

POST   /api/tasks                      { projectId, title, description?, assigneeId? }
GET    /api/tasks/project/:projectId
PATCH  /api/tasks/:taskId              { title?, description?, assigneeId? }
PATCH  /api/tasks/:taskId/move         { status, position }
DELETE /api/tasks/:taskId

GET    /api/views/:projectId/list      -> flat, status-ordered task list
GET    /api/views/:projectId/kanban    -> tasks grouped into todo/in_progress/done columns

POST   /api/projects/:projectId/members             { email, role }  (owner only)
GET    /api/projects/:projectId/members
PATCH  /api/projects/:projectId/members/:userId      { role }         (owner only)
DELETE /api/projects/:projectId/members/:userId      (owner, or self-removal)
```

Access rules: a project's **owner** can do everything. An **editor**
collaborator can view and edit tasks/project details but cannot delete the
project or manage members. A **viewer** can only read.

## Frontend architecture

`frontend/src/` is TypeScript, compiled straight to native ES modules (no
bundler — `tsconfig.json` uses `NodeNext`, so every relative import writes its
`.js` extension and the browser's own `<script type="module">` resolves the
graph). Output lands in `public/js/`, served as static files alongside the
hand-written CSS in `public/styles/`.

It mirrors the backend's structure feature-for-feature:

```
frontend/src/features/<feature>/
  domain/           plain data types (Task, Project, Session, ...)
  application/      use-cases + ports (e.g. AuthApi, ProjectsApi — interfaces
                     the use-cases depend on, with no fetch/DOM code in them)
  infrastructure/   Http*Api classes implementing those ports via the shared
                     HttpClient; LocalStorageSessionStore for auth
  presentation/     DOM-building functions/controllers (no framework — a tiny
                     `h()` hyperscript helper) that call the use-cases
  index.ts          the feature's composition function
```

Cross-feature reads follow the same ports pattern as the backend: `views`
depends on a `TaskReader`-shaped port to render boards without importing
`tasks`' concrete classes; task **mutations** (create/update/move/delete) stay
owned by the `tasks` feature, and its `TasksController` is handed to `views`'
controller so drag-and-drop and the task-detail dialog call back into the
right place — same read/write split as the backend's `views` vs `tasks`.

```
frontend/src/
  shared/            http client, DOM helpers, router, toast/dialog managers, icons
  features/          one folder per feature (see above)
  app/
    composition.ts   the frontend's composition root — wires every feature,
                      the router, and the app shell together
    shell.ts         topbar chrome (brand, breadcrumb, theme toggle, user menu)
    pages/           thin route handlers that compose 2+ features
                     (e.g. project-page.ts composes projects+tasks+views+collaboration)
    main.ts          entrypoint
public/
  index.html
  styles/            design tokens, base reset, components, layout, board/kanban
  js/                compiled output (git-ignored, built by `npm run build:frontend`)
```

Routing is a small History-API router (`shared/router.ts`) with route guards
in `composition.ts` (`requireAuth` / `requireGuest`); the Express server has a
matching SPA fallback so deep links and refreshes on client-side routes
(`/projects/:id/kanban`, `/login`, ...) still resolve to the app shell instead
of 404ing.

The design system (`public/styles/tokens.css`) defines light/dark color
tokens, a type scale, spacing, elevation, and motion tokens; every other
stylesheet consumes those variables rather than hardcoding values, so the
whole UI reacts to the theme toggle (persisted in `localStorage`) or the
system `prefers-color-scheme`.

## Running

```bash
npm install
npm run dev            # backend (ts-node-dev) + frontend (tsc --watch) together
npm run build           # compile backend to dist/ and frontend to public/js/
npm start                # run the compiled backend
npm test                 # run the vitest + supertest suite (backend)
npm run lint              # typecheck backend and frontend
```

Set `JWT_SECRET`, `PORT`, and the `SENDGRID_*` variables above via environment
variables (or a `.env` file) in production; insecure/no-op development
defaults are used otherwise, with a console warning.

Open `http://localhost:3000/` — register an account, grab the verification
code from the server console (or your inbox if SendGrid is configured), then
create a project, add tasks, drag them across the kanban board, switch to the
list view, and invite a collaborator (they need an account first — invites
resolve by email against existing users).
