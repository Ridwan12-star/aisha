import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';

const Admin = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Product Form State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        image: '', // Base64 string
        inStock: true
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
            setCategories(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
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
        if (!newProduct.category) {
            alert('Please select a category');
            return;
        }
        if (!newProduct.image) {
            alert('Please select an image');
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'products'), {
                ...newProduct,
                price: Number(newProduct.price),
                createdAt: new Date(),
                inStock: newProduct.inStock
            });
            setNewProduct({ name: '', price: '', category: '', description: '', image: '', inStock: true });

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
                <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, marginTop: 20 }}>
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
                        <select
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            required
                            style={{ padding: 8 }}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

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
