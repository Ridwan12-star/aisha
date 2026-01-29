

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onClick }) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductCard.jsx:6',message:'ProductCard render',data:{productId:product?._id,onClickExists:typeof onClick==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const { addToCart } = useCart();
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

    const hasVariants = product.variants && product.variants.length > 0;
    const currentVariant = hasVariants ? product.variants[currentVariantIndex] : null;

    // Use variant image or fallback to main product image/icon
    const displayImage = hasVariants && currentVariant.image
        ? currentVariant.image
        : (product.image || product.icon);

    const displayName = hasVariants && currentVariant.name ? `${product.name} - ${currentVariant.name}` : product.name;

    const handleNextVariant = (e) => {
        e.stopPropagation();
        setCurrentVariantIndex((prev) => (prev + 1) % product.variants.length);
    };

    const handlePrevVariant = (e) => {
        e.stopPropagation();
        setCurrentVariantIndex((prev) => (prev - 1 + product.variants.length) % product.variants.length);
    };

    // Check if product is in stock (undefined means in stock for backward compatibility)
    const inStock = product.inStock !== false;

    const handleAddToCart = () => {
        if (!inStock) return;

        const itemToAdd = {
            ...product,
            name: displayName,
            image: displayImage,
            variant: hasVariants && currentVariant ? currentVariant.name : null
        };
        addToCart(itemToAdd);
    };

    return (
        <div 
            className="product-card" 
            style={{ opacity: inStock ? 1 : 0.6 }}
            onClick={onClick || (() => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductCard.jsx:49',message:'onClick undefined fallback',data:{productId:product?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
            })}
        >
            <div className="product-image" style={{ position: 'relative' }}>
                {!inStock && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: '#dc3545',
                        color: 'white',
                        padding: '4px 8px', /* Reduced padding */
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem', /* Smaller font */
                        zIndex: 10
                    }}>
                        Sold Out
                    </div>
                )}

                {typeof displayImage === 'string' && (displayImage.startsWith('http') || displayImage.startsWith('/') || displayImage.startsWith('data:')) ? (
                    <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ fontSize: '4rem' }}>{displayImage}</div>
                )}

                {hasVariants && (
                    <>
                        <button
                            onClick={handlePrevVariant}
                            style={{
                                position: 'absolute',
                                left: '5px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.7)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={handleNextVariant}
                            style={{
                                position: 'absolute',
                                right: '5px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.7)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            &gt;
                        </button>
                        <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.8rem'
                        }}>
                            {currentVariant.name}
                        </div>
                    </>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">GH₵{product.price.toLocaleString()}</div>
                <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                    disabled={!inStock}
                    style={{
                        opacity: inStock ? 1 : 0.5,
                        cursor: inStock ? 'pointer' : 'not-allowed',
                        background: inStock ? undefined : '#ccc'
                    }}
                >
                    {inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
