# Postro E-commerce Website - Setup Guide

## 🎨 What You've Built

A Gen-Z street style e-commerce website for Postro posters and stickers with:
- Real-time stock tracking across all users
- Category-based navigation (Anime, Movies, Cars, Bikes, Stickers)
- Advanced search and filtering
- Admin panel for product uploads and sales analytics
- Bold, vibrant design with NO gradients (street style aesthetic)

## 🚀 Getting Started

### 1. Firebase Setup

You need to create a Firebase project and add your credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "Postro" (or any name)
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in production mode
   - Choose your region
4. Enable **Firebase Storage**:
   - Go to Storage
   - Click "Get Started"
   - Use default security rules for now
5. Get your Firebase config:
   - Project Settings > General
   - Scroll to "Your apps" section
   - Click "Web" icon
   - Copy the config object

### 2. Add Firebase Credentials

Create a `.env` file (or copy `.env.example`) and paste the config values you copied above:

```bash
cp .env.example .env
# then edit .env with your Firebase values
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_EMAILJS_API_URL=https://api.emailjs.com/api/v1.0/email/send
VITE_EMAILJS_SERVICE_ID=your-emailjs-service
VITE_EMAILJS_TEMPLATE_ID=your-emailjs-template
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
VITE_EMAILJS_ACCESS_TOKEN=optional-if-template-uses-access-token
```

These environment variables are consumed via `import.meta.env` so they stay out of the bundled source.

### 3. Configure Invoice Emails (EmailJS)

Invoice receipts are sent through [EmailJS](https://www.emailjs.com/) so no custom backend is required. Create a service + template, then set the env variables above:

1. **service id** → `VITE_EMAILJS_SERVICE_ID`
2. **template id** → `VITE_EMAILJS_TEMPLATE_ID`
3. **public key** → `VITE_EMAILJS_PUBLIC_KEY`
4. **access token** (only if your template enforces one) → `VITE_EMAILJS_ACCESS_TOKEN`

Include template variables like `to_email`, `order_number`, `items`, etc. so the receipt renders correctly. Without these keys the checkout UI will still work, but customers won’t receive emails.

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### 5. Admin Access

- Navigate to `/admin`
- Default password: **postro2025** (update `ADMIN_PASSWORD` in `src/pages/AdminPage.tsx` before shipping)

## 📱 Features

### User Features
- Browse all products in a responsive grid
- Filter by category and subcategory
- Search by name or tags
- Real-time stock updates (see changes instantly across all devices)
- Select products to mark as sold (decreases stock)

### Admin Features
- **Upload Products**: Add new posters/stickers with images
- **Sales Logbook**: View all sales with timestamps and stock changes
- **Analytics**: See top-selling products and inventory status

## 🎯 Next Steps

1. **Add Firebase credentials** (required to run the app)
2. **Upload some products** via admin panel
3. **Test the real-time updates** by opening in two browser windows
4. **Deploy to production** (Vercel/Netlify) and point postro.in domain

## 🔒 Security Notes

- Change the admin password in `src/pages/AdminPage.tsx`
- Set up Firebase Security Rules for production
- Add environment variables for sensitive data

## 🎨 Design Philosophy

This website follows Gen-Z street style aesthetics:
- **Bold, vibrant colors** (neon pink, green, yellow)
- **Sharp edges** - NO rounded corners
- **NO gradients** - solid colors only
- **Urban typography** - Bebas Neue, Archivo Black
- **High contrast** black and white base
- **Street art inspired** elements

## 📦 Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for product images)
- **Routing**: React Router
- **Styling**: Vanilla CSS (custom street style design system)

## 🤝 Support

Admin password: `postro2025`

For Firebase setup help, see: https://firebase.google.com/docs/web/setup
