import React from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <div className="product-card">
            <div className="product-image">
                {product.icon}
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
