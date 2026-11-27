# Messaging

## 01 Core message
Nikklas helps Indonesian university students find a small study group for their next exam by matching
course, class section and exam period, without sharing a phone number.

## 02 Value proposition
Nikklas is a mobile web app for students in large shared courses. Post or join a study session for
your exact course, class and exam in under 30 seconds, meet in a private room, and agree on a table in
the library. Groups hold 2 to 8 seats, and other members only see your nickname, major and year.

## 03 Taglines
| Tagline | Style | Note |
| --- | --- | --- |
| **Temukan teman belajarmu. / Find your study people.** | functional, warm | Already in the app. Names the outcome; short in both languages. **Keep (recommended).** |
| Belajar bareng, tanpa bagi nomor. | functional | Leads with privacy; good for pilot invites and social posts |
| Masih ada kursi buatmu. | emotional | Ties to the seat mark; use for campaign lines, not as the main tagline |
| Satu kelas, satu meja. | aspirational | Short and visual; less clear on its own |

## 04 Hierarchy
**Headline:** A study-group finder for Indonesian university students.

**Supporting line:** Find or post a study session for your course, class section and exam in under 30 seconds. Groups hold 2 to 8 people, and no one sees your phone number.

**Key messages**
1. **Filters that match your class.** Search by course code, class section, Kuis/UTS/UAS and topic. *Proof:* filters run in the database query over `course_id`, `section`, `exam_period` and `topic_tags`.
2. **Small groups that stay small.** Sessions hold 2 to 8 seats and close themselves when full. *Proof:* `join_session()` locks the session row; two taps on the last seat give one winner.
3. **Your number stays yours.** Members see a nickname, major and year. *Proof:* no phone or email field in `profiles`; RLS on all 6 tables.
4. **From chat to a table.** Every room has a meeting place card with a map link. *Proof:* `meeting_places.map_url` must start with `https://`.

**Proof bank:** RLS on all 6 tables · seat limit 2 to 8 in a database check · at most 5 topic tags · chat messages 1 to 1,000 characters · Bahasa Indonesia and English on every screen · production build with 0 TypeScript errors · pilot targets: fill in under 4 hours, 60% fill rate, comfort 4.0 of 5.

## 05 By audience
- **Students:** lead with the exam and the privacy. "UTS Kalkulus minggu depan? Cari kelompok belajar kelas K01 tanpa bagi nomor HP." Avoid tech words.
- **Judges and committee:** lead with the problem, then the proof (database rules, the concurrency test), then the pilot plan. Avoid claims without numbers.
- **Faculty or campus partners:** lead with the pilot: one faculty, invite-only, three metrics, no personal data beyond nickname, major and year.

## 06 By channel
| Channel | Headline approach | Length |
| --- | --- | --- |
| Entry screen | Tagline plus one line | very short |
| Pitch deck | Problem → demo → proof → pilot | medium |
| Pilot invite | One ask, one date | short |
| Social bio | "Cari teman belajar sekelas untuk Kuis, UTS dan UAS. Tanpa nomor HP." | very short |

## 07 Do not say
- "AI matching" or "smart matching": students choose sessions themselves.
- "Verified students": guest accounts are not verified until .ac.id sign-in ships.
- Any user count or percentage before the pilot reports it.
- "Replaces WhatsApp": Nikklas gets the group to the table; it does not try to be the class chat.
