# API Reference

Base URL: `/api/v1`

## Authentication

### Register
```
POST /auth/register
Body: { name, email, password, role }
Response: { data: { user, accessToken } }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { data: { user, accessToken } }
Cookie: refresh_token (HttpOnly)
```

### Refresh Token
```
POST /auth/refresh
Cookie: refresh_token
Response: { data: { accessToken } }
```

### Logout
```
POST /auth/logout
Response: { data: { message } }
```

### Get Me
```
GET /auth/me
Response: { data: { user } }
```

## Taxonomy

### Get Taxonomy Tree
```
GET /taxonomy/tree
Response: { data: [{ _id, name, classes: [{ _id, name, subjects: [{ _id, name, topics }] }] }] }
```

### Create Board (Admin)
```
POST /taxonomy/boards
Body: { name, country }
Response: { data: { board } }
```

### Get Boards
```
GET /taxonomy/boards
Response: { data: [{ _id, name, country }] }
```

## Videos

### Get Videos for Student
```
GET /content/videos/student?topicId=xxx
Response: { data: [{ _id, title, youtubeVideoId, channel, thumbnailUrl }] }
```

### Get Video Transcript
```
GET /content/videos/:id/transcript
Response: { data: { transcript } }
```

### Add Video (Admin)
```
POST /content/videos
Body: { title, youtubeVideoId, topicId, channelId }
Response: { data: { video } }
```

## Doubts

### Ask Doubt
```
POST /doubts/ask
Body: { transcript, question }
Response: { data: { answer, isGroundedInTranscript } }
```

## Tests

### Generate Test
```
POST /tests/generate
Body: { topics, difficulty, numberOfQuestions, totalMarks }
Response: { data: { test } }
```

### Get Tests
```
GET /tests
Response: { data: [{ _id, title, difficulty, totalMarks }] }
```

### Start Attempt
```
POST /tests/:id/start
Response: { data: { attempt } }
```

### Submit Attempt
```
POST /tests/attempts/:id/submit
Body: { answers: [{ questionNumber, type, studentAnswer }] }
Response: { data: { attempt } }
```

### Get Attempt
```
GET /tests/attempts/:id
Response: { data: { attempt } }
```

### Download Test PDF
```
GET /tests/:id/pdf
Response: PDF file
```

## Past Papers

### Get Past Papers
```
GET /past-papers?board=xxx&class=xxx&subject=xxx&year=2024&page=1&limit=20
Response: { data: [{ _id, title, board, class, subject, year, fileUrl }], pagination: { total, page, totalPages } }
```

### Upload Past Paper (Admin)
```
POST /past-papers
Body: { title, board, class, subject, year, fileUrl, fileName }
Response: { data: { pastPaper } }
```

### Delete Past Paper (Admin)
```
DELETE /past-papers/:id
Response: { data: { message } }
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```
