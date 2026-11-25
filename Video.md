# Nikllas — Semifinal Video Script & Presentation Guide

**Competition:** STACK 2026 (GDGoC ITB)  
**Track:** Case 1 — Smarter Campus and Learning  
**Team Name:** Satu Orang Satu Ubin  
**Product Name:** Nikllas  
**Max Duration:** 2 Minutes (120 seconds)  
**Language:** English (Official competition language)  
**Visual Format:** Slide presentation + UI wireframe / mockup animations (No live production application shown)

---

## 1. Product Abstract

> **Nikllas** is a lightweight, privacy-first peer study-group matchmaking platform designed for Indonesian university students. In large lecture classes, commuter students, newcomers, and introverted learners frequently struggle with the "cold-start" social friction of finding study partners for quizzes, midterms (UTS), and finals (UAS). Nikllas eliminates this barrier through course-specific and exam-targeted session discovery, zero-friction guest entry, strict privacy boundaries (displaying only nicknames, academic year, and major without revealing phone numbers or emails), and atomic seat-reservation mechanics to ensure groups never exceed manageable study limits.

---

## 2. Video Technical Specifications

| Parameter | Specification | Rule Reference |
|---|---|---|
| **Maximum Duration** | 1 minute 55 seconds (Leaves 5-second safety buffer under 2:00) | Handbook p. 11 & 12 |
| **Resolution** | 1080p Full HD (1920 × 1080), 30 or 60 fps | Handbook p. 11 |
| **Audio** | Clear English voiceover + soft, royalty-free background music | Handbook p. 11 |
| **Subtitles** | English subtitles hardcoded at bottom center | Handbook p. 11 |
| **Visual Approach** | Concept slides, user journey diagrams, and Figma UI mockups | Conforms to rule: *early prototype / mockups* |

---

## 3. Storyboard & Timing Breakdown

| Timecode | Segment | On-Screen Visuals | Voiceover Focus |
|---|---|---|---|
| **0:00 – 0:18** | **Team Intro & Problem** | Title slide: Team *Satu Orang Satu Ubin*, Nikllas logo.<br>Graphic showing isolated student vs. 300-student lecture hall. | Introduce team and define the isolation problem among commuter and first-year university students. |
| **0:18 – 0:38** | **Product Introduction** | Product concept slide: *"Nikllas: Find Your Study People"*, 3 pillar icons (Course-based, Low-friction, Safe). | Introduce Nikllas, value proposition, and why informal social media groups fail for quiet students. |
| **0:38 – 1:18** | **Core User Flow (UI Mockups)** | Animated Figma mockups / UI wireframe walkthrough:<br>1. Quick profile setup (No phone number)<br>2. Filtered feed by course & exam (Kuis/UTS)<br>3. Atomic 1-tap join flow<br>4. Private study room & agreed meeting location. | Step-by-step walkthrough of the user journey from discovering a session to coordinating a study spot. |
| **1:18 – 1:45** | **Current State vs. Final Day Plan** | Split screen / Architecture roadmap diagram:<br>• **Current State (Validated):** System architecture, data schemas, UI design system, concurrency logic.<br>• **Final Day Build Tasks:** Verified `.ac.id` email login, student moderation/reporting, automated calendar sync. | Explicitly address the competition requirement: what is designed today vs. what substantive tasks remain for the Final Day build session. |
| **1:45 – 1:55** | **Closing & Impact** | Summary slide with team contact & STACK 2026 logo. | Final impactful sentence connecting the solution to student success and psychological safety. |

---

## 4. Word-for-Word Spoken Script (English)

### Section 1: Introduction and Problem (0:00 – 0:18)
> *"Hello judges and mentors of STACK 2026. We are Team Satu Orang Satu Ubin, and this is Nikllas.*  
> *Every semester, thousands of Indonesian university students—especially freshmen and daily commuters—face a silent struggle: studying alone. In massive classes with hundreds of peers, asking strangers for study partners in chaotic WhatsApp groups feels intimidating, high-pressure, and socially risky."*

---

### Section 2: The Solution & Product Concept (0:18 – 0:38)
> *"To solve this, we created **Nikllas**: a focused, privacy-conscious study-group matchmaking platform built specifically around courses, sections, and exam periods.*  
> *Nikllas removes social anxiety by replacing high-friction friend requests with structured, course-aligned study sessions—ensuring no student has to prepare for an exam in isolation."*

---

### Section 3: The Proposed User Flow (0:38 – 1:18)
*(Show animated Figma screens / UI mockups)*

> *"Here is how Nikllas works from the student's perspective:*  
> 
> *First, **Zero-Friction Entry**: Students can immediately set up a minimal academic profile—just a nickname, major, year, and subject topics. Phone numbers and personal contact information are never collected or exposed.*  
> 
> *Second, **Targeted Discovery**: Instead of endless scrolling, students filter study groups by specific course codes—like Calculus or Basic Physics—and exam periods like Midterms or Quizzes.*  
> 
> *Third, **One-Tap Capacity-Controlled Joining**: Group sizes are strictly capped between two to eight students. Once a session fills, it automatically closes, preventing overcrowded or unproductive groups.*  
> 
> *Finally, **Coordination Room**: Enrolled members enter a private session space to align on discussion agendas and confirm a physical meeting spot—such as a campus library table or gazebo—linked directly to Google Maps."*

---

### Section 4: Current Progress & Final Day Plan (1:18 – 1:45)
*(Show System Architecture & Roadmap Diagram)*

> *"At this semifinal stage, we have established our complete system architecture, defined the relational database schemas with Row Level Security, and validated our core user interface design and concurrency requirements.*  
> 
> *For the Final Day build session, we have planned three substantive implementation milestones:*  
> *1. Integrating verified institutional `.ac.id` campus single sign-on,*  
> *2. Implementing student moderation and report-handling mechanisms to safeguard psychological comfort, and*  
> *3. Building automated session reminders and calendar export integrations."*

---

### Section 5: Conclusion (1:45 – 1:55)
> *"With Nikllas, finding academic support is simple, respectful, and accessible to every student. Thank you, and we look forward to bringing Nikllas to life at STACK 2026!"*

---

## 5. Visual Asset Guidelines (What to Show on Screen)

To avoid any rule-breaking concerns while keeping the video visually engaging:

1. **Do NOT show:**
   - Production browser address bar (`localhost:3000` or live Vercel URL).
   - Code editors (VS Code / terminal).
   - Live browser interactions that look like a completed commercial release.

2. **DO show:**
   - **Slide 1:** Clean title slide with STACK 2026 logo, Team Name (*Satu Orang Satu Ubin*), and Case 1 tag.
   - **Slide 2:** Infographic depicting the student pain point: *"Why do 60%+ of commuter students study alone?"*
   - **Slide 3:** Product Architecture Diagram (Client $\rightarrow$ Auth Layer $\rightarrow$ Relational Schema & Row Level Security).
   - **Slide 4 to 7 (Figma Mockups):** Clean mobile device frames displaying the UI wireframes/screens with smooth pan or click-through animations.
   - **Slide 8:** Roadmap table clearly distinguishing **"Current Progress (Design & Specification)"** from **"Final Day Build Deliverables"**.

---

## 6. Word Count & Pacing Verification

- **Total Spoken Word Count:** ~280 words.
- **Average Speaking Pace:** 140–145 words per minute (standard natural conversational pace).
- **Estimated Runtime:** **1 minute 52 seconds** (perfectly within the 2:00 limit).
