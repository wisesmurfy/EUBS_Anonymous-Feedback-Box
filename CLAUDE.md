# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EUBS 익명 소리함** (EUBS Anonymous Feedback Box) — a Next.js web application for anonymous feedback submission and management.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
```

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Supabase** — database and backend (`@supabase/supabase-js`, `@supabase/ssr`)
- **Resend** + **React Email** — transactional email delivery
- **Zod** — schema validation
- **Tailwind CSS** — styling (`clsx` + `tailwind-merge` for conditional classes)
- **date-fns** — date formatting

## Environment Variables

Copy `.env.example` to `.env.local` before running locally. Required variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Resend API key for email |
| `RESEND_FROM_EMAIL` | Sender email address |
| `NEXT_PUBLIC_APP_URL` | Deployed app URL |

## Path Aliases

`@/*` maps to `./src/*`.

## Supabase Usage

Use `@supabase/ssr` for server-side clients (Server Components, Route Handlers, Middleware). Use `@supabase/supabase-js` directly only for client-side code. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
