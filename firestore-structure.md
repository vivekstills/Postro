# Firestore Database Structure

## Collections

### products
Stores all poster and sticker products

```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Product name (e.g., "Naruto Uzumaki Poster")
  type: "poster" | "sticker";
  category: string;        // Main category (e.g., "Anime", "Movies", "Cars")
  subcategory?: string;    // Optional subcategory (e.g., "Naruto", "JJK")
  tags: string[];          // Array of searchable tags
  imageUrl: string;        // URL to product image in Firebase Storage
  stock: number;           // Current stock count
  createdAt: Timestamp;    // Creation timestamp
}
```

### categories
Predefined category structure

```typescript
{
  id: string;
  name: string;            // Category name (e.g., "Anime Posters")
  type: "poster" | "sticker";
  subcategories: string[]; // Array of subcategory names
}
```

### tags
Track all available tags and their usage

```typescript
{
  id: string;
  name: string;            // Tag name
  usageCount: number;      // How many products use this tag
  category: string;        // Associated category
}
```

### sales_log
Records every sale for analytics

```typescript
{
  id: string;
  productId: string;       // Reference to product
  productName: string;     // Product name at time of sale
  category: string;        // Product category
  tags: string[];          // Product tags
  timestamp: Timestamp;    // When the sale occurred
  stockBefore: number;     // Stock before sale
  stockAfter: number;      // Stock after sale
}
```

### admin_config
Admin authentication and settings

```typescript
{
  id: "config";
  passwordHash: string;    // Hashed admin password
  adminEmail?: string;     // Optional admin email
}
```

## Initial Setup

Default admin password: `postro2025` (should be changed on first login)

Initial categories:
- Anime Posters (subcategories: Naruto, Jujutsu Kaisen, One Punch Man, Death Note, etc.)
- Movie Posters (subcategories: Marvel, DC, Horror, Action, etc.)
- Car Posters
- Bike Posters
- Stickers (subcategories: Sarcastic, Anime, Quotes, etc.)
