<p align="center"><img src="../docs/assets/banners/security.png" alt="Nikklas: security" width="100%"></p>

Privacy is enforced in the database, not only in the UI. Row Level Security (RLS) is on for all six tables.

```mermaid
erDiagram
  profiles ||--o{ sessions : hosts
  profiles ||--o{ session_members : joins
  sessions ||--o{ session_members : "has 2 to 8"
  sessions ||--o{ messages : contains
  sessions ||--o| meeting_places : "agrees on"
  courses ||--o{ sessions : "is for"
  profiles { uuid id PK
    text nickname
    text major
    int year "1 to 6"
    text_array topic_tags "max 5" }
  sessions { uuid id PK
    text section
    text exam_period "quiz, uts, uas"
    int max_size "2 to 8"
    text status "open, full, closed" }
  messages { uuid id PK
    text body "1 to 1000 chars" }
  meeting_places { uuid session_id PK
    text map_url "https only" }
```

## Who can read what

| Table | Read | Write |
| --- | --- | --- |
| `profiles` | The owner, and members of a shared session | The owner |
| `courses` | Any signed-in user | Nobody (seeded) |
| `sessions` | Any signed-in user, for open or full sessions | The host |
| `session_members` | Members of that session | Only `join_session()` and the host trigger (after the v1.1 migration) |
| `messages` | Members of that session | Members, as themselves |
| `meeting_places` | Members of that session | Members |

## Joining a session

```mermaid
sequenceDiagram
  participant A as Student A
  participant B as Student B
  participant DB as join_session()
  A->>DB: join (last seat)
  B->>DB: join (last seat)
  DB->>DB: lock the session row (FOR UPDATE)
  DB-->>A: success, status becomes full
  DB-->>B: session_full
```

## November 2026 hardening

[`supabase/migrations/20261125000000_harden_join_and_feed.sql`](../supabase/migrations/20261125000000_harden_join_and_feed.sql) fixes two gaps found while checking the proposal against the code:

1. **Seats could be taken without `join_session()`.** A policy let any signed-in user insert themselves into `session_members` through the REST API, skipping the capacity and status checks. The policy is removed; the join function and the host trigger are `SECURITY DEFINER` and keep working.
2. **`sessions_feed` skipped RLS** (`security_invoker = false`) and may have been readable with the public anon key. The view now filters rows like the sessions policy and is revoked from `anon`.

Run it once in the Supabase SQL Editor. The file ends with three checks for QA.

## Secrets

Only `NEXT_PUBLIC_SUPABASE_URL` and the public anon key reach the browser. The service key is never used in the app or committed. `.env.local` is in `.gitignore`.
