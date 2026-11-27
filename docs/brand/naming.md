# Naming: validate the existing name "Nikklas"

Mode: brand-skills `naming` / validate-existing (the team already chose the name; the question is
whether to keep it and how to write it). Checked 25 Nov 2026.

## Decision: keep "Nikklas", spelled with two k and one l

| Where | Spelling found | Action |
| --- | --- | --- |
| GitHub repo, `package.json` | Nikklas / nikklas | correct |
| Old proposal PDF, `blueprint.md`, `ui.md`, `agent.md`, `README.md`, `PILOT_PLAN.md`, `DEMO_SCRIPT.md`, migration comment | Nikllas | change to Nikklas |
| `messages/id.json` and `messages/en.json` → `common.appName` | Nikllas | change to Nikklas (this is the name users see on the entry screen) |

The name's origin is not written down anywhere in the repo. Write one sentence on it before the final
pitch, because judges ask.

## Availability (light check)

| Source | What was checked | Result |
| --- | --- | --- |
| DNS | nikklas.com | Registered by a third party (GoDaddy name servers); serves a default "Welcome to nginx!" page, no business |
| DNS | nikklas.id, nikklas.co.id, nikklas.app, nikklas.my.id | No DNS records. Probably free; confirm at a registrar before relying on it |
| DNS | nikllas.* (old spelling) | No DNS records |
| Homonym | "Niklas" | A common given name; niklas.com, niklas.id and niklas.app all resolve. Expect crowded search results for "niklas" |

## Not verified
- Indonesian trademark register (DJKI, PDKI: https://pdki-indonesia.dgip.go.id/), Nice classes 9, 41 and 42. Not searched from here; search manually before any public launch beyond the competition.
- Social handles (@nikklas on Instagram, TikTok, X). Need a logged-in browser to check reliably.

## Verdict: risk (not verified)
No blocking conflict was found, but the registry was not searched and the .com is held by someone
else. That is fine for a competition and a campus pilot. Before a public launch: search PDKI, register
`nikklas.id` (or `nikklas.app`), and claim the handles.
