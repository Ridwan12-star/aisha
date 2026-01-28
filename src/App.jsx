import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import './styles/index.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </div>
            </Router>
        </CartProvider>
    );
}

function Home() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                const categoriesData = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Fetch Products
                const productsSnapshot = await getDocs(collection(db, 'products'));
                const productsData = productsSnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));

                console.log('Firebase Products:', productsData);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data from Firebase:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);

        // Scroll to products section
        setTimeout(() => {
            const element = document.querySelector('#products');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleLogoClick = () => {
        setSelectedCategory(null);
    };

    if (loading) {
        return <div className="loading">Loading Aisha's Shop...</div>;
    }

    return (
        <>
            <Header onLogoClick={handleLogoClick} />
            <Hero />
            <Categories categories={categories} onCategoryClick={handleCategoryClick} />
            <ProductGrid products={products} selectedCategory={selectedCategory} />
            <Cart />
            <Footer onCategoryClick={handleCategoryClick} />
            <WhatsAppFloat />
        </>
    );
}

export default App;
