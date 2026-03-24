# CalmLane

CalmLane is a production-ready Next.js web app for AI-powered emotional support, self-reflection, journaling, mood tracking, and coping tools.

## Safety and scope

CalmLane is **not** therapy, **not** medical advice, and **not** crisis support.
If someone may be in immediate danger or might hurt themselves or others, the app escalates to crisis guidance and prompts emergency/hotline support.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Vercel AI SDK + OpenAI Responses API or Google Gemini (`@ai-sdk/google`)
- Supabase (PostgreSQL + Auth + Storage)
- Zod validation, React Hook Form-ready form architecture
- Zustand-compatible client patterns, Framer Motion micro-animations
- Vercel Analytics + Speed Insights

## Routes

- `/`
- `/login`
- `/signup`
- `/onboarding`
- `/app`
- `/app/chat`
- `/app/chat/[id]`
- `/app/journal`
- `/app/mood`
- `/app/tools`
- `/app/insights`
- `/app/settings`
- `/privacy`
- `/terms`
- `/disclaimer`

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `OPENAI_API_KEY` (optional if using Gemini)
- `GOOGLE_GENERATIVE_AI_API_KEY` (optional if using OpenAI)
- `GOOGLE_GENERATIVE_AI_MODEL` (optional, default `gemini-2.0-flash`)
- `OPENAI_CHAT_MODEL` (optional, default `gpt-4.1-mini` via Responses API)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; optional for admin tasks)
- `RESEND_API_KEY` (optional)
- `CLOUDINARY_URL` or `BLOB_READ_WRITE_TOKEN` (optional)

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

- Full schema (new project): run `db/migrations/001_init.sql` once in the Supabase SQL Editor.
- If you already ran `002_repair_missing_tables.sql` only, also run `db/migrations/003_init_remaining_after_002.sql` so journal, profiles, chat tables, preferences, and safety events exist (002 only added mood + tool session tables).
- Optional seed template: `db/seed.sql` (replace `<AUTH_USER_ID>`; onboarding usually creates the profile for you).
- Root `middleware.ts` refreshes the Supabase auth cookie on each request so Server Actions can insert rows under RLS.

Core tables:

- `profiles`
- `conversations`
- `messages`
- `journal_entries`
- `mood_logs`
- `coping_tool_sessions`
- `user_preferences`
- `safety_events`

### Supabase auth/data model notes

- `profiles.user_id` is 1:1 with `auth.users.id`
- RLS is enabled on all user-data tables
- Policies enforce users can only read/write their own rows
- Sensitive safety logging is kept minimal (`metadata` only stores minimal fields)

## AI prompting architecture

Prompt definitions are in `lib/prompts.ts`:

- Supportive conversation prompt
- Crisis detection/escalation classifier prompt
- Journal reflection prompt

Chat route: `app/api/chat/route.ts`

- Performs lightweight risk classification before response generation.
- Logs high-risk safety events with minimal metadata.
- Streams assistant responses via Vercel AI SDK.
- Uses OpenAI when `OPENAI_API_KEY` is set; otherwise Gemini when `GOOGLE_GENERATIVE_AI_API_KEY` is set; otherwise a short resilience fallback reply and response header `x-calmlane-runtime: offline`.

## Deployment (Vercel)

1. Import repository in Vercel.
2. Add environment variables from `.env.example`.
3. Run migration/seed SQL against your Postgres instance.
4. Deploy.

`vercel.json` is included with Next.js framework settings and a chat function timeout override.
