# Visual identity v1.1

v1.1 keeps the approved app style from `ui.md` (Style D, "Kotak-kotak dan Fraunces": cream grid paper,
peach, Fraunces) and fixes three things: WCAG AA failures, the lavender tags, and the bold-everywhere
headings. Rules for the look follow tasteskill 2.5 (`leonxlnx/taste-skill`): a neutral interface with
one accent, two type families with fixed jobs, sentence case, no violet.

## 01 Strategy statement
Nikklas should look like a tidy page from a good student's notebook: warm paper, a soft serif for
names, plain sans-serif text and one clay-red mark that says "this is where you act". The interface
stays 90 to 95% neutral so the course names, seats and messages carry the screen. The design never
competes with the student's own words.

## 02 Logo
- **Mark:** a study session seen from above. Four rounded seats in a 2 × 2 grid; three filled (taken), one outlined (open). It is the product's core moment: there is a seat left, join.
- **Wordmark:** "Nikklas" in Fraunces 600 (optical size 72, SOFT 50), drawn as outlines in `assets/`.
- **Lockups:** `nikklas-logo.svg` (ink wordmark, clay mark; default), `nikklas-logo-clay.svg` (all clay), `nikklas-logo-reversed.svg` (white on clay), `nikklas-mark.svg`, `nikklas-mark-reversed.svg` (app icon, avatar), `nikklas-wordmark.svg`.
- **Clear space:** one seat tile on every side. **Minimum size:** mark 16 px or 5 mm; lockup 96 px or 25 mm wide.
- **Don't:** stretch it; recolour the open seat; fill all four seats; add shadows or outlines; put it on a photo without a solid panel; set the name in another font; rebuild the mark from emoji or icons.

## 03 Colour
| Token | Hex | RGB | Role |
| --- | --- | --- | --- |
| Ink | #2B2220 | 43 34 32 | Text, hairlines at 12 to 15%, interface glyphs |
| Ink 2 | #5A4A46 | 90 74 70 | Secondary text (7:1 on every ground) |
| Muted | #6E5D58 | 110 93 88 | Labels, dates, meta (4.5:1 or more) |
| Clay | #A8402A | 168 64 42 | The one accent: primary button, links, focus ring, logo |
| Peach | #F4A58A | 244 165 138 | Tint only: own chat bubble, selected chip, with #3B1F1A text |
| Paper | #FFFFFF | 255 255 255 | Cards, inputs, chat |
| Cream | #FFF8F2 | 255 248 242 | App ground |
| Sand | #F7ECE3 | 247 236 227 | Chips, notes, secondary ground |
| Grid line | #EFDFD2 | 239 223 210 | Grid paper texture only |
| Edge | #9C8A84 | 156 138 132 | Input and control borders (3:1) |
| Hairline | #E9DCD3 | 233 220 211 | Dividers and card edges (decorative) |
| Success | #166534 on #DCFCE7 | | Joined, saved |
| Error | #991B1B on #FEE2E2 | | Full, failed, field errors |

**Changes from v1.0:** text #3B2F2F → #2B2220; muted #6B5B5B → #6E5D58; primary button peach → clay with white label; tags lavender #EFE9FF/#3F2E7A → sand #F7ECE3/#5A4A46 (tasteskill: never violet; and one accent); new Edge token for inputs (v1.0 border #F0DED2 is 1.31:1 on white, below the 3:1 WCAG 1.4.11 minimum).

**Banned pairs:** clay on peach (3.09:1), white on peach (1.98:1), peach text on cream (1.88:1), muted on peach (3.14:1), hairline as an input border (1.34:1).

## 03b Dark mode
Same token names, dark values. The ground is warm ink, never pure black; clay is lifted to #E57A5E so a dark label reads on it (6.2:1); peach and its label stay the same.

| Token | Dark | Contrast |
| --- | --- | --- |
| bg / surface / sand | #1C1615 / #251D1B / #302623 | |
| text / text-2 / muted | #F6EEE8 / #DCCDC5 / #B5A39C | 15.6 / 11.6 / 7.4 : 1 on bg |
| primary / on-primary | #E57A5E / #1C1615 | 6.2 : 1 |
| primary-text | #F29A80 | 8.3 : 1 on bg |
| edge | #8A7770 | 3.9 : 1 on surface |
| success / error | #86EFAC on #14301F · #FCA5A5 on #3A1A17 | 10.2 · 8.3 : 1 |

## 04 Typography
| Family | Cut | Used for |
| --- | --- | --- |
| Fraunces (OFL) | 400 at optical size 36 to 48 | Headlines 24 px / 20 pt and up |
| Fraunces | 500 to 600 at optical size 14 to 18 | Card titles, room headers, h3 |
| Figtree (OFL) | 400, 500, 600 | Everything else: body, labels, buttons, chips, chat |
| JetBrains Mono (OFL) | 400 | Code names in technical documents only, never in the app |

**Changes from v1.0:** Inter → Figtree (tasteskill bans Inter as the default look; Figtree is its listed partner for Fraunces). Fraunces 700 → 400 for large headings and 500 to 600 for small titles.

**App scale (px):** wordmark 48 · h1 30/1.15 · h2 and card title 18/1.3 (Fraunces 600) · body 15/1.45 · label 13/1.3 at 500 · caption 13 muted. **Print scale (pt):** h1 35 · h2 23 · h3 12.5 · body 10/1.55 · table 9 · note 8.5. Nothing under 13 px on screen or 8 pt in print.

## 05 Imagery
Real app screens first. Photographs only of real places and people from the pilot, with consent, at study tables, libraries and corridors of the pilot campus. No stock "students laughing at a laptop", no 3D characters, no AI-generated people.

## 06 Icons
Line icons, 1.5 px stroke, rounded joins, 20 px grid, in Ink or Clay. No emoji as icons (today `SessionCard.tsx` uses 📅 and 💬).

## 07 Design principles
1. **One accent, one action.** Clay marks the main action on a screen; everything else is neutral.
2. **Words over colour.** Every status is written ("Penuh", "2 kursi tersisa"); colour only repeats it.
3. **Paper behind, white in front.** The grid texture sits behind; text sits on solid paper cards.
4. **Calm motion.** 150 to 200 ms fades and presses; nothing moves under `prefers-reduced-motion`.

## 08 Accessibility (WCAG 2.2 AA)
- Text contrast 4.5:1 or more (body 7:1); non-text parts that identify a control 3:1 or more.
- Targets 44 × 44 px (above the 24 px minimum of 2.5.8); 8 px or more between targets.
- Visible 2 px Clay focus ring with a 2 px offset; never removed.
- Status never by colour alone; icons have `aria-label`; one `h1` per screen.
- `lang="id"` or `lang="en"` on `<html>`; mixed-language words marked.
- Text can grow to 200% without loss; no text in images.
- PDFs: tagged, with a title, language, bookmarks and alt text on figures.
