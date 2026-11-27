# Voice

## 01 Overview
Nikklas talks like a kind senior student (*kakak tingkat*) who saved you a seat: brief, warm and
practical. It speaks Bahasa Indonesia first, in everyday campus words, and English second with the
same meaning. It never pressures, never shames and never shows off. Every line helps the student do
the next thing: find a session, take a seat, say hello, get to the table.

**Voice essence:** Nikklas sounds like a classmate who saved you a seat: warm, brief and practical.

## 02 Tone dimensions
| Axis | Where Nikklas sits | Example (id / en) |
| --- | --- | --- |
| Casual ↔ formal | Casual, never sloppy. "kamu", no slang spellings | "Sapa teman belajarmu dulu." / "Say hi to your study group first." |
| Calm ↔ energetic | Calm. One exclamation mark at most, only in a success toast or greeting | "Berhasil bergabung ke sesi belajar!" |
| Serious ↔ witty | Plain. Humour is not a feature | "Sesi ini sudah penuh." / "This session is full." |
| Accessible ↔ expert | Accessible. Exam words students already use (Kuis, UTS, UAS, kelas K01) | "Periode ujian" |
| Distant ↔ close | Close, but respects privacy. Never asks for more than it needs | "Nomor telepon tidak pernah diminta." |

## 03 Voice qualities
**Low-pressure.** Invite; never push or count down. *Do:* "Belum ada sesi. Jadilah yang pertama." *Don't:* "Cepat gabung sebelum kehabisan!!"

**Brief.** One idea per line; labels of 1 to 3 words. *Do:* "2 kursi tersisa". *Don't:* "Saat ini masih tersedia 2 kursi kosong yang dapat kamu isi."

**Plain about privacy.** Say exactly what is and is not shared. *Do:* "Anggota hanya melihat nama panggilan, jurusan dan angkatanmu." *Don't:* "Data kamu 100% aman."

**Honest about the prototype.** Guest mode is a prototype; say so where it matters (entry and settings), without apology. *Do:* "Akun tamu tersimpan di browser ini." *Don't:* "Akun terverifikasi" (accounts are not verified yet).

**Kind when things fail.** Name the problem and the next step; never blame. *Do:* "Pesan belum terkirim. Coba lagi." *Don't:* "Error 500: request failed."

## 04 Vocabulary
**We say:** sesi belajar, teman belajar, gabung, kursi, terisi, penuh, ruang sesi, tempat pertemuan, buka peta, kelas K01, Kuis, UTS, UAS, topik, nama panggilan, sesi saya.

**We avoid:** match / matching (there is no algorithm), komunitas, networking, terverifikasi (until .ac.id sign-in ships), "100% aman", revolusioner, terbaik, "join sekarang", raw error text, Inggris-Indonesia mixes like "join sesi" in Indonesian screens.

**Names for people:** *kamu* and *teman belajar* in Indonesian; *you* and *study group* in English. "Host" stays as the badge for the person who posted the session.

## 05 Writing rules
- **Pronoun: always "kamu" and "-mu", never "Anda".** The tagline "Temukan teman belajarmu." sets it. Today 8 strings in `messages/id.json` use "Anda": `session.dateTimeHint`, `session.youAreHost`, `session.alreadyJoined`, `feed.profileSummary`, `mySessions.subtitle`, `mySessions.empty`, `settings.guestNoticeBody`, `settings.signOutConfirm`.
- **One word per thing.** "browser", not "peramban" (`settings.guestNoticeBody` uses "peramban"; `common.guestNote` uses "browser").
- **Sentence case everywhere**, in both languages: "Buat sesi belajar", "Hapus filter", "Tempat pertemuan", "Create a study session". About 30 labels per language are in Title Case today (for example `filters.clear` "Hapus Filter" next to `feed.clearFilters` "Hapus filter"). Course names stay as written by the campus ("MK101 Kalkulus").
- **Numbers as numerals with their unit:** "2 kursi tersisa", "2 sampai 8 orang", "maksimal 5 topik".
- **Exclamation marks:** at most one per screen, only for a success toast or a greeting. Six strings have one today; drop it from `feed.empty` and `meetingPlace.notSet`.
- **Buttons are a verb plus a thing:** "Gabung", "Posting sesi", "Simpan tempat", "Buka peta".
- **Errors:** what happened plus what to do, under the field it belongs to: "Tautan peta harus diawali https://".

## 06 Channel adaptations
| Channel | Tone | Example |
| --- | --- | --- |
| App UI | Shortest, kamu-form | "Sesi ini sudah penuh." |
| Proposal and pitch | Plain English, facts first, no hype | "Groups hold 2 to 8 seats, enforced in the database." |
| Pilot invite (WhatsApp) | Friendly, one ask | "Hai! Kami lagi uji coba Nikklas, aplikasi cari teman belajar untuk UTS. Mau ikut 2 minggu?" |
| Social posts | Warm, one fact | "UTS minggu depan? Cari teman belajar sekelasmu di Nikklas, tanpa bagi nomor HP." |
| Error and empty states | Kind, next step | "Belum ada tempat. Usulkan satu." |

## 07 Before and after (from `messages/id.json`)
| Key | Before | After | Why |
| --- | --- | --- | --- |
| `mySessions.empty` | Anda belum bergabung di sesi manapun. | Kamu belum gabung sesi apa pun. | kamu-form, everyday verb |
| `session.youAreHost` | Anda adalah Host | Kamu host sesi ini | kamu-form, sentence case |
| `settings.signOutConfirm` | Apakah Anda yakin ingin keluar? | Keluar dari akun tamu? Sesi kamu di browser ini akan hilang. | says the consequence |
| `filters.apply` | Terapkan Filter | Terapkan filter | sentence case |
| `meetingPlace.notSet` | Belum ada tempat. Usulkan satu! | Belum ada tempat. Usulkan satu. | one calm line |

## 08 Never
- Hype: revolusioner, terbaik, "game-changer", "AI-powered".
- Pressure: countdowns, "buruan", "jangan sampai ketinggalan".
- Shame: "kamu belum punya teman", "sendirian lagi?".
- Promises the product cannot keep yet: "terverifikasi", "100% aman", "ribuan mahasiswa".
