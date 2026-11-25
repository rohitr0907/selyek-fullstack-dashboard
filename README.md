# Sterna Selyek Full-Stack Dashboard & Locations

A full-stack web application built with **React + Material UI (MUI)** on the frontend and **Node.js + Express + JWT** on the backend.

## Features
- **Login Page (`/login`)**:
  - Client-side email format validation and minimum 8-character password validation.
  - Password visibility toggle, Forgot Password & OTP demo actions.
  - Authenticates against `POST /api/auth/login` and redirects to `/dashboard`.
- **Dashboard Page (`/dashboard`)**:
  - Protected route with persistent sidebar navigation (`Dashboard`, `Locations`, etc.) and footer.
  - Live greeting & timestamp, 6 colored KPI summary cards, 3 status panels, and a `"Login successful"` toast notification.
- **Locations Page (`/locations`)**:
  - Master-detail view with searchable locations list (`R S Puram / Coimbatore`), add-location dialog, tabs (`Lock Mapping`, `Lock Group`, `Geofence`, `Gateway Mapping`), and Lock Mapping table with search, add, and delete functionality.

## Demo Credentials
- **Email:** `leo@sterna.com`
- **Password:** `Password@123`

## Getting Started

### 1. Start the Backend (`server`)
```bash
cd server
npm install
npm run dev
```
The API server runs on `http://localhost:5000`.

### 2. Start the Frontend (`client`)
```bash
cd client
npm install
npm run dev
```
Open the local Vite URL (typically `http://localhost:5173`) in your browser.
