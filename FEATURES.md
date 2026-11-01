# Features

## Student Features

### 1. Video Lessons
- Browse videos by Board → Class → Subject → Topic
- View video thumbnails and metadata
- Watch videos on YouTube (external link)
- View and copy video transcripts for doubt clearing

### 2. Doubt Clearing
- Paste video transcript as context
- Ask questions about the transcript
- Receive AI-generated answers grounded in the transcript
- Visual indicator when answer includes general knowledge

### 3. Practice Tests
- View available AI-generated tests
- Filter by difficulty (easy/medium/hard)
- Take tests with question-by-question navigation
- MCQ radio buttons and text areas for answers
- Question navigator showing progress
- Auto-grading for MCQ questions
- View detailed results with feedback
- Download test as printable PDF

### 4. Past Papers
- Browse past papers by board, class, subject, and year
- Download PDF past papers
- View paper metadata (year, board, class, subject)

## Admin Features

### 1. Taxonomy Management
- CRUD operations for Boards, Classes, Subjects, Topics
- Cascade deletion (deleting a board removes all related data)
- Tabbed interface for easy navigation

### 2. Channel Management
- Add and approve YouTube channels
- Link channels to subjects
- Track channel approval status

### 3. Video Management
- Add videos with YouTube video ID
- Link videos to topics and channels
- Copy transcripts for AI grounding

### 4. Past Paper Management
- Upload past papers with metadata
- Tag papers by board, class, subject, and year
- Delete past papers

## AI Features

### 1. Doubt Clearing AI
- Uses Google Gemma 4 26B A4B via OpenRouter
- Grounded in provided transcript context
- Returns grounding indicator

### 2. Test Generation AI
- Generates MCQ questions based on topics
- Supports easy/medium/hard difficulty levels
- Includes correct answers and explanations
- Auto-grades MCQ attempts

### 3. Subjective Grading AI (Phase 2)
- Grades short/long answers
- Provides detailed feedback

## Security Features

- JWT authentication with refresh token rotation
- HttpOnly cookies for secure token storage
- Account lockout after failed attempts
- Rate limiting (100 requests/15 minutes)
- Input validation with Zod schemas
- MongoDB injection prevention
- Security headers with Helmet
