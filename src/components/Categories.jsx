import React from 'react';
import { categories } from '../data/productsData';

const Categories = ({ onCategoryClick }) => {
    return (
        <section className="categories-section" id="categories">
            <div className="container">
                <h2 className="section-title">Shop by Category</h2>
                <div className="categories-grid">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className="category-card"
                            onClick={() => onCategoryClick(category.id)}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
