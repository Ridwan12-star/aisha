import React from 'react';

const Categories = ({ categories, onCategoryClick, selectedCategory, onSubcategoryClick, selectedSubcategory }) => {
    // Define subcategories mapping
    const subcategories = {
        babygear: [
            { id: 'babywalker', name: 'Baby Walker', icon: '🚼' },
            { id: 'highchair', name: 'High Chair', icon: '🪑' },
            { id: 'pottytrainer', name: 'Potty Trainer', icon: '🚽' }
        ],
        clothing: [
            { id: 'boy', name: 'Boy', icon: '👦' },
            { id: 'girl', name: 'Girl', icon: '👧' }
        ]
    };

    // Normalize category ID for comparison
    const normalizedSelectedCategory = selectedCategory?.toLowerCase().replace(/\s+/g, '');
    const showSubcategories = normalizedSelectedCategory && subcategories[normalizedSelectedCategory];

    // Map category names to normalized IDs
    const categoryIdMap = {
        'baby gear': 'babygear',
        'babygear': 'babygear',
        'walker': 'babygear',
        'walkers': 'babygear',
        'clothing': 'clothing',
        'baby clothes': 'clothing',
        'babyclothes': 'clothing',
        'sleep wear': 'sleepwear',
        'sleepwear': 'sleepwear',
        'night wear': 'sleepwear',
        'nightwear': 'sleepwear',
        'feeding': 'feeding',
        'feeding products': 'feeding',
        'food product': 'feeding',
        'food products': 'feeding'
    };

    // Process categories to normalize IDs and display names
    const processedCategories = categories.map(cat => {
        const name = cat.name?.toLowerCase() || '';
        const id = cat.id?.toLowerCase().replace(/\s+/g, '') || '';
        const normalizedId = categoryIdMap[name] || categoryIdMap[id] || id || cat.id;
        
        // Map display names for renamed categories
        const displayNameMap = {
            'babygear': 'Baby Gear',
            'clothing': 'Clothing',
            'sleepwear': 'Sleep Wear',
            'feeding': 'Feeding'
        };
        
        const displayName = displayNameMap[normalizedId] || cat.name;
        
        // #region agent log
        if (categories.indexOf(cat) < 5) { // Log first 5 categories
            fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Categories.jsx:40',message:'Category normalization',data:{originalName:cat.name,originalId:cat.id,normalizedName:name,normalizedId,displayName},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        return { ...cat, normalizedId, displayName };
    });

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
                            {subcategories[normalizedSelectedCategory].map(subcategory => (
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
