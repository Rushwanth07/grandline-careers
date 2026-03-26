# GrandLine Careers Product Architecture

## Goal
Convert GrandLine Careers from a branded demo into a usable student career guidance product with persistent onboarding, saved profile data, reusable recommendations, and a guided dashboard.

## Product Layers

### 1. Experience Layer
- Public landing page for discovery
- Auth flow for account creation and login
- Onboarding flow for first-time users
- Dashboard for returning users
- Career details pages
- AI guidance and roadmap views

### 2. Application Layer
- Authentication and session handling
- Profile and onboarding service
- Career catalog service
- Recommendation and guidance service
- Progress tracking service
- Admin/content management service

### 3. Data Layer
- User identity and auth: Firebase Authentication
- User profile, onboarding data, saved progress: Firestore
- Career catalog and curated resource data: currently in backend memory, later move to Firestore or PostgreSQL
- Guidance generation: backend recommendation engine and future LLM-enhanced layer

## Recommended Architecture Evolution

### Current state
- React + Vite frontend
- Express backend
- Firebase Auth for login
- Firestore-backed profile routes
- AI career guidance endpoint with rule-based recommendation engine

### Phase 1
- Persistent onboarding
- Logged-in dashboard
- Saved user profile
- Career match result based on saved profile
- Roadmap preview generated from saved profile

### Phase 2
- Skill assessment quizzes
- Guidance history
- Saved roadmap progress
- Resource recommendations by skill gap
- Better recommendation scoring and analytics

### Phase 3
- Resume review
- Job and internship recommendations
- Mentor matching
- Admin panel for managing roles, resources, and assessments
- Notification and reminder system

## Frontend Structure Recommendation
- `pages/Index.tsx`: public landing page
- `pages/CareerDetails.tsx`: role detail and roadmap page
- `pages/Dashboard.tsx`: onboarding + user dashboard
- `components/Navbar.tsx`: auth, navigation, dashboard access
- `components/CareerGuideAgent.tsx`: manual and guided recommendation UI
- future:
- `components/onboarding/*`
- `components/dashboard/*`
- `components/assessment/*`

## Backend Structure Recommendation
- `server.js`: route composition for now
- `agents/careerGuidance.js`: recommendation engine
- future split:
- `routes/auth.js`
- `routes/profile.js`
- `routes/careers.js`
- `routes/guidance.js`
- `services/profileService.js`
- `services/recommendationService.js`
- `services/resourceService.js`

## Phase 1 Product Flow
1. User signs in with Google or phone
2. User is redirected to dashboard
3. If onboarding is incomplete, onboarding form is shown
4. User fills education, status, interests, skills, target role, learning style, short-term goal
5. Profile is saved in Firestore
6. Dashboard requests guidance based on saved profile
7. Dashboard shows summary, top role matches, skill gaps, roadmap, and weekly plan

## Success Criteria for a Real Usable Version
- Users can sign up and return later
- Their profile stays saved
- Recommendations are personalized, not generic
- They can understand what to do next
- The app becomes useful across multiple visits, not just one demo session
