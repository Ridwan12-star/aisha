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
        image: '', // Base64 string (main image, first image from array)
        images: [], // Array of Base64 strings for multiple images
        inStock: true,
        subcategory: '' // Store subcategory (boy/girl) for clothing
    });
    
    // Category Form State
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        icon: '',
        parentCategory: '' // For subcategories
    });
    
    // Subcategory Form State
    const [newSubcategory, setNewSubcategory] = useState({
        name: '',
        description: '',
        icon: '',
        parentCategory: '' // Parent category ID
    });
    
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showProductsList, setShowProductsList] = useState(false);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);

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
    const processImage = (file, callback) => {
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
                callback(dataUrl);
            };
        };
    };

    // Handle multiple image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsLoading(true);
        const processedImages = [];
        let processedCount = 0;

        files.forEach((file, index) => {
            processImage(file, (dataUrl) => {
                processedImages[index] = dataUrl;
                processedCount++;
                
                if (processedCount === files.length) {
                    // All images processed
                    setNewProduct(prev => ({
                        ...prev,
                        images: processedImages,
                        image: processedImages[0] || prev.image // First image as main image
                    }));
                    setIsLoading(false);
                }
            });
        });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!selectedMainCategory) {
            alert('Please select a main category');
            return;
        }
        
        // Check if the selected category has subcategories
        const mainCategory = categories.find(cat => {
            const normalized = normalizeCategoryId(cat.id, cat.name);
            return normalized === selectedMainCategory && !cat.parentCategory;
        });
        const hasSubcategories = mainCategory && categories.some(cat => cat.parentCategory === mainCategory.id);
        
        if (hasSubcategories && !selectedSubcategory) {
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
            fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:123',message:'Adding product - BEFORE save',data:{productName:newProduct.name,productCategory:newProduct.category,productSubcategory:newProduct.subcategory,selectedMainCategory,selectedSubcategory,productDescription:newProduct.description},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // Create variants from multiple images if available
            let variants = [];
            if (newProduct.images && newProduct.images.length > 1) {
                variants = newProduct.images.map((img, index) => ({
                    name: `Image ${index + 1}`,
                    image: img
                }));
            }

            const productToSave = {
                name: newProduct.name,
                price: Number(newProduct.price),
                category: newProduct.category,
                description: newProduct.description,
                image: newProduct.image || (newProduct.images && newProduct.images[0]) || '',
                inStock: newProduct.inStock,
                subcategory: newProduct.subcategory || '',
                createdAt: new Date(),
                ...(variants.length > 0 && { variants })
            };
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:145',message:'Adding product - productToSave object',data:{productName:productToSave.name,productCategory:productToSave.category,productSubcategory:productToSave.subcategory,hasVariants:variants.length>0,variantsCount:variants.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            await addDoc(collection(db, 'products'), productToSave);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:138',message:'Product saved successfully',data:{productName:newProduct.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            setNewProduct({ name: '', price: '', category: '', description: '', image: '', images: [], inStock: true, subcategory: '' });
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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:152',message:'Main category changed',data:{mainCategoryId,previousCategory:newProduct.category,previousSubcategory:newProduct.subcategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (!mainCategoryId) {
            setNewProduct({ ...newProduct, category: '', subcategory: '' });
            return;
        }
        
        // Find the Firebase category document ID that matches the normalized category
        const firebaseCategory = categories.find(cat => {
            const normalized = normalizeCategoryId(cat.id, cat.name);
            return normalized === mainCategoryId && !cat.parentCategory;
        });
        
        // Check if this category has subcategories
        const hasSubcategories = firebaseCategory && categories.some(cat => cat.parentCategory === firebaseCategory.id);
        
        // For categories without subcategories, set the category directly
        if (!hasSubcategories && firebaseCategory) {
            setNewProduct({ ...newProduct, category: firebaseCategory.id, subcategory: '' });
        } else {
            // Category has subcategories, wait for subcategory selection
            setNewProduct({ ...newProduct, category: '', subcategory: '' });
        }
    };

    // Handle subcategory selection
    const handleSubcategoryChange = (e) => {
        const subcategoryId = e.target.value;
        setSelectedSubcategory(subcategoryId);
        
        // Find the subcategory document in Firebase
        const subcategoryDoc = categories.find(cat => cat.id === subcategoryId);
        
        if (subcategoryDoc) {
            // This is a Firebase subcategory - use its ID as the product category
            // For boy/girl subcategories, also store in subcategory field
            const subcategoryName = subcategoryDoc.name?.toLowerCase() || '';
            const subcategoryToStore = (subcategoryName === 'boy' || subcategoryName === 'girl') ? subcategoryName : '';
            
            setNewProduct({ ...newProduct, category: subcategoryDoc.id, subcategory: subcategoryToStore });
        } else {
            // Fallback for old hardcoded subcategories
            const subcategories = getSubcategories(selectedMainCategory, categories);
            const selectedSub = subcategories.find(sub => sub.id === subcategoryId);
            const firebaseCategoryId = selectedSub?.firebaseCategoryId || subcategoryId;
            
            // Find the actual Firebase category document ID
            const firebaseCategory = categories.find(cat => {
                const catName = cat.name?.toLowerCase() || '';
                const catId = cat.id?.toLowerCase().replace(/\s+/g, '') || '';
                const normalized = normalizeCategoryId(cat.id, cat.name);
                const targetId = firebaseCategoryId.toLowerCase().replace(/\s+/g, '');
                return normalized === firebaseCategoryId || 
                       normalized === targetId ||
                       catName.includes(firebaseCategoryId.toLowerCase()) || 
                       catName.includes(targetId) ||
                       catId === targetId ||
                       catId.includes(targetId);
            });
            
            // For clothing and sleepwear subcategories (boy/girl), store the subcategory separately
            const subcategoryToStore = ((selectedMainCategory === 'clothing' || selectedMainCategory === 'sleepwear') && (subcategoryId === 'boy' || subcategoryId === 'girl')) ? subcategoryId : '';
            // Use the found category ID, or try to find a category that matches the main category, or use the firebaseCategoryId as fallback
            const finalCategoryId = firebaseCategory?.id || 
                                    (selectedMainCategory === 'clothing' ? categories.find(c => {
                                        const norm = normalizeCategoryId(c.id, c.name);
                                        return norm === 'clothing';
                                    })?.id : null) ||
                                    firebaseCategoryId;
            
            setNewProduct({ ...newProduct, category: finalCategoryId, subcategory: subcategoryToStore });
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:186',message:'Subcategory selected',data:{subcategoryId,selectedMainCategory,productCategory:newProduct.category,productSubcategory:newProduct.subcategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
            // Check if category already exists (case-insensitive)
            const exists = categories.some(c => 
                c.name.toLowerCase().trim() === newCategory.name.toLowerCase().trim() &&
                (!c.parentCategory || c.parentCategory === newCategory.parentCategory)
            );
            
            if (exists) {
                alert('This category already exists!');
                setIsLoading(false);
                return;
            }

            const categoryData = {
                name: newCategory.name.trim(),
                description: newCategory.description.trim() || '',
                icon: newCategory.icon.trim()
            };
            
            // Only add parentCategory if it's a subcategory
            if (newCategory.parentCategory) {
                categoryData.parentCategory = newCategory.parentCategory;
            }

            await addDoc(collection(db, 'categories'), categoryData);
            
            setNewCategory({ name: '', description: '', icon: '', parentCategory: '' });
            setShowSubcategoryForm(false);
            alert(newCategory.parentCategory ? 'Subcategory added successfully!' : 'Category added successfully!');
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Admin.jsx:245',message:'Category added',data:{categoryName:newCategory.name,isSubcategory:!!newCategory.parentCategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
        } catch (error) {
            console.error(error);
            alert('Error adding category: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        if (!newSubcategory.name.trim()) {
            alert('Please enter a subcategory name');
            return;
        }
        if (!newSubcategory.icon.trim()) {
            alert('Please enter an emoji icon');
            return;
        }
        if (!newSubcategory.parentCategory) {
            alert('Please select a parent category');
            return;
        }

        setIsLoading(true);
        try {
            // Check if subcategory already exists under this parent
            const exists = categories.some(c => 
                c.name.toLowerCase().trim() === newSubcategory.name.toLowerCase().trim() &&
                c.parentCategory === newSubcategory.parentCategory
            );
            
            if (exists) {
                alert('This subcategory already exists under the selected parent category!');
                setIsLoading(false);
                return;
            }

            await addDoc(collection(db, 'categories'), {
                name: newSubcategory.name.trim(),
                description: newSubcategory.description.trim() || '',
                icon: newSubcategory.icon.trim(),
                parentCategory: newSubcategory.parentCategory
            });
            
            setNewSubcategory({ name: '', description: '', icon: '', parentCategory: '' });
            alert('Subcategory added successfully!');
        } catch (error) {
            console.error(error);
            alert('Error adding subcategory: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Get main categories (categories without parentCategory)
    const getMainCategoriesList = () => {
        return categories.filter(cat => !cat.parentCategory);
    };
    
    // Get subcategories for a parent category
    const getSubcategoriesForParent = (parentId) => {
        return categories.filter(cat => cat.parentCategory === parentId);
    };
    
    // Handle delete category
    const handleDeleteCategory = (categoryId) => {
        setDeletingCategoryId(categoryId);
        // Auto-reset after 3 seconds if not confirmed
        setTimeout(() => setDeletingCategoryId(null), 3000);
    };
    
    const confirmDeleteCategory = async (categoryId) => {
        try {
            // Check if category has subcategories
            const hasSubcategories = categories.some(cat => cat.parentCategory === categoryId);
            if (hasSubcategories) {
                const confirmDelete = window.confirm(
                    'This category has subcategories. Deleting it will also delete all its subcategories. Continue?'
                );
                if (!confirmDelete) {
                    setDeletingCategoryId(null);
                    return;
                }
                
                // Delete all subcategories first
                const subcategories = categories.filter(cat => cat.parentCategory === categoryId);
                for (const subcat of subcategories) {
                    await deleteDoc(doc(db, 'categories', subcat.id));
                }
            }
            
            // Delete the category
            await deleteDoc(doc(db, 'categories', categoryId));
            setDeletingCategoryId(null);
            alert('Category deleted successfully!');
        } catch (err) {
            console.error(err);
            alert('Error deleting category: ' + err.message);
            setDeletingCategoryId(null);
        }
    };
    
    // Handle delete subcategory
    const handleDeleteSubcategory = async (subcategoryId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this subcategory?');
        if (!confirmDelete) return;
        
        try {
            await deleteDoc(doc(db, 'categories', subcategoryId));
            alert('Subcategory deleted successfully!');
        } catch (err) {
            console.error(err);
            alert('Error deleting subcategory: ' + err.message);
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

            {/* Category Management Section */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: 20, 
                marginBottom: 30 
            }}>
                {/* Add Main Category Form */}
                <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ marginTop: 0 }}>➕ Add New Category</h3>
                        <button
                            onClick={() => setShowCategoryForm(!showCategoryForm)}
                            style={{
                                padding: '5px 10px',
                                background: showCategoryForm ? '#f44336' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                            }}
                        >
                            {showCategoryForm ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 15 }}>
                        Create a new main category for your products. Categories will appear on the website automatically.
                    </p>
                    {showCategoryForm && (
                    <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                            placeholder="Category Name (e.g., Feeding, Clothing, Toys)"
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value, parentCategory: '' })}
                            required
                            style={{ padding: 8, borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                            placeholder="Icon (Emoji, e.g., 🍼 👕 🧸)"
                            value={newCategory.icon}
                            onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                            required
                            maxLength={2}
                            style={{ padding: 8, borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newCategory.description}
                            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                            style={{ padding: 8, height: 60, borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
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
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isLoading ? 'Adding...' : 'Add Category'}
                        </button>
                    </form>
                    )}
                </div>

                {/* Add Subcategory Form */}
                <div style={{ background: '#e3f2fd', padding: 20, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ marginTop: 0 }}>🔗 Add Subcategory</h3>
                        <button
                            onClick={() => setShowSubcategoryForm(!showSubcategoryForm)}
                            style={{
                                padding: '5px 10px',
                                background: showSubcategoryForm ? '#f44336' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                            }}
                        >
                            {showSubcategoryForm ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 15 }}>
                        Add a subcategory to an existing category. Subcategories will appear when users click on the parent category.
                    </p>
                    {showSubcategoryForm && (
                        <form onSubmit={handleAddSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Parent Category:</label>
                            <select
                                value={newSubcategory.parentCategory}
                                onChange={e => setNewSubcategory({ ...newSubcategory, parentCategory: e.target.value })}
                                required
                                style={{ padding: 8, borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Parent Category</option>
                                {getMainCategoriesList().map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                placeholder="Subcategory Name (e.g., Boys, Girls, High Chair)"
                                value={newSubcategory.name}
                                onChange={e => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                                required
                                style={{ padding: 8, borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            <input
                                placeholder="Icon (Emoji, e.g., 👦 👧 🪑)"
                                value={newSubcategory.icon}
                                onChange={e => setNewSubcategory({ ...newSubcategory, icon: e.target.value })}
                                required
                                maxLength={2}
                                style={{ padding: 8, borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={newSubcategory.description}
                                onChange={e => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
                                style={{ padding: 8, height: 60, borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    padding: 10,
                                    background: isLoading ? '#ccc' : '#2196F3',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isLoading ? 'Adding...' : 'Add Subcategory'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Categories List */}
            <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 30 }}>
                <h3 style={{ marginTop: 0 }}>📋 All Categories & Subcategories</h3>
                <div style={{ display: 'grid', gap: 15 }}>
                    {getMainCategoriesList().map(mainCat => {
                        const subcategories = getSubcategoriesForParent(mainCat.id);
                        return (
                            <div key={mainCat.id} style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: 15,
                                background: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: subcategories.length > 0 ? 10 : 0 }}>
                                    <span style={{ fontSize: '1.5rem' }}>{mainCat.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ fontSize: '1.1rem' }}>{mainCat.name}</strong>
                                        {mainCat.description && (
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                                                {mainCat.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => {
                                                setShowSubcategoryForm(true);
                                                setNewSubcategory({ ...newSubcategory, parentCategory: mainCat.id });
                                            }}
                                            style={{
                                                padding: '5px 15px',
                                                background: '#2196F3',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            + Add Subcategory
                                        </button>
                                        {deletingCategoryId === mainCat.id ? (
                                            <button
                                                onClick={() => confirmDeleteCategory(mainCat.id)}
                                                style={{
                                                    padding: '5px 15px',
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Confirm Delete?
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteCategory(mainCat.id)}
                                                style={{
                                                    padding: '5px 15px',
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {subcategories.length > 0 && (
                                    <div style={{ 
                                        marginLeft: 30, 
                                        marginTop: 10,
                                        paddingLeft: 15,
                                        borderLeft: '3px solid #2196F3'
                                    }}>
                                        <strong style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: 8 }}>
                                            Subcategories:
                                        </strong>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                            {subcategories.map(subCat => (
                                                <div key={subCat.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '8px 12px',
                                                    background: '#e3f2fd',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <span>{subCat.icon}</span>
                                                    <span>{subCat.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteSubcategory(subCat.id)}
                                                        style={{
                                                            marginLeft: '8px',
                                                            padding: '2px 8px',
                                                            background: '#f44336',
                                                            color: 'white',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                        title="Delete subcategory"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {getMainCategoriesList().length === 0 && (
                        <p style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                            No categories yet. Create your first category above!
                        </p>
                    )}
                </div>
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

                        {/* Subcategory Selection (dynamic based on categories with subcategories) */}
                        {(() => {
                            const mainCategory = categories.find(cat => {
                                const normalized = normalizeCategoryId(cat.id, cat.name);
                                return normalized === selectedMainCategory && !cat.parentCategory;
                            });
                            const hasSubcategories = mainCategory && categories.some(cat => cat.parentCategory === mainCategory.id);
                            
                            if (hasSubcategories) {
                                const subcategories = categories.filter(cat => cat.parentCategory === mainCategory.id);
                                return (
                                    <>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Subcategory:</label>
                                        <select
                                            value={selectedSubcategory}
                                            onChange={handleSubcategoryChange}
                                            required
                                            style={{ padding: 8 }}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {subcategories.map(sub => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.icon} {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                );
                            }
                            return null;
                        })()}

                        {/* Hidden input to store the actual Firebase category ID */}
                        <input type="hidden" value={newProduct.category} />

                        {/* Image Upload Input - Multiple Images Support */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.9rem' }}>Product Images (Select multiple from camera/gallery):</label>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                required
                                style={{ padding: 8, background: 'white' }}
                            />
                            <small style={{ fontSize: '0.8rem', color: '#666' }}>
                                You can select multiple images. The first image will be used as the main product image.
                            </small>
                            {newProduct.images && newProduct.images.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                                    {newProduct.images.map((img, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img 
                                                src={img} 
                                                alt={`Preview ${index + 1}`} 
                                                style={{ 
                                                    width: 100, 
                                                    height: 100, 
                                                    objectFit: 'cover',
                                                    borderRadius: 5,
                                                    border: index === 0 ? '3px solid #D4AF37' : '1px solid #ddd'
                                                }} 
                                            />
                                            {index === 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    left: 5,
                                                    background: '#D4AF37',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: 3,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h3 style={{ margin: 0 }}>Existing Products ({products.length})</h3>
                        <button
                            onClick={() => setShowProductsList(!showProductsList)}
                            style={{
                                padding: '5px 15px',
                                background: showProductsList ? '#f44336' : '#D4AF37',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                            }}
                        >
                            {showProductsList ? 'Hide Products' : 'Show Products'}
                        </button>
                    </div>
                    {showProductsList && (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
