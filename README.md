# ClipSync 📋

> Your universal clipboard — sync text, images, and documents across every device, with a Chrome Extension for instant desktop access.

![ClipSync](https://img.shields.io/badge/Stack-React%20%2B%20Vite%20%2B%20Node%20%2B%20MongoDB-6366F1)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Paste text** from any device and read it on your desktop via the Chrome extension
- **Upload images and documents** (PDF, DOCX, TXT) — stored securely on Cloudinary
- **Chrome Extension** with context-menu "Save to ClipSync", paste-from-clipboard, and dark mode
- **Auth** — email/password + Google OAuth + forgot/reset password via email
- **Settings** — update profile name/avatar, toggle dark/light theme, change password
- **404 page** with animated glitch effect
- **Loading spinners** everywhere async work happens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, React Router v6, Framer Motion |
| Backend | Node.js, Express, MongoDB + Mongoose |
| Auth | JWT, bcryptjs, Google OAuth (google-auth-library) |
| Storage | Cloudinary (images & documents) |
| Email | Nodemailer (password reset) |
| Extension | Chrome Manifest V3, vanilla JS |

---

## Project Structure

```
clipsync/
├── backend/                    # Express API
│   ├── controllers/
│   │   ├── authController.js   # register, login, Google, forgot/reset password
│   │   ├── clipController.js   # CRUD clips
│   │   └── userController.js   # profile, avatar, password update
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   └── cloudinary.js       # multer + Cloudinary storage
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt, Google, avatar, theme)
│   │   └── Clip.js             # Clip schema (text/image/document, pin, tags)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clips.js
│   │   └── users.js
│   ├── server.js               # Express app + MongoDB connect
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.jsx        # Split-panel auth wrapper
│   │   │   │   └── AuthLayout.module.css
│   │   │   └── ui/
│   │   │       └── Spinner.jsx           # Spinner + fullscreen overlay
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Email/pw + Google login
│   │   │   ├── Register.jsx              # Email/pw + Google signup + pw strength
│   │   │   ├── ForgotPassword.jsx        # Request reset email
│   │   │   ├── ResetPassword.jsx         # Set new password via token
│   │   │   ├── Dashboard.jsx             # Clip grid, add modal, search, filter
│   │   │   ├── Dashboard.module.css
│   │   │   ├── Settings.jsx              # Profile, Appearance, Security tabs
│   │   │   ├── Settings.module.css
│   │   │   ├── NotFound.jsx              # Animated 404 page
│   │   │   └── NotFound.module.css
│   │   ├── store.js                      # Zustand (auth + theme, persisted)
│   │   ├── utils/
│   │   │   └── api.js                    # Axios instance with JWT interceptor
│   │   ├── App.jsx                       # Routes + PrivateRoute + PublicRoute
│   │   ├── main.jsx                      # ReactDOM + GoogleOAuthProvider
│   │   └── index.css                     # Global CSS variables + utilities
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── extension/                  # Chrome Extension (Manifest V3)
│   ├── manifest.json           # Permissions, icons, background, content scripts
│   ├── background.js           # Service worker — context menus, alarms, messaging
│   ├── content.js              # In-page toast notifications
│   ├── popup.html              # Extension popup shell
│   ├── popup.css               # Extension styles (light + dark theme)
│   ├── popup.js                # Full popup logic — auth, clips list, add, settings
│   └── icons/                  # Place icon16/32/48/128.png here
│
├── package.json                # Root — concurrently dev script
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/yourname/clipsync.git
cd clipsync
npm run install:all
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` → `backend/.env` and fill in:


```

**Frontend** — copy `frontend/.env.example` → `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### 3. Run in development

```bash
npm run dev

```

Or run individually:

```bash
npm run dev:backend
npm run dev:frontend
```

### 4. Load the Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

> Update `API_BASE` in `extension/popup.js` and `extension/background.js` to your production API URL before deploying.

---

## Services You'll Need

| Service | Purpose | Free tier? |
|---|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Database | ✅ 512MB |
| [Cloudinary](https://cloudinary.com) | File storage | ✅ 25GB |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth | ✅ |
| Gmail / SMTP | Password reset emails | ✅ |

---

## Deployment

### Backend (e.g. Railway / Render)
```bash
cd backend && npm start
```
Set all environment variables in your hosting platform's dashboard.

### Frontend (e.g. Vercel / Netlify)
```bash
cd frontend && npm run build
# Deploy the dist/ folder
```

### Extension


---

## License

Reno © 2026 ClipSync
## by Josiah