# Compassion

TODO: One or two sentences on what Compassion is and who it's for.

## Repository structure

```
compassion/
└── apps/
    └── admin-web/     # Admin dashboard (Next.js)
```

## Admin Web

A web dashboard for administrators to manage providers, view reports, and configure settings.

### Features

- Admin authentication (login, email verification, first-login setup)
- Providers management
- Reports, with an AI chat assistant for asking questions about reports
- Settings

### Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- React and TypeScript
- Tailwind CSS (PostCSS)
- ESLint

### Getting started

**Prerequisites:** Node.js 20 or newer and npm.

```bash
cd apps/admin-web
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The app runs at http://localhost:3000.

### Environment variables

Create `apps/admin-web/.env.local`:

```
# TODO: list each variable name with a description, for example:
# NEXT_PUBLIC_API_URL=   # Base URL of the backend API
```

Never commit `.env.local`. It's already in `.gitignore`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the code |

### Project layout

```
apps/admin-web/
├── app/           # Pages and routes (login, providers, reports, settings)
├── components/    # Shared UI (auth guard, chatbot)
├── lib/
│   ├── api/       # Backend API clients
│   └── auth/      # Session and authentication helpers
└── public/        # Static assets
```

### Routes

| Path | Purpose |
| --- | --- |
| `/` | Dashboard |
| `/login` | Sign in |
| `/login/verify` | Verification step |
| `/login/first-login` | First-time account setup |
| `/providers` | Providers |
| `/reports` | Reports and chat assistant |
| `/settings` | Settings |

## Backend

TODO: Where the API lives, how to run it, and how admin-web connects to it.

## Contributing

1. Create a branch: `git checkout -b feature/your-change`
2. Make your changes and run `npm run build` to check nothing breaks
3. Commit and open a pull request

## License

TODO: Add a license, or state that the project is private.
