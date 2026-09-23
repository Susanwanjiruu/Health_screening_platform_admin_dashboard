# Compassion

A health screening platform for children and beneficiaries in Compassion programs. Doctors and providers record screenings (malnutrition, immunization, vitamin A, deworming, HIV testing and more) from a mobile app, and administrators monitor providers and reports from a web dashboard.

## Components

| Component | Description | Stack |
| --- | --- | --- |
| `apps/admin-web` | Admin dashboard (this repo) | Next.js 16, React, TypeScript, Tailwind CSS |
| Provider mobile app | Doctor login and screening forms (separate project) | Flutter |
| Backend API | Auth, screening and reporting under `/api/v1` | TODO: framework |

## Admin Web

### Features

- Admin authentication: login, OTP verification, first-login password setup
- Providers management
- Reports on screening data, with an AI chat assistant
- Settings

### Getting started

Prerequisites: Node.js 20+ and npm, and a running backend.

```bash
cd apps/admin-web
npm install
npm run dev
```

The app runs at http://localhost:3000.

### Environment variables

Create `apps/admin-web/.env.local` (never commit it):

```
# TODO: list variable names, e.g.
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the code |

### Routes

| Path | Purpose |
| --- | --- |
| `/` | Dashboard |
| `/login` | Sign in |
| `/login/verify` | OTP verification |
| `/login/first-login` | First-time password setup |
| `/providers` | Providers |
| `/reports` | Reports and chat assistant |
| `/settings` | Settings |

### Project layout

```
apps/admin-web/
├── app/          # Pages and routes
├── components/   # Shared UI (auth guard, chatbot)
├── lib/
│   ├── api/      # Backend API clients
│   └── auth/     # Session helpers
└── public/       # Static assets
```

## Backend

The API is served under `/api/v1`. Auth flow: `login-request` -> `login-verify-otp` -> `complete-first-login`.

TODO: backend repo link and how to run it.

## Security note

This project handles sensitive health data. Never commit `.env` files, keys or real patient data.

## License

TODO: add a license, or state that the project is private.
