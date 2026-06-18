# TravelMate AI ✈️

> Your AI-powered travel companion — find travel buddies, plan smarter, explore further.

## 🌐 Live Deployment

| Service  | URL |
|----------|-----|
| **Frontend** | [https://travel-buddy-and-ai-travel-assistan.vercel.app](https://travel-buddy-and-ai-travel-assistan.vercel.app) |
| **Backend API** | [https://travel-buddy-and-ai-travel-assistant.onrender.com](https://travel-buddy-and-ai-travel-assistant.onrender.com) |
| **Health Check** | [https://travel-buddy-and-ai-travel-assistant.onrender.com/api/health](https://travel-buddy-and-ai-travel-assistant.onrender.com/api/health) |

> ⚠️ The backend is hosted on Render's free tier — it may take 30–50 seconds to wake up after inactivity.

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 18 + Vite                     |
| Styling    | Vanilla CSS (custom design system)  |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB Atlas + Mongoose            |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Real-time  | Socket.io (WebSockets)              |
| AI         | Google Gemini API                   |
| Hosting    | Vercel (frontend) + Render (backend)|

---

## 📁 Project Structure

```
Travel buddy/
├── frontend/    # React + Vite SPA
└── backend/     # Node.js REST API + Socket.io
```

---

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env     # Fill in your MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev              # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                              |
|------------------|-------------------------------------------|
| `PORT`           | Server port (default: 5000)              |
| `MONGO_URI`      | MongoDB Atlas connection string          |
| `JWT_SECRET`     | Secret key for JWT signing               |
| `NODE_ENV`       | `development` or `production`            |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant   |
| `CLIENT_URL`     | Frontend URL (for CORS)                  |

### Frontend (`frontend/.env`)

| Variable        | Description               |
|-----------------|----------------------------|
| `VITE_API_URL`  | Backend API base URL       |

---

## 📡 API Endpoints

| Method | Endpoint                     | Description                    | Access   |
|--------|------------------------------|--------------------------------|----------|
| GET    | `/api/health`                | API health check               | Public   |
| POST   | `/api/auth/register`         | Register new user              | Public   |
| POST   | `/api/auth/login`            | Login user                     | Public   |
| GET    | `/api/auth/me`               | Get logged-in user             | Private  |
| PUT    | `/api/auth/profile`          | Update profile                 | Private  |
| POST   | `/api/auth/verify`           | Submit ID for verification     | Private  |
| POST   | `/api/auth/follow/:id`       | Follow / unfollow a user       | Private  |
| GET    | `/api/matches`               | Get compatible travel buddies  | Private  |
| GET    | `/api/trips`                 | Get all trips                  | Private  |
| POST   | `/api/trips`                 | Create a trip                  | Private  |
| GET    | `/api/messages/conversations`| Get conversation list          | Private  |
| GET    | `/api/messages/:userId`      | Get DM history                 | Private  |
| POST   | `/api/messages/:userId`      | Send a DM (REST fallback)      | Private  |
| GET    | `/api/messages/trip/:tripId` | Get trip group chat            | Private  |
| POST   | `/api/reviews`               | Submit a buddy review          | Private  |
| GET    | `/api/reviews/:userId`       | Get reviews for a user         | Public   |
| POST   | `/api/assistant`             | AI travel assistant            | Private  |
| GET    | `/api/admin/verifications`   | Get pending ID verifications   | Admin    |
| PUT    | `/api/admin/verify/:id/approve` | Approve verification        | Admin    |
| PUT    | `/api/admin/verify/:id/reject`  | Reject verification         | Admin    |

---

## ✨ Features

- ✅ User registration & JWT authentication
- ✅ AI-powered travel assistant (Google Gemini)
- ✅ Travel buddy matching with compatibility scoring
- ✅ Real-time chat (Socket.io + REST fallback + polling)
- ✅ Trip creation, management & group chat
- ✅ Buddy reviews & trust score system
- ✅ ID verification with admin approval dashboard
- ✅ Community feed with posts & likes
- ✅ Safety tools (emergency contacts, trip sharing)
- ✅ AI trip planner with itinerary generation
- ✅ Dark / Light mode
- ✅ Fully responsive design

---

## 📄 License

MIT


