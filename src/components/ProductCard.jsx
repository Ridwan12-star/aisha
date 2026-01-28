

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
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
        <div className="product-card" style={{ opacity: inStock ? 1 : 0.6 }}>
            <div className="product-image" style={{ position: 'relative' }}>
                {!inStock && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: '#dc3545',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        zIndex: 10
                    }}>
                        Sold Out
                    </div>
                )}

                {typeof displayImage === 'string' && (displayImage.startsWith('http') || displayImage.startsWith('/')) ? (
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
                    onClick={handleAddToCart}
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
