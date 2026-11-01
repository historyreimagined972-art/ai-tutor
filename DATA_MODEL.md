# Data Model

## User
```typescript
{
  _id: ObjectId
  name: string
  email: string (unique, lowercase)
  password: string (bcrypt hashed)
  role: 'admin' | 'student'
  isActive: boolean
  lastLogin?: Date
  loginAttempts: number
  lockUntil?: Date
  createdAt: Date
  updatedAt: Date
}
```

## Board
```typescript
{
  _id: ObjectId
  name: string (unique)
  country: string
  createdAt: Date
  updatedAt: Date
}
```

## Class
```typescript
{
  _id: ObjectId
  name: string
  board: ObjectId (ref Board)
  grade: number
  createdAt: Date
  updatedAt: Date
}
```

## Subject
```typescript
{
  _id: ObjectId
  name: string
  class: ObjectId (ref Class)
  code?: string
  createdAt: Date
  updatedAt: Date
}
```

## Topic
```typescript
{
  _id: ObjectId
  name: string
  subject: ObjectId (ref Subject)
  description?: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

## Channel
```typescript
{
  _id: ObjectId
  name: string
  youtubeChannelId: string (unique)
  subject: ObjectId (ref Subject)
  isApproved: boolean
  uploadedBy: ObjectId (ref User)
  createdAt: Date
  updatedAt: Date
}
```

## Video
```typescript
{
  _id: ObjectId
  title: string
  youtubeVideoId: string (unique)
  topic: ObjectId (ref Topic)
  channel: ObjectId (ref Channel)
  transcript?: string
  duration?: number
  thumbnailUrl?: string
  isApproved: boolean
  uploadedBy: ObjectId (ref User)
  createdAt: Date
  updatedAt: Date
}
```

## Doubt
```typescript
{
  _id: ObjectId
  student: ObjectId (ref User)
  video: ObjectId (ref Video)
  question: string
  answer: string
  isGroundedInTranscript: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Test
```typescript
{
  _id: ObjectId
  title: string
  topics: ObjectId[] (ref Topic)
  difficulty: 'easy' | 'medium' | 'hard'
  questions: [{
    number: number
    type: 'mcq' | 'short' | 'long'
    question: string
    options?: string[]
    correctAnswer: string
    marks: number
    explanation?: string
  }]
  totalMarks: number
  createdBy: ObjectId (ref User)
  createdAt: Date
  updatedAt: Date
}
```

## Attempt
```typescript
{
  _id: ObjectId
  test: ObjectId (ref Test)
  student: ObjectId (ref User)
  answers: [{
    questionNumber: number
    type: 'mcq' | 'short' | 'long'
    studentAnswer: string
    score?: number
    maxScore: number
    isCorrect?: boolean
    feedback?: string
  }]
  totalScore: number
  maxScore: number
  percentage: number
  status: 'in_progress' | 'submitted' | 'graded'
  startedAt: Date
  submittedAt?: Date
  gradedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## PastPaper
```typescript
{
  _id: ObjectId
  title: string
  board: ObjectId (ref Board)
  class: ObjectId (ref Class)
  subject: ObjectId (ref Subject)
  year: number
  fileUrl: string
  fileName: string
  extractedText?: string
  uploadedBy: ObjectId (ref User)
  createdAt: Date
  updatedAt: Date
}
```

## Indexes

- User: email (unique)
- Board: name (unique)
- Class: board + name (compound)
- Subject: class + name (compound)
- Topic: subject + name (compound)
- Channel: youtubeChannelId (unique)
- Video: youtubeVideoId (unique), topic
- Doubt: student, video
- Test: topics, createdBy
- Attempt: test + student (compound)
- PastPaper: board + class + subject + year (compound)
