# TravelMate AI ✈️

> Your AI-powered travel companion — plan smarter, explore further.

## Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS v4  |
| Backend    | Node.js + Express.js               |
| Database   | MongoDB + Mongoose                 |
| Auth       | JWT (JSON Web Tokens) + bcryptjs   |

---

## Project Structure

```
Travel buddy/
├── frontend/    # React + Vite SPA
└── backend/     # Node.js REST API
```

---

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env     # Fill in your MONGO_URI and JWT_SECRET
npm run dev              # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm run dev              # Starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable    | Description                     |
|-------------|----------------------------------|
| `PORT`      | Server port (default: 5000)     |
| `MONGO_URI` | MongoDB connection string        |
| `JWT_SECRET`| Secret key for JWT signing       |
| `NODE_ENV`  | `development` or `production`   |

### Frontend (`frontend/.env`)

| Variable        | Description                  |
|-----------------|-------------------------------|
| `VITE_API_URL`  | Backend API base URL          |

---

## API Endpoints

| Method | Endpoint              | Description          | Access   |
|--------|-----------------------|----------------------|----------|
| POST   | `/api/auth/register`  | Register new user    | Public   |
| POST   | `/api/auth/login`     | Login user           | Public   |
| GET    | `/api/auth/me`        | Get logged-in user   | Private  |
| GET    | `/api/health`         | API health check     | Public   |

---

## Features (Foundation)

- ✅ React + Vite project scaffold
- ✅ Tailwind CSS v4 configured
- ✅ React Router v6 with centralized routes
- ✅ Dark / Light mode with localStorage persistence
- ✅ Responsive Navbar with mobile hamburger menu
- ✅ Footer with navigation links
- ✅ Express REST API with MVC architecture
- ✅ MongoDB connection with Mongoose
- ✅ JWT authentication middleware
- ✅ Centralized error handling
- ✅ Axios service with auth interceptors
- ✅ Environment variables configured

---

## License

MIT
