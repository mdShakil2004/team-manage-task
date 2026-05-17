# Team Task Manager — Full Stack Project

A modern full-stack team collaboration and task management platform built with a scalable backend architecture and a responsive SaaS-style frontend.

The application enables teams to create projects, assign tasks, manage members, track progress, and monitor overdue work through a clean dashboard interface with secure role-based access control.

---

# Preview

## Dashboard

<img width="1871" height="3396" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/77b6716b-84d3-4044-9a39-7c3e999b7053" />

## Project Workspace

<img width="1857" height="863" alt="Project Preview" src="https://github.com/user-attachments/assets/876b3031-1738-4170-a867-ffbe6130c9f6" />

---

# Tech Stack

## Frontend

* React
* TanStack Start
* TypeScript
* React Query
* Tailwind CSS
* Shadcn UI

## Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Zod Validation
* bcrypt Password Hashing

## Deployment

* Railway (Backend + PostgreSQL)
* Vercel / Static Hosting (Frontend)

---

# Core Features

## Authentication & Security

* User Signup & Login
* JWT-based Authentication
* Protected Routes
* Password Hashing using bcrypt
* Role-Based Access Control (RBAC)

## Project Management

* Create / Update / Delete Projects
* Add & Remove Team Members
* Project Status Tracking
* Progress Calculation
* Activity Timeline

## Task Management

* Create & Assign Tasks
* Priority Levels
* Status Workflow
* Due Date Tracking
* Overdue Detection
* Filtering & Sorting
* Pagination Support

## Dashboard & Analytics

* Total Projects
* Total Tasks
* Completed Tasks
* Overdue Tasks
* Recent Activity Feed
* Task Status Visualization
* Assigned Task Tracking

## Team Management

* Invite Members
* Update User Roles
* Workspace Member Listing
* Admin / Member Permissions

---

# Application Architecture

## Backend Structure

```bash
/backend
├── src
│   ├── controllers
│   ├── services
│   ├── routes
│   ├── middleware
│   ├── validators
│   ├── lib
│   └── types
├── prisma
│   ├── schema.prisma
│   └── seed.ts
```

### Architecture Pattern

The backend follows a clean layered architecture:

```text
Routes → Controllers → Services → Prisma ORM → PostgreSQL
```

This separation improves:

* scalability
* maintainability
* testing
* business logic isolation

---

# Database Design

The application uses PostgreSQL with Prisma ORM and relational models for:

* Users
* Projects
* Project Members
* Tasks
* Activity Logs

Key relationships include:

* One-to-many project ownership
* Many-to-many project membership
* Task assignment relationships
* Activity audit tracking

---

# REST API Endpoints

## Authentication

* `POST /api/auth/signup`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`

## Users & Team

* `GET /api/users`
* `GET /api/users/:id`
* `PATCH /api/users/:id/role`
* `POST /api/users/invite`

## Projects

* `GET /api/projects`
* `POST /api/projects`
* `GET /api/projects/:id`
* `PATCH /api/projects/:id`
* `DELETE /api/projects/:id`
* `POST /api/projects/:id/members`
* `DELETE /api/projects/:id/members/:userId`

## Tasks

* `GET /api/tasks`
* `POST /api/tasks`
* `GET /api/tasks/:id`
* `PATCH /api/tasks/:id`
* `DELETE /api/tasks/:id`
* `PATCH /api/tasks/:id/status`
* `PATCH /api/tasks/:id/assign`

## Dashboard

* `GET /api/dashboard/summary`
* `GET /api/dashboard/activity`
* `GET /api/dashboard/overdue`

## Activity

* `GET /api/activity`

---

# Filtering & Query Support

## Projects

* Search by name
* Filter by status
* Filter by owner
* Sort by due date
* Pagination

## Tasks

* Search by title
* Filter by status
* Filter by priority
* Filter by assignee
* Filter by project
* Overdue filtering
* Sorting & pagination

---

# Frontend Architecture

The frontend uses:

* TanStack Router for routing
* React Query for server state management
* Context API for authentication state
* Reusable UI components
* Responsive dashboard layouts

## Main Screens

* Authentication
* Dashboard
* Projects
* Tasks
* Team Management
* Activity Feed
* Settings

---

# Environment Configuration

## Backend `.env`

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=https://your-api-domain.com/api
```

---

# Local Development

## Install Dependencies

```bash
npm install

cd backend
npm install
```

## Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Start Development Servers

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# Production Build

## Backend

```bash
npm run build
npm run start
```

## Frontend

```bash
npm run build
npm run preview
```

---

# Demo Credentials

# Live Test 
 ```
  https://team-manage-task-ub74.vercel.app/
```

## Admin

```text
Email: admin@teamtask.dev
Password: Admin1234
```

## Members

```text
Email: priya@teamtask.dev
Password: Member1234
```

```text
Email: daniel@teamtask.dev
Password: Member1234
```

```text
Email: yuki@teamtask.dev
Password: Member1234
```

---

# Standard API Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {}
}
```

---

# Deployment

## Backend Deployment (Railway)

1. Create PostgreSQL service
2. Connect GitHub repository
3. Set backend root directory
4. Configure environment variables
5. Run Prisma migrations
6. Deploy production build

## Frontend Deployment

The frontend can be deployed to:

* Vercel
* Netlify
* Cloudflare Pages

Configure:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

# Highlights

* Full-stack architecture
* Secure JWT authentication
* Role-based authorization
* Relational database modeling
* Production-ready API structure
* Responsive modern UI
* Clean component architecture
* Reusable service layer
* Validation & centralized error handling
* Railway deployment ready

---

# Author

Md Shakil
B.Tech — Computer Science Engineering
VGU Jaipur
