This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Branch-Based Environments (`dev` and `prod`)

Use separate local env files so each branch points to the correct database/project:

- `.env.development.local` for your `dev` branch
- `.env.production.local` for your `prod` branch

Setup:

```bash
# from repo root
cp .env.development.local.example .env.development.local
cp .env.production.local.example .env.production.local
```

Then fill each file with the correct credentials for that environment.

Required auth variable:

- `AUTH_JWT_SECRET`

Login credentials are read from the `public.users` table in your database.

Notes:

- `npm run dev` uses development env files.
- `npm run build` / `npm run start` use production env files.
- `npm run db:check:dev` checks DB using `.env.development.local`.
- `npm run db:check:prod` checks DB using `.env.production.local`.
- Create/update login user in DB:
  - `npm run db:user:create:dev -- <username> <password>`
  - `npm run db:user:create:prod -- <username> <password>`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
