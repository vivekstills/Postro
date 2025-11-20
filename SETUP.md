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

Update `src/firebase/config.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Run the Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### 4. Admin Access

- Navigate to `/admin` route
- Default password: **postro2025**
- ⚠️ Change this password in production!

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
