import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { setIsCartOpen, getItemCount } = useCart();

    const scrollToSection = (sectionId) => {
        const element = document.querySelector(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header>
            <nav>
                <div className="logo" onClick={() => scrollToSection('#home')}>
                    minimekiddiestreasures 👶
                </div>

                <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>Home</a></li>
                    <li><a href="#categories" onClick={(e) => { e.preventDefault(); scrollToSection('#categories'); }}>Categories</a></li>
                    <li><a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('#products'); }}>Products</a></li>
                    <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact</a></li>
                </ul>

                <div className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
                    🛒
                    <span className="cart-count">{getItemCount()}</span>
                </div>
            </nav>
        </header>
    );
};

export default Header;
