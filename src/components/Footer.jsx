import React from 'react';

const Footer = ({ onCategoryClick }) => {
    const scrollToSection = (sectionId) => {
        const element = document.querySelector(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer id="contact">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>minimekiddiestreasures 👶</h3>
                    <p>Your trusted source for quality children's products. We provide adorable clothing, comfortable sleepwear, educational toys, and essential baby gear.</p>
                    <a href="https://wa.me/233538232507" className="whatsapp-contact" target="_blank" rel="noopener noreferrer">
                        💬 Chat on WhatsApp
                    </a>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>Home</a>
                    <a href="#categories" onClick={(e) => { e.preventDefault(); scrollToSection('#categories'); }}>Categories</a>
                    <a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('#products'); }}>Products</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact Us</a>
                </div>

                <div className="footer-section">
                    <h3>Categories</h3>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('sleepwear'); scrollToSection('#products'); }}>Sleep Wear</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('clothing'); scrollToSection('#products'); }}>Clothing</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('toys'); scrollToSection('#products'); }}>Toys</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('babygear'); scrollToSection('#products'); }}>Baby Gear</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('feeding'); scrollToSection('#products'); }}>Feeding</a>
                </div>

                <div className="footer-section">
                    <h3>Contact Info</h3>
                    <p>📱 WhatsApp: +233 (05) 538 232 507</p>
                    <p>📧 Email: info@aishasshop.com</p>
                    <p>📍 Location: Koforidua, Ghana</p>
                    <p style={{ marginTop: '1rem' }}>
                        <strong>Business Hours:</strong><br />
                        Mon - Sat: 9:00 AM - 7:00 PM<br />
                        Sunday: 10:00 AM - 5:00 PM
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2026 minimekiddiestreasures. All rights reserved. Made with 💕 for your little ones.</p>
            </div>
        </footer>
    );
};

export default Footer;
