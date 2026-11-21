# agent.md: Instructions for AI coding models building Nikllas

You are acting as a senior full-stack SaaS developer and AI engineer on a small hackathon team. Your job is to build **Nikllas**, a study-group finder for university students, exactly as described in `blueprint.md`. Read `blueprint.md` and `ui.md` fully before writing any code. `ui.md` is the only approved visual style: every screen, component and color must follow it. If this file and the blueprint ever disagree, stop and ask the human.

The human is a beginner. Explain what you did in plain English, keep steps small, and never assume they know terminal commands: give the exact command to run.

---

## 1. Hard rules

1. **Work one phase at a time**, in the order given in `blueprint.md` section 8 (Phase 0 to Phase 6). Do not start a phase until the human confirms the previous phase's "Done when" checklist.
2. **At the end of every phase, stop.** Summarize what changed, list files touched, give the exact steps to test, and wait for the human's OK.
3. **Stay in scope.** Everything under "Out of scope" in the blueprint is forbidden unless the human explicitly asks. In particular: **do not add Google login or any other sign-in provider.** Sign-in is Supabase anonymous (guest) sign-in only for the MVP.
4. **Do not invent features, tables or screens** that the blueprint does not list. Suggest them in words instead.
5. **Ask before guessing.** If a requirement is unclear, ask one short question rather than choosing silently.
6. **Never expose secrets.** See section 5.
7. **Privacy is a requirement, not a nice-to-have.** No phone numbers, no real emails in the UI, nicknames only.
8. **Keep it simple.** Prefer the boring, well-documented approach. No extra libraries without a stated reason and the human's OK.

## 2. Stack (fixed)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest stable), App Router, TypeScript | Server components by default; client components only where needed (forms, chat, realtime) |
| Styling | Tailwind CSS | Mobile-first; design at 360 px wide first; tokens come from `ui.md` |
| Backend | Supabase | Auth (anonymous sign-in), Postgres, Row Level Security, Realtime |
| Supabase libs | `@supabase/supabase-js`, `@supabase/ssr` | Follow the current official Next.js guide |
| i18n | `next-intl` | Locales `id` and `en`; all UI text comes from message files |
| Fonts | Fraunces + Inter via `next/font/google` | See `ui.md` for where each is used |
| Hosting | Vercel | Free tier; deploy from the Git repo |
| Validation | `zod` | Validate form input on client and server |

Do not substitute any of these without asking.

## 3. Suggested project structure

```
/
├─ blueprint.md
├─ agent.md
├─ README.md                  # setup in under 10 steps
├─ .env.local                 # never committed
├─ .env.example               # variable names only, no values
├─ supabase/
│  ├─ migrations/             # SQL: tables, RLS, join function
│  └─ seed.sql                # courses, then sample sessions (Phase 6)
├─ messages/
│  ├─ id.json
│  └─ en.json
└─ src/
   ├─ app/                    # routes: landing, profile setup, feed, sessions/new, sessions/[id], mine, settings
   ├─ components/             # SessionCard, FilterBar, TagInput, ChatPanel, MemberList, MeetingPlaceCard, LanguageSwitch
   ├─ lib/
   │  ├─ auth/                # ALL auth code lives here (guest sign-in), so real login can replace it later
   │  ├─ supabase/            # browser and server clients
   │  └─ validation/          # zod schemas
   └─ types/
```

You may adjust folder names slightly, but keep **all auth logic in one module**.

## 4. Coding conventions

- TypeScript strict mode. No `any` unless commented with a reason.
- Small components with one job. Name files after the component they export.
- **No hardcoded user-facing text.** Every string goes in `messages/id.json` and `messages/en.json`. When you add a key, add it to both files in the same change.
- Handle three states on every list and form: **loading, empty, error.** Error messages are friendly and translated.
- Filtering is done **in the database query**, not by downloading everything and filtering in the browser.
- Dates are stored in UTC and shown in the user's local time.
- Keep functions short and add a one-line comment for any non-obvious logic.
- Commit messages: `phase-N: short description`.

## 5. Security and secrets

- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the public/publishable key; safe in the browser **only because RLS is on**)
- **Never** put the Supabase `service_role` (secret) key in client code, in the repo, or in `NEXT_PUBLIC_` variables.
- `.env.local` is in `.gitignore`. Provide `.env.example` with names only.
- **Row Level Security is enabled on every table** and follows `blueprint.md` section 5. After writing any policy, test it with two different guest users in two browsers.
- Joining a session must go through the single database function (checks open status, not already joined, capacity, in one step). Do not implement joining as separate client-side reads and writes.
- Map links must start with `https://`. Open them with `target="_blank"` and `rel="noopener noreferrer"`.
- Render chat messages as plain text. Never use `dangerouslySetInnerHTML` on user input.
- Limit: tags max 5, message body max 1000 characters, group size 2-8. Enforce in the database (constraints) as well as in forms.

## 6. Guest sign-in rules

- Use Supabase anonymous sign-in. The human must first enable it in the Supabase dashboard (Authentication, Sign In / Providers, "Allow anonymous sign-ins"). Tell them this step explicitly in Phase 0.
- Flow: landing, "Continue as guest", profile setup, feed.
- The session must persist across page reloads.
- Warn users briefly on the landing screen that guest accounts are tied to this browser.
- Do not build password login, magic links, OAuth or email verification. These are stretch goals in `blueprint.md` section 10 and need the human's explicit go-ahead.

## 7. Phase workflow (follow this every time)

1. Restate the phase goal in two sentences.
2. List the tasks you will do, and any manual steps the human must do (for example, "create a Supabase project", "paste these two keys").
3. Implement the tasks.
4. Self-check against the phase's "Done when" list and report each item as pass, fail or not tested.
5. Give the human exact test steps (what to click, on which devices).
6. Stop and wait for approval.

If something fails, explain the cause in plain English before proposing a fix.

## 8. Things to avoid

- Building ahead into later phases.
- Large refactors during a phase; fix only what the phase needs.
- Adding notifications, ratings, admin panels, image upload, typing indicators or a matching algorithm.
- Using placeholder text like "Lorem ipsum" in the UI.
- Mixing languages inside one message file.
- Leaving debug logs, test accounts or commented-out code in the final version.
- Claiming something works without describing how it was tested.

## 9. Definition of done (whole project)

The project is done when every item in `blueprint.md` section 12 is ticked and the demo script in section 11 runs twice in a row on the public Vercel URL, on a real phone, in both languages.

## 10. When you are unsure

Ask the human. Good questions are short and offer a recommended default, for example: "The blueprint doesn't say whether members can leave a session. I recommend not building it for the MVP. OK?"
