# memo-backend

Standalone backend service for Memory Curve To-Do.

## Features

- Daily task CRUD APIs
- Recurring task generation (daily, weekly, monthly, weekdays)
- Learning task completion workflow with review-task generation
- Ebbinghaus review intervals: 1, 3, 7, 15, 30 days
- Mastery-based dynamic rescheduling for pending review tasks
- File persistence at data/memory-curve-db.json

## Run locally

1. Install dependencies

npm install

2. Start dev server

npm run dev

3. Default service URL

http://localhost:4000

## API

### GET /health

Returns service status.

### GET /api/tasks

Query params:
- date: YYYY-MM-DD
- from: YYYY-MM-DD
- to: YYYY-MM-DD
- includeCompleted: true or false (default true)

### POST /api/tasks

Body:
{
  "title": "Read chapter 1",
  "frequency": "daily",
  "reminderTime": "09:00",
  "isLearning": true,
  "notes": "Focus on key concepts",
  "dueDate": "2026-04-23"
}

### GET /api/tasks/:id

Returns one task.

### PATCH /api/tasks/:id

Partial updates for title, frequency, reminderTime, isLearning, notes, dueDate.

### DELETE /api/tasks/:id

Deletes one task.

### POST /api/tasks/:id/complete

Normal task completion:
{}

Learning source completion:
{
  "learnedContent": "I learned topic X"
}

Review task completion:
{
  "mastery": "good"
}

Response:
{
  "task": {},
  "createdReviews": [],
  "adjustedReviews": [],
  "nextRecurringTask": {}
}
