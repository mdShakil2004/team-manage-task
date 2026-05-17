# Team Task Manager (Full Stack)

Full-stack Team Task Manager with a TanStack Start frontend and a production-ready backend API built with **Node.js + TypeScript + Express + Prisma + PostgreSQL**.


<img width="1871" height="3396" alt="image" src="https://github.com/user-attachments/assets/77b6716b-84d3-4044-9a39-7c3e999b7053" />

<img width="1857" height="863" alt="image" src="https://github.com/user-attachments/assets/876b3031-1738-4170-a867-ffbe6130c9f6" />


## Tech Stack
- Node.js + TypeScript
- Express
- PostgreSQL + Prisma ORM
- JWT authentication
- bcrypt password hashing
- Zod validation



## Backend Folder Structure
`/backend`
- `src/routes`
- `src/controllers`
- `src/services`
- `src/middleware`
- `src/validators`
- `src/lib`
- `prisma/schema.prisma`
- `prisma/seed.ts`

## Features
- Auth: signup, login, logout, me
- RBAC: ADMIN/MEMBER controls
- Projects CRUD + member management
- Tasks CRUD + assignment + status updates
- Dashboard summary/activity/overdue
- Activity listing
- Pagination, filters, sorting
- Consistent error format
- Health endpoint: `GET /health`

## Frontend (TanStack Start)
The frontend lives at the repo root and connects to the backend API via `VITE_API_URL` (defaults to `/api`).

### Frontend Dev
```bash
# from root
npm install
npm run dev
```
The dev server proxies `/api` to `http://localhost:4000` (see `vite.config.ts`).

### Frontend Build
```bash
# from root
npm run build
npm run preview
```

### Frontend Environment
Create a `.env` file (see `.env.example`) if the API is hosted elsewhere:
```env
VITE_API_URL=https://your-api.example.com/api
```

## API Endpoints
### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users / Team
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id/role`
- `POST /api/users/invite`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `PATCH /api/tasks/:id/assign`

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/activity`
- `GET /api/dashboard/overdue`

### Activity
- `GET /api/activity`

## Filters / Sorting
### Projects
- `search` (name)
- `status`
- `ownerId`
- `sortBy=dueDate`
- `sortOrder=asc|desc`
- `page`, `limit`

### Tasks
- `search` (title)
- `status`
- `priority`
- `assigneeId`
- `projectId`
- `overdue=true|false`
- `sortBy=dueDate|priority|createdAt`
- `sortOrder=asc|desc`
- `page`, `limit`

## Setup
From repo root:

```bash
npm install
cd backend
npm install
cp .env.example .env
```

Optional frontend env file:
```bash
cp .env.example .env
```

Set `.env` values:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

## Database
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Run
```bash
# from root
npm run backend:dev

# in another terminal (frontend)
npm run dev

# or from backend
npm run dev
```

## Build
```bash
# from root
npm run backend:build

npm run build

# from backend
npm run build
npm run start
```

## Demo Credentials (seed)
- Admin: `admin@teamtask.dev` / `Admin1234`
- Member: `priya@teamtask.dev` / `Member1234`
- Member: `daniel@teamtask.dev` / `Member1234`
- Member: `yuki@teamtask.dev` / `Member1234`
- Member: `sofia@teamtask.dev` / `Member1234`

## Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {}
}
```

## Railway Deployment
1. Create PostgreSQL service in Railway.
2. Create a new service from this repo.
3. Set service root directory to `backend`.
4. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`, `PORT`.
5. Build command: `npm install && npm run build`.
6. Start command: `npm run start`.
7. Run migrations on deploy: `npm run prisma:deploy` (pre-deploy hook or release command).
8. Verify using `GET /health`.

## Frontend Deployment
1. Deploy the frontend (root) to your hosting provider (Vercel/Netlify/Cloudflare Pages).
2. Set `VITE_API_URL` to the backend base URL (e.g. `https://api.example.com/api`).
3. Ensure backend `CORS_ORIGIN` includes the frontend domain.
