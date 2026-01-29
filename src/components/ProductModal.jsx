import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

    const hasVariants = product.variants && product.variants.length > 0;
    const currentVariant = hasVariants ? product.variants[currentVariantIndex] : null;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal.jsx:9',message:'Variant state',data:{hasVariants,variantsLength:product.variants?.length||0,currentVariantIndex,currentVariantExists:!!currentVariant},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const displayImage = hasVariants && currentVariant?.image
        ? currentVariant.image
        : (product.image || product.icon);

    const displayName = hasVariants && currentVariant?.name 
        ? `${product.name} - ${currentVariant.name}` 
        : product.name;

    const inStock = product.inStock !== false;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!inStock) return;
        const itemToAdd = {
            ...product,
            name: displayName,
            image: displayImage,
            variant: hasVariants && currentVariant ? currentVariant.name : null
        };
        addToCart(itemToAdd);
    };

    const handleNextVariant = (e) => {
        e.stopPropagation();
        if (hasVariants) {
            setCurrentVariantIndex((prev) => (prev + 1) % product.variants.length);
        }
    };

    const handlePrevVariant = (e) => {
        e.stopPropagation();
        if (hasVariants) {
            setCurrentVariantIndex((prev) => (prev - 1 + product.variants.length) % product.variants.length);
        }
    };

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="product-modal-close" onClick={onClose}>×</button>
                
                <div className="product-modal-content">
                    <div className="product-modal-image-container">
                        {typeof displayImage === 'string' && 
                         (displayImage.startsWith('http') || displayImage.startsWith('/') || displayImage.startsWith('data:')) ? (
                            <img 
                                src={displayImage} 
                                alt={displayName} 
                                className="product-modal-image"
                            />
                        ) : (
                            <div style={{ fontSize: '8rem' }}>{displayImage}</div>
                        )}
                        
                        {hasVariants && product.variants.length > 1 && (
                            <>
                                <button 
                                    className="product-modal-nav-btn prev"
                                    onClick={handlePrevVariant}
                                >
                                    ‹
                                </button>
                                <button 
                                    className="product-modal-nav-btn next"
                                    onClick={handleNextVariant}
                                >
                                    ›
                                </button>
                                <div className="product-modal-variant-indicator">
                                    {currentVariant?.name || 'Unknown'} ({currentVariantIndex + 1}/{product.variants.length})
                                </div>
                            </>
                        )}
                    </div>

                    <div className="product-modal-info">
                        <h2>{product.name}</h2>
                        <p className="product-modal-description">{product.description}</p>
                        <div className="product-modal-price">GH₵{product.price.toLocaleString()}</div>
                        
                        {hasVariants && product.variants.length > 1 && (
                            <div className="product-modal-variants">
                                <h4>Variants:</h4>
                                <div className="product-modal-variant-thumbnails">
                                    {product.variants.map((variant, index) => (
                                        <button
                                            key={index}
                                            className={`variant-thumbnail ${index === currentVariantIndex ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentVariantIndex(index);
                                            }}
                                        >
                                            {typeof variant.image === 'string' && 
                                             (variant.image.startsWith('http') || variant.image.startsWith('/') || variant.image.startsWith('data:')) ? (
                                                <img src={variant.image} alt={variant.name} />
                                            ) : (
                                                <span>{variant.name}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="product-modal-add-to-cart"
                            onClick={handleAddToCart}
                            disabled={!inStock}
                        >
                            {inStock ? 'Add to Cart 🛒' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
