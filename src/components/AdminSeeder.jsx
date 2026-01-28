import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

const initialCategories = [
    { id: 'baby-clothes', name: 'Baby Clothes', description: 'Cute and comfortable clothes for infants', icon: '👶' },
    { id: 'walkers', name: 'Walkers', description: 'Helper for your baby\'s first steps', icon: '🏃' },
    { id: 'toys', name: 'Toys', description: 'Fun and educational toys', icon: '🧸' },
    { id: 'nightwear', name: 'Nightwear', description: 'Cozy pajamas for a good night sleep', icon: '🌙' }
];

const initialProducts = [
    {
        name: 'Classic Walker',
        category: 'walkers',
        price: 450,
        description: 'Sturdy walker with music and lights',
        image: 'https://placehold.co/400x400/png?text=Walker',
        icon: '🏃'
    },
    {
        name: 'Soft Cotton Romper',
        category: 'baby-clothes',
        price: 120,
        description: '100% cotton romper, gentle on skin',
        image: 'https://placehold.co/400x400/png?text=Romper',
        icon: '👕'
    },
    {
        name: 'Plush Teddy Bear',
        category: 'toys',
        price: 85,
        description: 'Soft cuddly teddy bear',
        image: 'https://placehold.co/400x400/png?text=Teddy',
        icon: '🧸'
    }
];

const AdminSeeder = () => {
    const [status, setStatus] = useState('');

    const seedData = async () => {
        setStatus('Seeding data...');
        try {
            const batch = writeBatch(db);

            // Seed Categories
            for (const cat of initialCategories) {
                const docRef = doc(db, 'categories', cat.id); // Use ID as doc ID
                batch.set(docRef, cat);
            }

            // Seed Products (using auto-ID)
            const productsRef = collection(db, 'products');
            for (const prod of initialProducts) {
                const newDoc = doc(productsRef);
                batch.set(newDoc, prod);
            }

            await batch.commit();
            setStatus('Success! Data seeded to Firestore.');
        } catch (error) {
            console.error(error);
            setStatus('Error seeding data: ' + error.message);
        }
    };

    return (
        <div style={{ padding: 20, border: '1px solid #ccc', margin: 20 }}>
            <h3>Admin Data Seeder</h3>
            <p>Click below to populate Firebase with initial data.</p>
            <button onClick={seedData}>Seed Initial Data</button>
            <p>{status}</p>
        </div>
    );
};

export default AdminSeeder;
