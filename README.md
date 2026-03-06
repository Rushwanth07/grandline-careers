# GrandLine Careers - Backend 🏴‍☠️

The official backend for [GrandLine Careers](https://grandlinecareers.lovable.app). Powering the journey from student to Pirate King of the tech world.

## 🚀 Features
- **Firebase Auth Integration**: Securely manage your crew.
- **Haki & Profile Management**: Track user skills (Haki) and career paths in Firestore.
- **Career API**: Dynamic fetching of career paths inspired by the Straw Hat crew.
- **Premium Security**: Protected routes using Firebase ID tokens.

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file based on `.env.example` and add your Firebase Service Account credentials.

### 3. Run Locally
```bash
npm run dev
```

## ⚓ API Endpoints
- `GET /`: Welcome message.
- `GET /api/careers`: Fetch all career paths.
- `GET /api/profile`: (Protected) Fetch user Haki and profile.
- `POST /api/profile`: (Protected) Update user profile.

## 🌍 Deployment
Recommended: [Vercel](https://vercel.com) or [Firebase Functions](https://firebase.google.com/docs/functions).
