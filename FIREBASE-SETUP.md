# Firebase Configuration Guide for Postro

## ✅ You're Almost Done!

Your Firebase project is already created and configured! Here's what you need to do:

## 📋 Firestore Security Rules (REQUIRED)

Your Firestore database needs security rules to allow reading and writing. This is why products might not be uploading!

### How to Set Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **postro-b3503** project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. **Replace** the existing rules with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all products
    match /products/{productId} {
      allow read: true;
      allow create, update, delete: true; // For development - restrict in production
    }
    
    // Allow read/write to sales logs
    match /sales_log/{saleId} {
      allow read: true;
      allow write: true;
    }
    
    // Allow read to categories and tags
    match /categories/{categoryId} {
      allow read: true;
      allow write: true;
    }
    
    match /tags/{tagId} {
      allow read: true;
      allow write: true;
    }
    
    // Restrict admin config to read only
    match /admin_config/{document} {
      allow read: true;
      allow write: false;
    }
  }
}
```

6. Click **Publish**

## 🎯 Quick Test

After setting the rules:

1. Refresh your website: http://localhost:5173
2. Go to admin: http://localhost:5173/admin
3. Login with password: `postro2025`
4. Try uploading a product!

## 🖼️ Getting the Right Image URL from Imgur

**IMPORTANT**: You're using the wrong link! Here's how to get the correct one:

###  Imgur Upload Steps:

1. Go to https://imgur.com
2. Click "New post"
3. Upload your poster image
4. **Right-click the uploaded image**
5. Select **"Copy image address"** (NOT "Copy Link"!)
6. Paste in admin panel

**Example URLs:**
- ✅ **CORRECT**: `https://i.imgur.com/abc123.png` (starts with `i.imgur.com`)
- ❌ **WRONG**: `https://imgur.com/abc123` (missing the `i.` and file extension)

The website will show a preview if the URL is correct!

## 🔒 Production Security (Before Going Live)

When deploying to postro.in for your festival, update these rules for security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - public read, no public write
    match /products/{productId} {
      allow read: true;
      allow update: if request.resource.data.stock == resource.data.stock - 1; // Only allow stock decrease by 1
      allow create, delete: false;
    }
    
    // Sales log - allow write only for new documents
    match /sales_log/{saleId} {
      allow read: true;
      allow create: true;
      allow update, delete: false;
    }
    
    // Categories & tags - read only
    match /{document=**} {
      allow read: true;
      allow write: false;
    }
  }
}
```

## ❌ Common Errors & Solutions

### Error: "Permission denied"
- **Fix**: Set the Firestore rules above

### Error: "Image preview not showing"
- **Fix**: Use "Copy image address", not "Copy Link" from Imgur
- **Check**: URL should start with `https://i.imgur.com/`

### Error: "Failed to upload product"
- **Fix**: Check browser console (F12) for detailed error
- **Verify**: Firebase credentials are correct in `src/firebase/config.ts`

## 🎉 You're Ready!

Once you set the Firestore rules, everything should work perfectly!

Test by:
1. Uploading a product via admin panel
2. Opening homepage - you should see your product!
3. Clicking "SELECT" - stock should decrease!
