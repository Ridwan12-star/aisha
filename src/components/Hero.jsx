import React from 'react';

const Hero = () => {
    const scrollToProducts = () => {
        const element = document.querySelector('#products');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero" id="home">
            <div className="hero-content">
                <h1>Welcome to Aisha's Shop! ✨</h1>
                <p>Your one-stop destination for quality children's clothing, toys, and essentials. Making your little ones smile, one adorable outfit at a time! 💕</p>
                <a href="#products" className="btn btn-primary" onClick={(e) => { e.preventDefault(); scrollToProducts(); }}>
                    Shop Now
                </a>
            </div>
        </section>
    );
};

export default Hero;
