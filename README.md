# PUBG Mobile Esports Portfolio & Player Discovery Hub

A full-stack, mobile-first Web Application designed for **PUBG Mobile Esports Portfolios** and **Player Discovery (Scout Discovery Hub)**. This platform enables players to create their own accounts, build their portfolios, manage their stats, and log their achievements, while allowing team scouts to search and filter candidates in real-time.

Built with **Next.js 16 (App Router)**, styled with **Tailwind CSS v4**, and utilizing **Prisma v7** with support for both local **SQLite** and remote production databases.

---

## Technical Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Highly optimized for mobile screens.
- **Backend APIs**: Next.js Node.js Route Handlers:
  - `/api/auth/register` (POST): Hashes credentials, inserts player profile, and sets session cookie.
  - `/api/auth/login` (POST): Compares hashes, sets cookie.
  - `/api/auth/logout` (POST): Clears session cookie.
  - `/api/auth/google` (POST): Verifies actual Google ID Tokens against Google's Tokeninfo API, checking client audience.
  - `/api/players` (GET): Real-time query endpoint for candidate feed.
  - `/api/players/[id]` (GET/PUT): Individual profile fetcher and updater (secure db persistence).
- **Authentication**: Custom lightweight JSON Web Token (JWT) session stored in secure, HTTP-only browser cookies.
- **Database ORM**: Prisma v7 configured with dynamic driver adapters to support local file databases (SQLite) and remote production instances (PostgreSQL, MySQL, etc.).

---

## Production Environment Variables

To run the site in production (Vercel, Netlify, or VPS), configure the following environment variables:

| Variable Name | Description | Example / Recommended Value |
| --- | --- | --- |
| `DATABASE_URL` | Remote database connection string. If omitted, falls back to local SQLite (`dev.db`). | `postgresql://user:pass@host:5432/dbname?schema=public` |
| `GOOGLE_CLIENT_ID` | Production Google OAuth Client ID for backend audience check. | `123456789-abc.apps.googleusercontent.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Production Google OAuth Client ID exposed to the client browser. | `123456789-abc.apps.googleusercontent.com` |
| `JWT_SECRET` | Secure cryptographic key used to sign browser session cookies. | `your-long-random-jwt-secret-string` |
| `NODE_ENV` | Environment identifier. Controls cookie security settings. | `production` |

---

## Getting Started (Local Development)

Follow these steps to configure, seed, and launch the application locally.

### Prerequisites

- **Node.js**: Ensure Node.js 18+ (Node 24 recommended) is installed on your system.
- **NPM**: Standard package manager included with Node.js.

### 1. Install Dependencies

In the root project directory, run:
```bash
npm install
```

### 2. Database Migration

Initialize the SQLite database and generate the Prisma Client schemas:
```bash
npx prisma migrate dev --name init
```
This will create a local `dev.db` file in the root directory.

### 3. Seed Mock Data

Populate the database with the pre-configured esports teams and 15 fictional player profiles:
```bash
npx prisma db seed
```

### 4. Start the Development Server

Launch the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser (toggle mobile viewport emulation for the best experience).

---

## Testing Credentials

You can log in as one of the 15 pre-seeded players using the following credentials:
- **Email**: `[player_ign]@esports.com` (lowercase)
  - *Example*: `valerie@esports.com`
  - *Example*: `xenon@esports.com`
  - *Example*: `specter@esports.com`
- **Password**: `password123` (all pre-seeded players share this password)

---

## Production Security & Optimization

1. **CORS & Global Security Headers**:
   API endpoints are protected with production security headers configured inside `next.config.ts`, restricting frames, sniffing, and allowing secure Cross-Origin Resource Sharing (CORS).
2. **Row-Level Security (RLS)**:
   Backend write endpoints (`PUT /api/players/[id]`) enforce strict token ownership check: `session.playerId === id`. If there is a session mismatch, the update is blocked with `401 Unauthorized`.
3. **Database Connection Pooling**:
   The database client in `src/lib/db.ts` uses connection reuse patterns and dynamically imports the SQLite driver client only when SQLite is used, preventing native library compilation crashes in serverless runtime environments.
