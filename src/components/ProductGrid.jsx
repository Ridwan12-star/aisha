import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, selectedCategory }) => {
    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products;

    return (
        <section className="products-section" id="products">
            <div className="container">
                <h2 className="section-title">
                    {selectedCategory
                        ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
                        : 'All Products'}
                </h2>
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
