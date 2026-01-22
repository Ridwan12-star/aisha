import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        getTotal,
        generateWhatsAppMessage
    } = useCart();

    const handleCheckout = () => {
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/233599992748?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div
                className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
                onClick={() => setIsCartOpen(false)}
            ></div>

            <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart 🛒</h2>
                    <button className="close-cart" onClick={() => setIsCartOpen(false)}>✕</button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-cart-icon">🛒</div>
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">{item.icon}</div>
                                <div className="cart-item-details">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-price">GH₵{item.price.toLocaleString()}</div>
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="remove-item"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span className="cart-total-amount">GH₵{getTotal().toLocaleString()}</span>
                        </div>
                        <button className="btn btn-whatsapp checkout-btn" onClick={handleCheckout}>
                            <span>💬</span>
                            Checkout via WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
