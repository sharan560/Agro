# AgroAI Spring Boot Backend

This module is a Spring Boot + MongoDB replacement for the MERN backend.
It keeps the same API routes used by the frontend.

## Tech Stack
- Java 17
- Spring Boot 3
- Spring Security (JWT)
- Spring Data MongoDB

## Setup
1. Copy `.env.example` values into your system environment or IDE run configuration.
2. Ensure MongoDB Atlas URI is reachable.
3. Run:

```bash
mvn spring-boot:run
```

Server starts on `http://localhost:3000` by default.

## Base URLs
- Local API base URL: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`
- Test: `http://localhost:3000/api/test`

## API Routes

### Auth
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/auth/test`

### Chat (JWT required)
- POST `/api/chat`
- GET `/api/chat/history`

### Motor (JWT required)
- POST `/api/motor/control`
- GET `/api/motor/status`
- GET `/api/debug/thingspeak`

### Sensors
- GET `/api/sensors/latest`
- GET `/api/sensors/history`
- GET `/api/sensors/debug`

### Weather
- POST `/api/weather`

### Device
- POST `/api/device/status`

### Disease Prediction
- POST `/predict` (multipart/form-data, field name: `image`)

## Notes
- CORS origin is read from `FRONTEND_URL`.
- If `MOCK_MODE=true`, auth accepts mock tokens prefixed with `mock-token-`.
- Chat uses Gemini API key from `GEMINI_API_KEY`.
- Weather endpoint uses OpenWeather key from `WEATHER_API_KEY`.
