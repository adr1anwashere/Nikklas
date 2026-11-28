<p align="center"><img src="../docs/assets/banners/security.png" alt="Nikklas: security" width="100%"></p>

Every read and write goes through the server. Each function in [`src/lib/server/store.ts`](../src/lib/server/store.ts) takes the user ID from the session cookie and checks access before it touches the database. The browser never talks to the database.

## Who can read what

| Table | Read | Write |
| --- | --- | --- |
| `profiles` | The owner, and members of a shared session | The owner |
| `courses` | Any signed-in user | Nobody (seeded) |
| `sessions` | Any signed-in user, for open or full sessions | The host creates |
| `session_members` | Members of that session | Only the join and create functions |
| `messages` | Members of that session | Members, as themselves |
| `meeting_places` | Members of that session | Members |

## Joining a session

Joining runs in one `BEGIN IMMEDIATE` transaction: it takes the write lock, counts the seats and inserts. `npm test` starts 8 processes that race for the last seat and checks that exactly one wins.

## Guest sessions

A guest gets a random 256-bit token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. The database stores only its SHA-256 hash. Sign-out removes the hash. New guest accounts are limited to 60 per hour per network address.

## Secrets

The app needs no API keys. The database file is outside the repository (`data/` is ignored by Git).

## Known limits

- One server and one database file, with no automatic backup yet.
- The guest limit is held in memory and resets when the app restarts.
