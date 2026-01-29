import React from 'react';
import { getMainCategories, getSubcategories } from '../utils/categoryUtils';

const Categories = ({ categories, onCategoryClick, selectedCategory, onSubcategoryClick, selectedSubcategory }) => {
    // Normalize category ID for comparison
    const normalizedSelectedCategory = selectedCategory?.toLowerCase().replace(/\s+/g, '');
    const subcategories = getSubcategories(selectedCategory);
    const showSubcategories = normalizedSelectedCategory && subcategories.length > 0;

    // Process categories - filter out subcategories and only show main categories
    const processedCategories = getMainCategories(categories);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Categories.jsx:12',message:'Categories processed',data:{totalCategories:categories.length,mainCategoriesCount:processedCategories.length,processedCategories:processedCategories.map(c=>({name:c.displayName,normalizedId:c.normalizedId,originalName:c.name,originalId:c.id})),allCategories:categories.map(c=>({id:c.id,name:c.name}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    return (
        <section className="categories-section" id="categories">
            <div className="container">
                <h2 className="section-title">Shop by Category</h2>
                
                {showSubcategories ? (
                    <div>
                        <button 
                            onClick={() => onCategoryClick(null)}
                            className="back-to-categories-btn"
                        >
                            ← Back to Categories
                        </button>
                        <div className="categories-grid">
                            {subcategories.map(subcategory => (
                                <div
                                    key={subcategory.id}
                                    className={`category-card ${selectedSubcategory === subcategory.id ? 'active' : ''}`}
                                    onClick={() => onSubcategoryClick(subcategory.id)}
                                >
                                    <span className="category-icon">{subcategory.icon}</span>
                                    <h3>{subcategory.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {processedCategories.map(category => (
                            <div
                                key={category.id}
                                className="category-card"
                                onClick={() => onCategoryClick(category.normalizedId || category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <h3>{category.displayName || category.name}</h3>
                                <p>{category.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Categories;
