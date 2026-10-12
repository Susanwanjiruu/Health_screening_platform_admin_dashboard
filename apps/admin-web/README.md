# Compassion Health Screening Platform — Admin Dashboard

The Admin Dashboard is the web application for managing the Compassion Health Screening Platform. Built with Next.js, it connects to a separate FastAPI backend to support administrative workflows for the Center.

## Features

- Admin authentication using email, password, and OTP verification.
- Hospital registration and management.
- Doctor/Provider account management.
- Beneficiary management.
- Clinical screening record management.
- Referral case management.
- Center profile management.
- Screening reports and exports.

*Ensure this list matches the functionality currently implemented in the dashboard.*

## Technology Stack

- Next.js
- React
- FastAPI backend
- API integration configured through environment variables

## Getting Started

### Prerequisites

- Node.js
- npm
- Access to the FastAPI backend

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root and configure the backend API URL.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

`NEXT_PUBLIC_API_URL` is an example variable name. Replace it with the exact variable your application uses. The example URL assumes the backend runs locally on port `8000` under `/api/v1`.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Ensure the FastAPI backend is running and accessible at the configured API URL.

## Backend Integration

The dashboard communicates with the FastAPI backend for authentication, authorization, and administrative operations.

Admin authentication uses email/password credentials followed by OTP verification. Protected operations must be authorized by the backend.

## Development Commands

```bash
npm run dev
npm run build
npm run start
```

These commands assume the corresponding scripts are configured in `package.json`.

## Deployment

The dashboard currently runs locally. Production hosting and deployment instructions will be documented once the deployment platform is selected.

## Related Applications

The Compassion Health Screening Platform consists of:

- **Admin Dashboard:** Next.js web application.
- **Doctor Mobile App:** Flutter mobile application.
- **Backend API:** FastAPI service.

Each component is maintained in a separate repository.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
