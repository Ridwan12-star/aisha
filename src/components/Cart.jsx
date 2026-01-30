import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        setIsCheckoutOpen,
        removeFromCart,
        updateQuantity,
        getTotal
    } = useCart();

    const handleCheckout = () => {
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:15',message:'Checkout clicked',data:{itemsCount:cartItems.length,total:getTotal()},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
    };

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isCartOpen]);

    // #region agent log
    useEffect(() => {
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:30',message:'Cart render',data:{isCartOpen,cartItemsCount:cartItems.length,cartItems:cartItems.map(i=>({id:i._id||i.id,name:i.name,qty:i.quantity}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
    }, [isCartOpen, cartItems.length]);
    // #endregion

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
                        cartItems.map((item, index) => {
                            const itemId = item._id || item.id;
                            // #region agent log
                            if (index < 3) {
                                fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:44',message:'Rendering cart item',data:{itemId,itemName:item.name,quantity:item.quantity,hasImage:!!item.image,hasIcon:!!item.icon},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
                            }
                            // #endregion
                            return (
                                <div key={itemId || index} className="cart-item">
                                    <div className="cart-item-image">
                                        {typeof item.image === 'string' && 
                                         (item.image.startsWith('http') || item.image.startsWith('/') || item.image.startsWith('data:')) ? (
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{item.image || item.icon || '📦'}</div>
                                        )}
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">GH₵{item.price.toLocaleString()}</div>
                                        <div className="quantity-controls">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="remove-item"
                                        onClick={() => removeFromCart(itemId)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span className="cart-total-amount">GH₵{getTotal().toLocaleString()}</span>
                        </div>
                        <button className="btn btn-whatsapp checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
