# GrandLine Careers Data Schema and API Contract

## Phase 1 Core Collections

### `users/{uid}`
Represents the persistent user profile and onboarding state.

Suggested fields:
- `displayName: string`
- `educationLevel: string`
- `currentStatus: string`
- `targetRole: string`
- `learningStyle: string`
- `shortTermGoal: string`
- `currentSkills: string[]`
- `interests: string[]`
- `hakiLevel: string | number`
- `devilFruit: string`
- `onboardingCompleted: boolean`
- `updatedAt: timestamp`

### Future collections

#### `guidance_history/{id}`
- `uid: string`
- `profileSnapshot: object`
- `guidance: object`
- `createdAt: timestamp`

#### `skill_assessments/{id}`
- `uid: string`
- `scores: object`
- `level: string`
- `recommendedSkills: string[]`
- `createdAt: timestamp`

#### `resource_library/{id}`
- `role: string`
- `title: string`
- `type: string`
- `url: string`
- `skillsCovered: string[]`
- `difficulty: string`

## Current APIs

### Public
- `GET /api/health`
- `GET /api/careers`
- `GET /api/careers/:id`
- `GET /api/search?q=...`
- `POST /api/agents/career-guidance`

### Authenticated
- `GET /api/profile`
- `POST /api/profile`

## Phase 1 API Contract

### `GET /api/profile`
Purpose:
- fetch logged-in user onboarding/profile data

Responses:
- `200`: existing profile
- `404`: profile not created yet
- `401/403/503`: auth or service issues

### `POST /api/profile`
Purpose:
- create or update onboarding/profile data

Request body:
```json
{
  "displayName": "Ravi",
  "educationLevel": "B.Tech Computer Science",
  "currentStatus": "Final year student",
  "targetRole": "Shipwright Tech",
  "learningStyle": "Project-based learning",
  "shortTermGoal": "Become internship ready in 3 months",
  "currentSkills": ["JavaScript", "React", "Communication"],
  "interests": ["Web development", "UI design"],
  "hakiLevel": "Growing",
  "devilFruit": "Observation Haki",
  "onboardingCompleted": true
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated! You're ready to set sail!",
  "profile": {
    "uid": "firebase-user-id",
    "displayName": "Ravi",
    "educationLevel": "B.Tech Computer Science",
    "currentStatus": "Final year student",
    "targetRole": "Shipwright Tech",
    "learningStyle": "Project-based learning",
    "shortTermGoal": "Become internship ready in 3 months",
    "currentSkills": ["JavaScript", "React", "Communication"],
    "interests": ["Web development", "UI design"],
    "hakiLevel": "Growing",
    "devilFruit": "Observation Haki",
    "onboardingCompleted": true
  }
}
```

### `POST /api/agents/career-guidance`
Purpose:
- generate personalized guidance from current profile or manual user input

Request body:
```json
{
  "currentSkills": ["JavaScript", "React", "Communication"],
  "interests": ["Web development", "UI design"],
  "goal": "Become internship ready in 3 months",
  "targetRole": "Shipwright Tech"
}
```

Response shape:
- `profileAgent`
- `opportunityAgent`
- `gapAgent`
- `roadmapAgent`
- `coachAgent`

## Next APIs to Add

### `GET /api/dashboard`
Purpose:
- return profile summary, saved roadmap progress, and latest recommendations in one call

### `POST /api/assessments`
Purpose:
- submit skill assessment answers and generate strength report

### `GET /api/resources?role=...`
Purpose:
- fetch curated learning resources for role and skill gaps

### `POST /api/guidance-history`
Purpose:
- save guidance snapshots for future progress comparison
