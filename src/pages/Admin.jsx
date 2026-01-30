import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getMainCategories, getSubcategories, normalizeCategoryId } from '../utils/categoryUtils';

const Admin = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Product Form State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        image: '', // Base64 string
        inStock: true
    });
    
    // Category Form State
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        icon: ''
    });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Real-time listener for products
        const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            setProducts(snapshot.docs.map(d => ({ ...d.data(), _id: d.id })));
        });

        // Real-time listener for categories
        const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const categoriesData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            setCategories(categoriesData);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:38',message:'Categories loaded in admin',data:{totalCategories:categoriesData.length,categories:categoriesData.map(c=>({id:c.id,name:c.name}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        });

        return () => {
            unsubscribeAuth();
            unsubscribeProducts();
            unsubscribeCategories();
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError('');
        } catch (err) {
            setError('Failed to login: ' + err.message);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    // Helper to resize image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality
                setNewProduct(prev => ({ ...prev, image: dataUrl }));
                setIsLoading(false);
            };
        };
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!selectedMainCategory) {
            alert('Please select a main category');
            return;
        }
        if ((selectedMainCategory === 'babygear' || selectedMainCategory === 'clothing') && !selectedSubcategory) {
            alert('Please select a subcategory');
            return;
        }
        if (!newProduct.category) {
            alert('Category not properly set. Please try selecting the category again.');
            return;
        }
        if (!newProduct.image) {
            alert('Please select an image');
            return;
        }

        setIsLoading(true);
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:100',message:'Adding product',data:{productName:newProduct.name,category:newProduct.category,selectedMainCategory,selectedSubcategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            await addDoc(collection(db, 'products'), {
                ...newProduct,
                price: Number(newProduct.price),
                createdAt: new Date(),
                inStock: newProduct.inStock
            });
            setNewProduct({ name: '', price: '', category: '', description: '', image: '', inStock: true });
            setSelectedMainCategory('');
            setSelectedSubcategory('');

            // Reset file input
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';

            alert('Product added successfully!');
        } catch (err) {
            console.error(err);
            alert('Error adding product: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle main category selection
    const handleMainCategoryChange = (e) => {
        const mainCategoryId = e.target.value;
        setSelectedMainCategory(mainCategoryId);
        setSelectedSubcategory('');
        
        // For categories without subcategories, set the category directly
        if (mainCategoryId && mainCategoryId !== 'babygear' && mainCategoryId !== 'clothing') {
            // Find the Firebase category document ID that matches the normalized category
            const firebaseCategory = categories.find(cat => {
                const normalized = normalizeCategoryId(cat.id, cat.name);
                return normalized === mainCategoryId;
            });
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:120',message:'Main category selected',data:{mainCategoryId,firebaseCategoryId:firebaseCategory?.id,firebaseCategoryName:firebaseCategory?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            setNewProduct({ ...newProduct, category: firebaseCategory?.id || mainCategoryId });
        } else {
            setNewProduct({ ...newProduct, category: '' });
        }
    };

    // Handle subcategory selection
    const handleSubcategoryChange = (e) => {
        const subcategoryId = e.target.value;
        setSelectedSubcategory(subcategoryId);
        
        // Get the Firebase category ID for the subcategory
        const subcategories = getSubcategories(selectedMainCategory);
        const selectedSub = subcategories.find(sub => sub.id === subcategoryId);
        const firebaseCategoryId = selectedSub?.firebaseCategoryId || subcategoryId;
        
        // Find the actual Firebase category document ID
        const firebaseCategory = categories.find(cat => {
            const catName = cat.name?.toLowerCase() || '';
            const catId = cat.id?.toLowerCase().replace(/\s+/g, '') || '';
            const normalized = normalizeCategoryId(cat.id, cat.name);
            return normalized === firebaseCategoryId || 
                   catName.includes(firebaseCategoryId.toLowerCase()) || 
                   catId === firebaseCategoryId.toLowerCase().replace(/\s+/g, '');
        });
        
        setNewProduct({ ...newProduct, category: firebaseCategory?.id || firebaseCategoryId });
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:130',message:'Subcategory selected',data:{subcategoryId,firebaseCategoryId,selectedCategoryId:firebaseCategory?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
    };

    const [deletingId, setDeletingId] = useState(null);

    // ... (rest of code) ...

    const handleDeleteProduct = (id) => {
        setDeletingId(id);
        // Auto-reset after 3 seconds if not confirmed
        setTimeout(() => setDeletingId(null), 3000);
    };

    const confirmDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'products', id));
            setDeletingId(null);
            alert('Product deleted!');
        } catch (err) {
            console.error(err);
            alert('Error deleting product');
        }
    };

    const handleToggleStock = async (product) => {
        try {
            const currentStatus = product.inStock !== false;
            await updateDoc(doc(db, 'products', product._id), {
                inStock: !currentStatus
            });
        } catch (err) {
            console.error(err);
            alert('Error updating stock status: ' + err.message);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) {
            alert('Please enter a category name');
            return;
        }
        if (!newCategory.icon.trim()) {
            alert('Please enter an emoji icon');
            return;
        }

        setIsLoading(true);
        try {
            // Check if category already exists
            const exists = categories.some(c => 
                c.name.toLowerCase().trim() === newCategory.name.toLowerCase().trim()
            );
            
            if (exists) {
                alert('This category already exists!');
                setIsLoading(false);
                return;
            }

            await addDoc(collection(db, 'categories'), {
                name: newCategory.name.trim(),
                description: newCategory.description.trim() || '',
                icon: newCategory.icon.trim()
            });
            
            setNewCategory({ name: '', description: '', icon: '' });
            alert('Category added successfully!');
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:245',message:'Category added',data:{categoryName:newCategory.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        } catch (error) {
            console.error(error);
            alert('Error adding category: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategories = async () => {
        setIsLoading(true);
        try {
            // 1. Rename Night Wear -> Sleep Wear
            const nightWear = categories.find(c => c.name === 'Night Wear');
            if (nightWear) {
                await updateDoc(doc(db, 'categories', nightWear.id), { name: 'Sleep Wear' });
            }

            // 2. Add new categories
            const newCategories = [
                { name: 'High Chair', icon: '🪑' },
                { name: 'Onesies', icon: '👘' },
                { name: 'Potty Trainer', icon: '🚽' },
                { name: 'Food Products', icon: '🍼' }
            ];

            for (const cat of newCategories) {
                // Check if category already exists (simple case-insensitive check)
                const exists = categories.some(c => c.name.toLowerCase() === cat.name.toLowerCase());
                if (!exists) {
                    await addDoc(collection(db, 'categories'), cat);
                }
            }
            alert('Categories updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Error updating categories: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
                <h2>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ padding: 10 }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ padding: 10 }}
                    />
                    <button type="submit" style={{ padding: 10, background: '#000', color: '#fff' }}>Login</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleUpdateCategories} style={{ padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Update Categories
                    </button>
                    <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
                </div>
            </div>

            {/* Add Category Form */}
            <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8, marginBottom: 20, maxWidth: '600px' }}>
                <h3>➕ Add New Category</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 15 }}>
                    Create a new category for your products. The category will appear on the website automatically.
                </p>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        placeholder="Category Name (e.g., Feeding, Clothing, Toys)"
                        value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        required
                        style={{ padding: 8 }}
                    />
                    <input
                        placeholder="Icon (Emoji, e.g., 🍼 👕 🧸)"
                        value={newCategory.icon}
                        onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                        required
                        maxLength={2}
                        style={{ padding: 8 }}
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newCategory.description}
                        onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                        style={{ padding: 8, height: 60 }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: 10,
                            background: isLoading ? '#ccc' : '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        {isLoading ? 'Adding...' : 'Add Category'}
                    </button>
                </form>
            </div>

            <div className="admin-grid">
                {/* Add Product Form */}
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, height: 'fit-content' }}>
                    <h3>Add New Product</h3>
                    <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                            placeholder="Product Name"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                            style={{ padding: 8 }}
                        />
                        <input
                            type="number"
                            placeholder="Price (GH₵)"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                            required
                            style={{ padding: 8 }}
                        />
                        {/* Main Category Selection */}
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Main Category:</label>
                        <select
                            value={selectedMainCategory}
                            onChange={handleMainCategoryChange}
                            required
                            style={{ padding: 8 }}
                        >
                            <option value="">Select Main Category</option>
                            {getMainCategories(categories).map(c => (
                                <option key={c.id} value={c.normalizedId}>{c.displayName || c.name}</option>
                            ))}
                        </select>

                        {/* Subcategory Selection (only for Baby Gear and Clothing) */}
                        {(selectedMainCategory === 'babygear' || selectedMainCategory === 'clothing') && (
                            <>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Subcategory:</label>
                                <select
                                    value={selectedSubcategory}
                                    onChange={handleSubcategoryChange}
                                    required
                                    style={{ padding: 8 }}
                                >
                                    <option value="">Select Subcategory</option>
                                    {getSubcategories(selectedMainCategory).map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {/* Hidden input to store the actual Firebase category ID */}
                        <input type="hidden" value={newProduct.category} />

                        {/* Image Upload Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.9rem' }}>Product Image:</label>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                                style={{ padding: 8, background: 'white' }}
                            />
                            {newProduct.image && (
                                <img src={newProduct.image} alt="Preview" style={{ width: 100, marginTop: 5, borderRadius: 5 }} />
                            )}
                        </div>

                        <textarea
                            placeholder="Description"
                            value={newProduct.description}
                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            required
                            style={{ padding: 8, height: 100 }}
                        />

                        {/* Stock Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={newProduct.inStock}
                                onChange={e => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                                style={{ width: 20, height: 20 }}
                            />
                            Available / In Stock
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: 10,
                                background: isLoading ? '#ccc' : '#D4AF37',
                                color: '#fff',
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Processing...' : 'Add Product'}
                        </button>
                    </form>
                </div>

                {/* Product List */}
                <div>
                    <h3>Existing Products ({products.length})</h3>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {products.map(p => (
                            <div key={p._id} style={{ display: 'flex', gap: 10, border: '1px solid #ddd', padding: 10, alignItems: 'center' }}>
                                <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', opacity: p.inStock === false ? 0.5 : 1 }} />
                                <div style={{ flex: 1 }}>
                                    <strong>{p.name}</strong> - GH₵{p.price}
                                    {p.inStock === false && <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 10 }}>(Out of Stock)</span>}
                                </div>
                                <button
                                    onClick={() => handleToggleStock(p)}
                                    style={{
                                        marginRight: 10,
                                        padding: '5px 10px',
                                        background: p.inStock === false ? '#4CAF50' : '#FF9800',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {p.inStock === false ? 'Mark In Stock' : 'Mark Out of Stock'}
                                </button>
                                {deletingId === p._id ? (
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(p._id)}
                                        style={{ color: 'white', background: 'red', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                    >
                                        Confirm?
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(p._id)}
                                        style={{ color: 'red', border: '1px solid red', background: 'transparent', padding: '5px 10px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
