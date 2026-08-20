# MyDiary — Personal Diary Management System

A modern, full-stack personal diary built with Next.js 15, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router, JavaScript only)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials Provider)
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Features

- Register / Login / Logout with bcrypt password hashing
- Create, edit, delete, and view diary entries
- Mood & weather tagging per entry
- Tags, image upload, favorites, archive
- Calendar view with entry indicators
- Full-text search + mood filter + sort
- Dashboard with mood stats and recent entries
- Profile editing with avatar upload
- Change password in settings
- Fully responsive (mobile, tablet, desktop)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Database

```bash
npx prisma db push
npm run db:seed     # optional: adds demo user + sample entries
```

Demo login after seeding:
- Email: `demo@mydiary.app`
- Password: `password123`

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:seed      # Seed demo data
npm run db:push      # Sync Prisma schema
npm run db:studio    # Prisma Studio GUI
```

## Project Layout

```
app/
  (app)/   — Protected pages (dashboard, entries, calendar, profile...)
  (auth)/  — Login and register pages
  api/     — REST API routes
components/
  diary/   — DiaryCard, DiaryForm, MoodBadge, SearchBar...
  layout/  — Sidebar, Navbar, AppShell
  ui/      — Button, Input, Card, Badge, Skeleton...
hooks/     — useToast, useDebounce
lib/       — Prisma, auth config, Zod schemas, utilities
prisma/    — Schema and seed
```
