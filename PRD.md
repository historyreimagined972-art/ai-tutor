# Product Requirements Document — AI Tutor Web App (Pakistan)

**Version:** 1.0 (Draft for opencode agent build)
**Base architecture:** Adapted from your Full-Stack Project Blueprint (MERN + TypeScript, industry-agnostic)
**Budget constraint:** $0 — every service below is chosen to have a working free tier

---

## 1. Product Summary

A web app that acts as an AI tutor for Pakistani students. A student selects **Country → Board → Class → Subject → Topic**, and the app:

1. Suggests 1–3 curated videos for that exact topic (from channels you've pre-approved)
2. Lets the student copy the video transcript, then ask an AI follow-up questions grounded in that transcript ("Doubt Clearing")
3. Generates a topic-based test (objective + subjective, chosen difficulty, one or multiple topics), gradeable by AI — including handwritten answers submitted as photos, and on-screen typed answers

Two roles: **Admin** (you) and **Student**.

---

## 2. Users & Roles

| Role | Access |
|---|---|
| **Admin** | Manage taxonomy (country/board/class/subject/topic), manage channels & videos per topic, review AI-flagged content, view usage |
| **Student** | Select taxonomy filters, watch/browse suggested videos, use Doubt Clearing, take/print/download tests, upload photos of handwritten answers |

No student login is *required* for MVP (reduces build time) — but you'll want at least a lightweight identifier (name + class + device) to save test history. Recommend: simple email+password or Google OAuth per the blueprint, deferred to Phase 2 if you want zero-friction launch.

---

## 3. Taxonomy (Core Data Model Driver)

Everything hangs off this filter chain:

```
Country (Pakistan for now)
 └─ Board (Federal Board, Bahawalpur Board, Punjab Board, Sindh Board, etc.)
     └─ Class (9 and 10 only for now — structure supports 11/12 later without a rebuild)
         └─ Subject (Physics, Chemistry, Urdu, English, etc.)
             └─ Topic (e.g. "Newton's Laws of Motion")
```

**Class scope (V1):** Classes 9 and 10 only. Keep `Classes` as data, not a hardcoded enum, so 11/12 (and beyond) are a content-adding exercise later, not a code change.

Admin manages this taxonomy as structured data (not hardcoded) so new boards/classes/subjects can be added without a code change — critical since you'll expand boards/subjects over time.

---

## 4. Feature 1 — Video Recommendation

**Student flow:**
- Selects Class, Subject, Topic, Country, Board
- App returns 1–3 videos tagged to that exact topic, pulled from **Admin-approved channels only**
- Each video shows: title, channel, duration, thumbnail, and a **"Copy Transcript"** button

**Admin flow:**
- Add a channel once per subject (e.g. "XYZ Physics" channel → tagged to Physics)
- Two ways to attach videos to a topic (per your answer — support both):
  1. **Manual:** paste a YouTube URL, pick the topic it belongs to, title auto-fills
  2. **Auto-pull:** search within an approved channel via YouTube Data API by keyword, then approve/tag results to a topic with one click (admin still approves — nothing goes live unreviewed)
- Transcript is fetched via YouTube's caption/transcript API at the time the video is added and cached in the database (don't re-fetch per student — saves quota and load time)

