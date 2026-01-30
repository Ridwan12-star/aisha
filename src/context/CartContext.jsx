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
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevItems, { ...product, quantity: 1 }];
        });

        // Open cart when item is added
        setIsCartOpen(true);
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    // Update quantity
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
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
