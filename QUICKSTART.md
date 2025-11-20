# 🚀 Quick Start - Get Postro Running in 5 Minutes

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use existing one
3. Name it "Postro" or anything you like
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Services

### Firestore Database
1. In Firebase console, click "Firestore Database" in sidebar
2. Click "Create database"
3. Start in **production mode**
4. Select your region (closest to you)
5. Click "Enable"

### Storage
1. Click "Storage" in sidebar
2. Click "Get started"
3. Click "Next" (default rules are fine for now)
4. Click "Done"

## Step 3: Get Your Config

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register app (name it "Postro Web")
6. Copy the `firebaseConfig` object

## Step 4: Add Config to Code

Open `src/firebase/config.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",          // Paste your values
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:5173 - You should see the Postro website! 🎉

## Step 6: Add Products

1. Go to http://localhost:5173/admin
2. Login with password: **postro2025**
3. Click "UPLOAD PRODUCT" tab
4. Upload an image, fill in details, click "ADD PRODUCT"

## That's It!

Your e-commerce site is now live locally. Test it:
- Open two browser windows side-by-side
- Select a product in one window
- Watch stock update in both instantly!

## Next: Deploy for postro.in

When ready to deploy:
```bash
npm run build
```

Upload the `dist/` folder to Vercel or Netlify, then point your postro.in domain to it.

---

**Need help?** Check [SETUP.md](./SETUP.md) for detailed instructions.
