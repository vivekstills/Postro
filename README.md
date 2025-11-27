# Postro - Gen-Z Street Style E-commerce

A bold, vibrant e-commerce website for posters and stickers with real-time stock tracking.

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

## ⚠️ Before Running

1. Copy the env template and fill in your Firebase config **and** EmailJS keys (needed for invoice emails):

```bash
cp .env.example .env
# edit .env with your Firebase + EmailJS values
```

2. The runtime reads from `import.meta.env`, so **never** commit your `.env`. (The keys live outside the repo now.)

> ℹ️ **Invoice Emails:** Create an EmailJS service/template and set `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, plus `VITE_EMAILJS_ACCESS_TOKEN` (required if your template uses an access token). Without these, checkout emails will stay disabled.

See `SETUP.md` for detailed instructions.

## Features

- 🎨 Gen-Z street style design (bold colors, sharp edges, NO gradients)
- 📦 Real-time stock tracking across all users
- 🔍 Advanced search and category filtering
- 👨‍💼 Admin panel for product uploads and analytics
- 📊 Sales logbook with demand visualization

## Admin Access

- URL: `/admin`
- Default password: `postro2025` (update in `src/pages/AdminPage.tsx` before production)

## Tech Stack

- Vite + React + TypeScript
- Firebase (Firestore + Storage)
- React Router
- Vanilla CSS

---

Built with ❤️ for Postro
