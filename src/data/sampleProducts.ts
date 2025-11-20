// Sample Product Data - Use this to seed your Firestore database
// This is optional demo data to help you get started quickly

import { addProduct } from '../firebase/products';

export const sampleProducts = [
    // Anime Posters
    {
        name: 'Naruto Uzumaki Action',
        type: 'poster' as const,
        category: 'Anime Posters',
        subcategory: 'Naruto',
        tags: ['anime', 'naruto', 'ninja', 'action', 'orange'],
        // Replace with actual image URL after upload
        imageUrl: 'https://placehold.co/600x800/FF6B1A/FFFFFF?text=Naruto+Poster',
        stock: 15
    },
    {
        name: 'Gojo Satoru Jujutsu Kaisen',
        type: 'poster' as const,
        category: 'Anime Posters',
        subcategory: 'Jujutsu Kaisen',
        tags: ['anime', 'jjk', 'jujutsu kaisen', 'gojo', 'blue'],
        imageUrl: 'https://placehold.co/600x800/0066FF/FFFFFF?text=Gojo+Poster',
        stock: 12
    },
    {
        name: 'Saitama One Punch Man',
        type: 'poster' as const,
        category: 'Anime Posters',
        subcategory: 'One Punch Man',
        tags: ['anime', 'opm', 'saitama', 'hero'],
        imageUrl: 'https://placehold.co/600x800/FFD700/000000?text=Saitama+Poster',
        stock: 10
    },

    // Movie Posters
    {
        name: 'Spider-Man No Way Home',
        type: 'poster' as const,
        category: 'Movie Posters',
        subcategory: 'Marvel',
        tags: ['marvel', 'spiderman', 'superhero', 'action'],
        imageUrl: 'https://placehold.co/600x800/DC143C/FFFFFF?text=Spider-Man',
        stock: 20
    },
    {
        name: 'The Dark Knight',
        type: 'poster' as const,
        category: 'Movie Posters',
        subcategory: 'DC',
        tags: ['dc', 'batman', 'joker', 'dark'],
        imageUrl: 'https://placehold.co/600x800/000000/FFFFFF?text=Dark+Knight',
        stock: 8
    },

    // Car Posters
    {
        name: 'Nissan GTR R35',
        type: 'poster' as const,
        category: 'Car Posters',
        subcategory: 'JDM',
        tags: ['car', 'nissan', 'gtr', 'jdm', 'racing'],
        imageUrl: 'https://placehold.co/600x800/C0C0C0/000000?text=GTR+R35',
        stock: 18
    },
    {
        name: 'Lamborghini Aventador',
        type: 'poster' as const,
        category: 'Car Posters',
        subcategory: 'Supercars',
        tags: ['car', 'lamborghini', 'supercar', 'italian'],
        imageUrl: 'https://placehold.co/600x800/FFD700/000000?text=Aventador',
        stock: 14
    },

    // Stickers
    {
        name: 'Sarcastic Quote Pack',
        type: 'sticker' as const,
        category: 'Stickers',
        subcategory: 'Sarcastic',
        tags: ['sticker', 'funny', 'sarcastic', 'humor'],
        imageUrl: 'https://placehold.co/400x400/FF1493/FFFFFF?text=Sarcastic',
        stock: 50
    },
    {
        name: 'Naruto Symbols Sticker Set',
        type: 'sticker' as const,
        category: 'Stickers',
        subcategory: 'Anime',
        tags: ['sticker', 'anime', 'naruto', 'symbols'],
        imageUrl: 'https://placehold.co/400x400/FF6B1A/000000?text=Naruto+Set',
        stock: 30
    }
];

// Function to seed the database
export const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with sample products...');

        for (const product of sampleProducts) {
            await addProduct(product);
            console.log(`✅ Added: ${product.name}`);
        }

        console.log('🎉 Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
};

// Uncomment to run seeding (only run once!)
// seedDatabase();