**Note on YouTube Data API quota:** the free daily quota (10,000 units/day) is enough for admin-side curation (you're not doing this per-student-request), so keep video *search* on the admin side only. Students never trigger a live YouTube API call — they read from your database.

---

## 5. Feature 2 — Doubt Clearing

**Flow:**
1. Student pastes the transcript they copied from Feature 1 (or any transcript)
2. Student asks a question about the topic
3. AI answers **grounded only in that transcript** (instruct the model: "Answer using only the following transcript; if the answer isn't in it, say so and give a general explanation clearly marked as outside the transcript")

This keeps answers relevant to what the student actually watched, and avoids the AI contradicting the teacher in the video.

**Implementation:** send transcript + question in a single prompt to the LLM (transcripts are short enough — a 10–15 min video transcript is well within a free-tier context window). No need for embeddings/RAG at this scale.

---

## 6. Feature 3 — Test Generation, Taking & Grading

This is the most complex feature — per your decision, full scope is in V1: objective + subjective + handwritten OCR.

**Test creation (student-facing):**
- Student picks: one or more topics (can span subjects if desired), difficulty (Easy/Medium/Hard), and question mix (MCQ, short answer, long answer — or let AI decide mix)
- AI generates a "professional" test paper: numbered questions, marks per question, instructions header, matching the style of the topic/board
- Options: **Print/Download (PDF)**, or **Take On-Screen**

**On-screen wording variation:** when the same generated test is taken on-screen vs printed, reword surface phrasing slightly (not meaning) so it isn't literally copy-pasteable between the two — a simple "rephrase without changing meaning or difficulty" instruction to the AI at render time.

**Answer submission — 3 paths:**
1. **Type answers on-screen** → graded directly
2. **Upload a photo of handwritten answers** → OCR (via the vision-capable LLM directly — Gemini's free tier models are multimodal, so no separate OCR service needed) → extracted text graded same as typed
3. **Print, complete on paper, then upload photo afterward** → same OCR path as #2

**Grading:**
- Objective (MCQ/fill-in-blank): deterministic — compare to the answer key generated alongside the test, no AI needed, instant score
- Subjective (short/long answer): AI grades against a model answer + rubric generated with the test, gives partial credit and written feedback
- **Solution sheet:** after submission, show/print full solutions — answer + explanation, generated to match how the topic is taught in the standard textbook for that board (prompt the AI with board + class + subject + topic context so explanations use board-appropriate terminology/depth, not generic content)

---

## 6a. Feature 4 — Past Papers

**Admin flow:**
- Upload past papers as PDF (or images) tagged to Board + Class + Subject + Year (topic-tagging optional/best-effort — past papers usually span multiple topics)

**Student flow:**
- Browse/download past papers filtered by Board + Class + Subject, alongside the video/topic flow

**Why this matters beyond a simple download library:** feed the uploaded past papers to the AI as **style/content reference** when generating tests (Feature 3). This directly strengthens the board-accuracy differentiation — AI-generated tests should mimic the real question phrasing, mark distribution, and difficulty pattern of that board's actual papers, not generic AI-invented questions. Extract text from uploaded papers (OCR if scanned) once at upload time and store it, so it's cheap to reference at generation time without re-processing per request.

*Assumption:* past papers are a reference/resource category (view + download + AI grounding), not something students submit answers to directly in V1 — that overlaps with Feature 3's test-taking flow, so keep them separate to avoid duplicate functionality. Flag if you actually want "take this past paper as a live test" — that's a small addition on top of Feature 3's grading pipeline, not a new one.

---

## 7. AI Provider — Recommendation

Since budget is $0: **Google Gemini API free tier**, accessed via Google AI Studio (no credit card required).

- Multimodal out of the box → handles the handwritten-photo OCR/grading without a separate OCR service
- Flash-tier models (free) are enough for transcript Q&A, test generation, and grading — you don't need the Pro-tier reasoning models for this use case
- **Caveat:** free tier has real rate limits (roughly 10–15 requests/minute, few hundred requests/day depending on model — Google adjusts these without much notice). Fine for early testing and a small user base; you will hit limits if usage grows. Build a queue/retry-with-backoff pattern from day one so this degrades gracefully (e.g. "test is generating, please wait") rather than crashing.
- If/when you have even a small budget later, Gemini Flash is also the cheapest paid option to fall back to — no code changes needed, just remove the free-tier constraint.

Keep the AI calls behind a single internal service (`services/ai.service.ts`) so swapping providers later (OpenAI/Claude) is a one-file change, not a rewrite.

---

## 8. Tech Stack (from your blueprint, applied to this app)

| Layer | Choice | Free-tier note |
|---|---|---|
| Backend | Express + TypeScript + Mongoose | — |
| Database | MongoDB Atlas | Free M0 cluster (512MB) — fine for MVP |
| AI | Gemini API (Google AI Studio) | Free tier, see §7 |
| Video metadata/transcripts | YouTube Data API v3 | Free quota, admin-side only |
| Frontend | React + Vite + TypeScript | — |
| Auth | Email/password (+ optional Google OAuth later) | — |
| File storage (answer photos) | Cloudinary | Free tier (25 credits/mo) sufficient for MVP photo volume |
| PDF generation (printable tests) | `pdf` library server-side (e.g. Puppeteer or pdf-lib) | Self-hosted, no cost |
| Frontend hosting | Vercel | Free tier |
| Backend hosting | Render (free web service) | Free tier — note: free Render services sleep after inactivity; first request after idle will be slow. Acceptable for MVP, revisit at scale |
| Monitoring | Sentry | Free tier (5k events/mo) |

Security middleware, JWT pattern, `.env` handling, and repo structure: follow your blueprint's Sections 2–8 exactly (they're stack-appropriate as-is; no changes needed for this domain).

---

## 9. Data Model (core collections)

- `Boards` — country, board name
- `Classes` — class/grade label, board ref
- `Subjects` — name, class ref
- `Topics` — name, subject ref
- `Channels` — name, YouTube channel ID, subject ref, approved (bool)
- `Videos` — YouTube video ID, title, topic ref, channel ref, cached transcript, duration
- `Tests` — topics[], difficulty, questions[] (type, text, marks, correct answer/rubric), generated PDF url, createdBy (student session)
- `Attempts` — test ref, answers[] (typed text or photo url + OCR'd text), score, AI feedback, submittedAt
- `PastPapers` — board ref, class ref, subject ref, year, file url, extracted text (cached for AI reference)
- `Users` — role (admin/student), auth fields (if login added)

---

## 10. Non-Functional Requirements

- **Cost:** must run entirely on free tiers at current scale (see §8) — flag in code/comments anywhere a paid feature is being approached
- **Board-accuracy:** all AI-generated content (tests, solutions) must be prompted with explicit board + class + subject context so it matches Pakistani curriculum conventions, not generic international content
- **Content safety:** admin approval gate on all videos before they're visible to students — no unmoderated content reaches learners
- **Graceful AI degradation:** rate-limit/timeout handling on every AI call (§7) — never a blank error screen
- **Mobile-first UI:** assume most students access via phone browser
- **UI/UX — keep it simple, not complex:** plain, minimal screens over dense dashboards. Each category (Video Recs, Doubt Clearing, Test, Past Papers) should be its own clearly separate page/section — not tabs crammed into one crowded screen. Admin panel and Student panel should be visually and structurally separate (different layouts, not one shared screen with role-based toggles). Favor few clear buttons and obvious next-steps over feature-dense screens — this is for students, so clarity beats sophistication every time.

---

## 11. Roadmap

**Phase 1 (MVP — build first):**
- Taxonomy admin CRUD, scoped to Classes 9 & 10 only
- Manual video adding (skip YouTube API auto-pull initially — it's the more complex path)
- Video recommendation flow (student side)
- Doubt clearing (transcript + Q&A)
- Test generation: objective questions only, on-screen typing + auto-grade
- PDF download of test
- Past papers upload (admin) + browse/download (student) — even without AI-grounding wired in yet, this is a simple win to ship early

**Phase 2:**
- YouTube API auto-pull for admin video search
- Subjective question generation + AI grading
- Handwritten photo upload + OCR grading
- On-screen wording variation vs print version
- Full solution sheets matching textbook style
- Wire past papers in as AI grounding reference for test generation (style/pattern matching)

**Phase 3:**
- Student accounts + history/progress tracking
- Multi-topic combined tests
- Analytics for admin (which topics/videos are most used)

*(Given your "full mix in V1" preference, Phases 1+2 can be built back-to-back rather than gated — this split is to help opencode agents build and test incrementally, not to delay features from you.)*

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Gemini free-tier rate limits hit under real usage | Queue + backoff + user-facing "generating, please wait"; monitor usage, be ready to add a paid tier later |
| YouTube transcript unavailable for some videos | Fall back to manual transcript paste by admin |
| OCR misreads messy handwriting | Show student the OCR'd text before final grading so they can flag errors |
| Free hosting cold-starts (Render sleep) | Acceptable for MVP; revisit paid tier if usage grows |
| Copyright — curating others' YouTube videos | You're linking/embedding, not rehosting content, which is standard practice; transcripts are cached for your own AI use, not redistributed publicly |

---

## 13. Open Assumptions (confirm before build)

- No student login required for MVP test-taking (can add later without breaking anything)
- "Print" means client-side print-to-PDF of the rendered test page, not a separate export pipeline
- Difficulty levels are Easy/Medium/Hard (adjust if you use a different local convention)
