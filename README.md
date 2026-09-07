# Todo Clean

A todo list app built with **clean architecture** and a **feature-first** folder
structure: every feature owns its full vertical slice (domain → application →
infrastructure → presentation), and features are wired together only at the
composition root. The backend is an Express/TypeScript API; `public/` is a
small dependency-free HTML/CSS/JS frontend served by that same API.

## Features

| Feature | Responsibility |
|---|---|
| `auth` | Register/login, password hashing, JWT issuing & verification |
| `projects` | Create/read/update/delete projects, project ownership |
| `tasks` | Create/read/update/delete/move tasks within a project |
| `views` | Read-only projections of tasks — **list** view and **kanban** (board) view |
| `collaboration` | Invite/remove project collaborators, role management (editor/viewer) |

## Architecture

Each feature under `src/features/<name>` is organized in four layers, from
innermost (no dependencies) to outermost:

```
src/features/<feature>/
  domain/           entities + repository interfaces (pure, no framework code)
  application/      use-cases (business rules) + ports (interfaces) the use-cases need
  infrastructure/   concrete implementations of domain/application interfaces
                     (in-memory repositories, bcrypt, JWT, ...)
  presentation/      HTTP controllers, routes, request/response DTOs
  index.ts           the feature's composition function — the only file other
                     code should import from
```

Dependencies always point inward: `presentation` depends on `application`,
`application` depends on `domain`, and `infrastructure` implements `domain`/
`application` interfaces. Nothing in `domain` or `application` imports Express,
JWT, or bcrypt directly.

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
together and hands out the shared instances (repositories, access policy,
auth middleware) each feature needs.

```
src/
  shared/            cross-cutting kernel: errors, ids, HTTP middleware, shared ports
  features/          one folder per feature (see above)
  composition/        cross-feature glue (access policy, DI container)
  app.ts             Express app assembly (mounts each feature's routes)
  server.ts          process entrypoint
```

### Persistence

Repositories are defined as interfaces in each feature's `domain` layer and
currently backed by in-memory implementations in `infrastructure`. Swapping in
a real database means writing a new class that implements the same repository
interface — no application or presentation code changes.

## Data model

- **User** — id, name, email, password hash
- **Project** — id, name, description, ownerId
- **Task** — id, projectId, title, description, status (`todo` / `in_progress`
  / `done`), position (ordering within its column), assigneeId
- **Membership** — projectId, userId, role (`editor` / `viewer`) — collaborators
  invited to a project; the owner is implicit via `Project.ownerId`

## API

All routes except `/health` and `/api/auth/*` require `Authorization: Bearer <token>`.

```
POST   /api/auth/register              { name, email, password }
POST   /api/auth/login                 { email, password }

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

## Running

```bash
npm install
npm run dev      # start with hot reload (ts-node-dev)
npm run build    # compile to dist/
npm start        # run compiled output
npm test         # run the vitest + supertest suite
npm run lint     # typecheck everything (src + tests)
```

Set `JWT_SECRET` and `PORT` via environment variables (or a `.env` file) in
production; a development default is used otherwise.

Open `http://localhost:3000/` for the frontend (register/log in, create
projects, add tasks, switch between kanban and list views, invite
collaborators). It's plain HTML/CSS/JS in `public/` — no build step, no
framework — served as static files by the same Express app that serves
`/api/*`.
