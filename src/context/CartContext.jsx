import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Add item to cart
    const addToCart = (product) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:19',message:'addToCart called',data:{productId:product._id||product.id,productName:product.name,hasImage:!!product.image,hasIcon:!!product.icon},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
        setCartItems(prevItems => {
            // Use consistent ID - prefer _id (Firebase) or id
            const productId = product._id || product.id;
            const existingItem = prevItems.find(item => {
                const itemId = item._id || item.id;
                return itemId === productId;
            });

            if (existingItem) {
                const updated = prevItems.map(item => {
                    const itemId = item._id || item.id;
                    return itemId === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item;
                });
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:30',message:'Item quantity updated',data:{productId,newQuantity:existingItem.quantity+1,allItems:updated.map(i=>({id:i._id||i.id,name:i.name,qty:i.quantity}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
                return updated;
            }

            // Create unique cart item with consistent ID
            const newItem = {
                ...product,
                id: productId, // Ensure id field exists
                _id: product._id, // Keep _id if it exists
                quantity: 1
            };
            const newItems = [...prevItems, newItem];
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:42',message:'New item added to cart',data:{productId,productName:product.name,allItems:newItems.map(i=>({id:i._id||i.id,name:i.name,qty:i.quantity}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            return newItems;
        });

        // DO NOT auto-open cart - user should click cart icon to view
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const filtered = prevItems.filter(item => {
                const itemId = item._id || item.id;
                return itemId !== productId;
            });
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:50',message:'Item removed from cart',data:{productId,remainingItems:filtered.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            return filtered;
        });
    };

    // Update quantity
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems => {
            const updated = prevItems.map(item => {
                const itemId = item._id || item.id;
                return itemId === productId
                    ? { ...item, quantity: newQuantity }
                    : item;
            });
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CartContext.jsx:60',message:'Quantity updated',data:{productId,newQuantity},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            return updated;
        });
    };

    // Calculate total
    const getTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Get total item count
    const getItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // Generate WhatsApp message with order details
    const generateWhatsAppMessage = (transactionRef = '', deliveryAddress = '') => {
        if (cartItems.length === 0) return '';

        let message = "Hello! I've completed my payment and would like to confirm my order:\n\n";
        message += "📦 ORDER DETAILS:\n";
        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Price: GH₵${item.price.toLocaleString()}\n`;
            message += `   Quantity: ${item.quantity}\n`;
            message += `   Subtotal: GH₵${(item.price * item.quantity).toLocaleString()}\n\n`;
        });

        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        message += `💰 TOTAL AMOUNT PAID: GH₵${getTotal().toLocaleString()}\n\n`;

        if (transactionRef) {
            message += `📝 Transaction Reference: ${transactionRef}\n`;
        }

        if (deliveryAddress) {
            message += `📍 Delivery Address:\n${deliveryAddress}\n\n`;
        }

        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        message += "Please confirm receipt of payment. I'll attach a screenshot of the payment for faster verification.\n\n";
        message += "Thank you! 🙏";

        return encodeURIComponent(message);
    };

    const value = {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        getItemCount,
        generateWhatsAppMessage
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
