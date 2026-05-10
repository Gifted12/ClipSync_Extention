# ClipSync 📋

> ClipSync is a full-stack productivity application built to eliminate the friction of transferring content between devices. Whether you're copying a link on your phone, saving an image on a tablet, or drafting notes on the go — ClipSync ensures everything is waiting for you the moment you open your desktop browser.
The platform combines a responsive web application with a Chrome Extension, giving users a seamless bridge between mobile and desktop workflows. Content is organized by type, searchable, pinnable, and instantly copyable — all from a clean, distraction-free interface.

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
## Services You'll Need

| Service | Purpose | Free tier? |
|---|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Database | ✅ 512MB |
| [Cloudinary](https://cloudinary.com) | File storage | ✅ 25GB |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth | ✅ |
| Gmail / SMTP | Password reset emails | ✅ |

Reno © 2026 ClipSync
## by Josiah
