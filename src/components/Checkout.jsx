import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const Checkout = ({ onClose }) => {
    const { cartItems, getTotal, generateWhatsAppMessage } = useCart();
    const [transactionRef, setTransactionRef] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    const handlePaymentComplete = () => {
        const message = generateWhatsAppMessage(transactionRef, deliveryAddress);
        const whatsappUrl = `https://wa.me/233538232507?text=${message}`;
        window.open(whatsappUrl, '_blank');
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:11',message:'Payment complete - WhatsApp opened',data:{itemsCount:cartItems.length,total:getTotal(),hasTransactionRef:!!transactionRef,hasDeliveryAddress:!!deliveryAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
    };

    return (
        <div className="checkout-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="checkout-header">
                    <h2>Checkout</h2>
                    <button className="close-checkout" onClick={onClose}>✕</button>
                </div>

                <div className="checkout-content">
                    {/* Order Summary */}
                    <div className="checkout-section">
                        <h3>Order Summary</h3>
                        <div className="checkout-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="checkout-item">
                                    <div className="checkout-item-image">
                                        {typeof item.image === 'string' && 
                                         (item.image.startsWith('http') || item.image.startsWith('/') || item.image.startsWith('data:')) ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <div style={{ fontSize: '2rem' }}>{item.image || item.icon || '📦'}</div>
                                        )}
                                    </div>
                                    <div className="checkout-item-details">
                                        <div className="checkout-item-name">{item.name}</div>
                                        <div className="checkout-item-info">
                                            <span>GH₵{item.price.toLocaleString()} × {item.quantity}</span>
                                            <span className="checkout-item-subtotal">
                                                GH₵{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="checkout-total">
                            <span>Total Amount:</span>
                            <span className="checkout-total-amount">GH₵{getTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="checkout-section">
                        <h3>Payment Details</h3>
                        <div className="payment-info">
                            <div className="payment-method">
                                <strong>Mobile Money / Bank Transfer</strong>
                                <div className="payment-details">
                                    <p><strong>Number:</strong> 0538232507</p>
                                    <p><strong>Name:</strong> Aliu Aisha</p>
                                </div>
                            </div>
                            <p className="payment-note">
                                Please transfer the total amount to the above number and fill in the details below.
                            </p>
                        </div>
                    </div>

                    {/* Transaction Details Form */}
                    <div className="checkout-section">
                        <h3>Payment Confirmation</h3>
                        <div className="checkout-form">
                            <div className="form-group">
                                <label htmlFor="transactionRef">Transaction Reference *</label>
                                <input
                                    id="transactionRef"
                                    type="text"
                                    placeholder="Enter your transaction reference number"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="deliveryAddress">Delivery Address *</label>
                                <textarea
                                    id="deliveryAddress"
                                    placeholder="Enter your complete delivery address"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    required
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="checkout-actions">
                        <button
                            className="btn btn-whatsapp checkout-payment-btn"
                            onClick={handlePaymentComplete}
                            disabled={!transactionRef.trim() || !deliveryAddress.trim()}
                        >
                            💬 I've Made Payment - Send Order via WhatsApp
                        </button>
                        <p className="checkout-note">
                            You'll be redirected to WhatsApp with your order details. Please attach a screenshot of your payment for faster verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
