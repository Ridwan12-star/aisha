import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { products } from './data/productsData';
import './styles/index.css';

function App() {
    const [selectedCategory, setSelectedCategory] = useState(null);

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

    return (
        <CartProvider>
            <div className="App">
                <Header onLogoClick={handleLogoClick} />
                <Hero />
                <Categories onCategoryClick={handleCategoryClick} />
                <ProductGrid products={products} selectedCategory={selectedCategory} />
                <Cart />
                <Footer onCategoryClick={handleCategoryClick} />
                <WhatsAppFloat />
            </div>
        </CartProvider>
    );
}

export default App;
