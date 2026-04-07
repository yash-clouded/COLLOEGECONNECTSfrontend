# Firebase hosting setup (frontend + backend separate)

This project is set up to host:

- Frontend (Vite React) on Firebase Hosting at `collegeconnects.co.in`
- Backend (FastAPI) on Cloud Run as a separate service (recommended: `api.collegeconnects.co.in`)

## 1) Prerequisites (run once)

- Install Firebase CLI:
  - `npm i -D firebase-tools`
- Login:
  - `npx firebase login`
- Make sure Google Cloud SDK is installed and logged in:
  - `gcloud auth login`
  - `gcloud config set project collegeconnect-7916a`

## 2) Deploy frontend to Firebase Hosting

From repo root:

1. Build:
   - `npm run build`
2. Deploy hosting:
   - `npx firebase deploy --only hosting`

## 3) Deploy backend separately to Cloud Run

From repo root:

1. Build and deploy:
   - `gcloud run deploy collegeconnect-api --source backend --region asia-south1 --allow-unauthenticated`

2. Set required backend environment variables (example):
   - `gcloud run services update collegeconnect-api --region asia-south1 --set-env-vars MONGODB_URI=...,DATABASE_NAME=collegeconnect,FIREBASE_SERVICE_ACCOUNT_PATH=,GOOGLE_APPLICATION_CREDENTIALS=,RESEND_API_KEY=...,RESEND_FROM='CollegeConnect <bookings@collegeconnects.co.in>'`

   Note: prefer Secret Manager for sensitive values.

## 4) Connect custom domain

- Frontend:
  - Firebase Console -> Hosting -> Add custom domain -> `collegeconnects.co.in`
- Backend:
  - Cloud Run -> `collegeconnect-api` -> Manage custom domains -> `api.collegeconnects.co.in`

## 5) Point frontend API URL to backend domain

Set frontend env for production to backend URL:

- `VITE_REST_API_URL=https://api.collegeconnects.co.in`

Rebuild and redeploy frontend after changing env:

- `npm run build`
- `npx firebase deploy --only hosting`
