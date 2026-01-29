import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
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
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
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
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:58',message:'Data fetched',data:{productsCount:productsData.length,categoriesCount:categoriesData.length,categories:categoriesData.map(c=>({id:c.id,name:c.name})),sampleProductCategories:productsData.slice(0,3).map(p=>({name:p.name,category:p.category}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:71',message:'handleCategoryClick entry',data:{categoryId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (categoryId === null) {
            // Back to categories
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:75',message:'Back to categories branch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            return;
        }

        // Normalize category IDs for subcategory handling
        const normalizedId = categoryId.toLowerCase().replace(/\s+/g, '');
        
        // Map old category names to new normalized IDs
        const categoryMapping = {
            'walker': 'babygear',
            'walkers': 'babygear',
            'babyclothes': 'clothing',
            'baby clothes': 'clothing',
            'nightwear': 'sleepwear',
            'night wear': 'sleepwear',
            'foodproduct': 'feeding',
            'food product': 'feeding',
            'food products': 'feeding'
        };
        
        const finalNormalizedId = categoryMapping[normalizedId] || categoryMapping[categoryId.toLowerCase()] || normalizedId;
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:85',message:'After normalization',data:{categoryId,normalizedId,finalNormalizedId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Check if category has subcategories
        if (finalNormalizedId === 'babygear' || finalNormalizedId === 'clothing') {
            setSelectedCategory(finalNormalizedId);
            setSelectedSubcategory(null);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:99',message:'Subcategory category selected',data:{finalNormalizedId,originalCategoryId:categoryId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
        } else {
            setSelectedCategory(finalNormalizedId);
            setSelectedSubcategory(null);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:103',message:'Regular category selected',data:{finalNormalizedId,originalCategoryId:categoryId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
        }

        // Scroll to products section
        setTimeout(() => {
            const element = document.querySelector('#products');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSubcategoryClick = (subcategoryId) => {
        setSelectedSubcategory(subcategoryId);
        setTimeout(() => {
            const element = document.querySelector('#products');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleProductClick = (product) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:110',message:'handleProductClick entry',data:{productId:product?._id,productName:product?.name,hasVariants:!!product?.variants},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setSelectedProduct(product);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
    };

    const handleLogoClick = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header onLogoClick={handleLogoClick} />
            <Hero />
            <Categories 
                categories={categories} 
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
                onSubcategoryClick={handleSubcategoryClick}
                selectedSubcategory={selectedSubcategory}
            />
            <ProductGrid 
                products={products} 
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onProductClick={handleProductClick}
            />
            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={closeProductModal} />
            )}
            <Cart />
            <Footer onCategoryClick={handleCategoryClick} />
            <WhatsAppFloat />
        </>
    );
}

export default App;
