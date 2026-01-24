

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

    const hasVariants = product.variants && product.variants.length > 0;
    const currentProduct = hasVariants ? product.variants[currentVariantIndex] : product;

    // Use variant image or fallback to main product image/icon
    const displayImage = hasVariants ? currentProduct.image : (product.image || product.icon);
    const displayName = hasVariants ? `${product.name} - ${currentProduct.name}` : product.name;

    const handleNextVariant = (e) => {
        e.stopPropagation();
        setCurrentVariantIndex((prev) => (prev + 1) % product.variants.length);
    };

    const handlePrevVariant = (e) => {
        e.stopPropagation();
        setCurrentVariantIndex((prev) => (prev - 1 + product.variants.length) % product.variants.length);
    };

    const handleAddToCart = () => {
        const itemToAdd = {
            ...product, // Keep original ID and main info
            name: displayName, // Update name to include variant
            image: hasVariants ? currentProduct.image : product.image, // Use exact image
            variant: hasVariants ? currentProduct.name : null
        };
        addToCart(itemToAdd);
    };

    return (
        <div className="product-card">
            <div className="product-image" style={{ position: 'relative' }}>
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
                            {currentProduct.name}
                        </div>
                    </>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">GH₵{product.price.toLocaleString()}</div>
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart 🛒
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
