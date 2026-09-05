# 3W Social App

A full-stack social media application built with React, Vite, Express, MongoDB, and Cloudinary.

Users can create accounts, publish text and media posts, create polls, interact with posts, follow other users, save posts, manage their profile, and customize app settings.

## Features

### Authentication

- User signup and login
- JWT-based authentication
- Persistent browser session
- Logout
- Protected API routes

### Posts

- Create text posts
- Upload images
- Upload short videos
- Video validation: maximum 60 seconds and 25 MB
- Edit your own posts
- Delete your own posts
- Owner-only edit and delete menu
- Like and unlike posts
- Comment on posts
- Share posts through the browser share API
- Save and unsave posts
- Dedicated Saved Posts view

### Polls

- Create polls with 2 to 4 options
- Store poll options in MongoDB
- Vote on polls
- Change your poll vote
- View vote counts

### People and Profiles

- People discovery page
- Search users by username
- Follow and unfollow users
- View user profiles
- View profile bio, post count, follower count, and following count
- View a user's posts, images, videos, and polls

### Settings

- Edit profile bio
- Light and dark appearance modes
- Notification preferences
- Logout
- Local preference persistence

## Tech Stack

### Frontend

- React 19
- Vite
- Axios
- React Router DOM
- Material UI icons
- `emoji-picker-react`
- CSS custom properties and responsive layouts

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- CORS

## Project Structure

```text
3W-Social-APP/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   ├── .env.example
│   └── package.json
└── README.md
```

## Requirements

Install these before running the project:

- Node.js 20 or newer recommended
- npm
- MongoDB Atlas account or a local MongoDB server
- Cloudinary account for image and video uploads

## Local Setup

### 1. Clone the repository

```powershell
git clone <your-repository-url>
cd 3W-Social-APP
```

### 2. Install backend dependencies

```powershell
cd backend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env` from `backend/.env.example`:

```powershell
Copy-Item .env.example .env
```

Set the values in `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLIENT_URL=http://localhost:5173
```

Never commit `.env` or place backend secrets in the frontend.

### 4. Install frontend dependencies

Open a second terminal:

```powershell
cd frontend
npm install
```

### 5. Configure frontend environment variables

Create `frontend/.env` from `frontend/.env.example`:

```powershell
Copy-Item .env.example .env
```

Set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the backend

From `backend`:

```powershell
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

### 7. Start the frontend

From `frontend`:

```powershell
npm run dev
```

Vite displays the local frontend URL, normally:

```text
http://localhost:5173
```

## Production Commands

### Frontend

```powershell
cd frontend
npm run lint
npm run build
npm run preview
```

### Backend

```powershell
cd backend
npm start
```

## API Overview

All API routes are prefixed with `/api`.

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Posts

```text
GET    /api/posts
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
POST   /api/posts/:id/save
POST   /api/posts/:id/comments
POST   /api/posts/:id/poll/:optionId/vote
```

Supported feed query parameters:

```text
GET /api/posts?filter=following
GET /api/posts?filter=saved
GET /api/posts?sort=popular
GET /api/posts?sort=latest
GET /api/posts?community=javascript
```

### Users

```text
GET  /api/users/me
PUT  /api/users/me
GET  /api/users/:id
GET  /api/users/suggestions
POST /api/users/:id/follow
```

### Discovery

```text
GET /api/topics/trending
GET /api/communities
GET /api/notifications
```

Protected routes require:

```text
Authorization: Bearer <jwt-token>
```

## Deployment

Deploy the backend before the frontend so the frontend has a production API URL.

### Backend on Render

Create a Render Web Service with:

```text
Root directory: backend
Build command: npm install
Start command: npm start
```

Add these Render environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Render provides `PORT` automatically. Do not hardcode a production port unless your deployment setup requires it.

After deployment, verify:

```text
https://your-backend-service.onrender.com/
```

Expected response:

```json
{"message":"3W Social App API is running"}
```

### Frontend on Vercel

Create a Vercel project with:

```text
Root directory: frontend
Framework preset: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
```

Add this Vercel environment variable for Production and Preview:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

Redeploy after changing environment variables because Vite injects them at build time.

### Frontend on Netlify

Use:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Add:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

Update the backend `CLIENT_URL` with the exact deployed frontend origin, without a trailing slash.

Multiple allowed origins can be comma-separated:

```env
CLIENT_URL=https://your-app.vercel.app,https://your-app.netlify.app,http://localhost:5173
```

## MongoDB Atlas Configuration

For local development:

1. Open MongoDB Atlas.
2. Go to **Security → Network Access**.
3. Add your current IP address.

For Render:

- Allow Render's outbound traffic according to your Atlas security policy.
- For a simple hobby deployment, `0.0.0.0/0` can be used temporarily, but a more restrictive network policy is recommended for production.
- Confirm the database user has the required database permissions.

## Cloudinary Configuration

The backend uses `CLOUDINARY_URL` for media uploads.

Supported uploads:

- JPG
- JPEG
- PNG
- GIF
- WEBP
- MP4
- WEBM
- MOV

Maximum upload size is 25 MB. Videos must be 60 seconds or shorter.

## Troubleshooting

### CORS origin is not allowed

Set Render's `CLIENT_URL` to the exact frontend origin:

```env
CLIENT_URL=https://your-app.vercel.app
```

Do not include `/` at the end. Redeploy Render after saving the variable.

### Login or signup returns 404

Verify the frontend uses the deployed backend API URL:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

Then redeploy Vercel or Netlify. `.env.example` is only a template and does not configure the deployed app.

### Login returns 401

The account may not exist in the production MongoDB database. Create the account through the deployed signup page, then log in.

### Frontend still calls localhost

The production build was created without `VITE_API_URL`. Add the variable in the hosting provider and redeploy with a fresh build.

### MongoDB connection failed

Check:

- `MONGO_URI` is set in Render.
- The MongoDB username and password are correct.
- MongoDB Atlas Network Access allows the deployed backend.
- The database user has access to the target database.

### Media upload fails

Check:

- `CLOUDINARY_URL` is set in Render.
- The file is under 25 MB.
- Videos are 60 seconds or shorter.
- The Cloudinary credentials are valid.

## Security Notes

- Never commit `.env` files.
- Never put MongoDB, Cloudinary, or JWT secrets in frontend variables.
- Frontend variables beginning with `VITE_` are public by design.
- Rotate credentials if they are exposed in logs, screenshots, commits, or chat.
- Use a strong, unique `JWT_SECRET` in production.
- Restrict MongoDB network access when possible.

## License

This project is currently private and does not declare a public license.
