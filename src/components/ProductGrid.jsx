import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, selectedCategory, selectedSubcategory, onProductClick }) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:4',message:'ProductGrid render',data:{productsCount:products.length,selectedCategory,selectedSubcategory,onProductClickExists:typeof onProductClick==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    let filteredProducts = products;

    if (selectedSubcategory) {
        // Filter by subcategory
        if (selectedCategory === 'babygear') {
            // Map subcategories to actual category IDs (handle both old and new category names)
            const subcategoryMap = {
                'babywalker': ['walkers', 'walker', 'babywalker', 'baby walker'],
                'highchair': ['highchair', 'high chair', 'highchair'],
                'pottytrainer': ['pottytrainer', 'potty trainer', 'pottytrainer']
            };
            const categoriesToFilter = subcategoryMap[selectedSubcategory] || [selectedSubcategory];
            if (categoriesToFilter.length > 0) {
                filteredProducts = products.filter(product => {
                    const productCategory = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                    const productCategoryOriginal = product.category?.toLowerCase() || '';
                    const matches = categoriesToFilter.some(cat => 
                        productCategory === cat.toLowerCase().replace(/\s+/g, '') ||
                        productCategoryOriginal === cat.toLowerCase() ||
                        productCategory.includes(cat.toLowerCase().replace(/\s+/g, '')) ||
                        (selectedSubcategory === 'babywalker' && (productCategory.includes('walker') || productCategoryOriginal.includes('walker')))
                    );
                    // #region agent log
                    if (products.indexOf(product) < 3) { // Log first 3 products only
                        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:22',message:'Filtering product',data:{productName:product.name,productCategory,categoriesToFilter,selectedSubcategory,matches},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                    }
                    // #endregion
                    return matches;
                });
            }
        } else if (selectedCategory === 'clothing') {
            // For clothing, filter by subcategory (boy/girl)
            // Handle both "clothing" and "baby clothes" category names
            filteredProducts = products.filter(product => {
                const productCategory = product.category?.toLowerCase() || '';
                const productCategoryNormalized = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                const productName = product.name?.toLowerCase() || '';
                const productDescription = product.description?.toLowerCase() || '';
                
                const isClothingCategory = productCategoryNormalized.includes('clothing') || 
                                          productCategoryNormalized.includes('babyclothes') ||
                                          productCategory.includes('baby clothes') ||
                                          productCategory.includes('clothing');
                
                if (selectedSubcategory === 'boy') {
                    return isClothingCategory && (
                        productCategory.includes('boy') || 
                        productName.includes('boy') ||
                        productDescription.includes('boy')
                    );
                } else if (selectedSubcategory === 'girl') {
                    return isClothingCategory && (
                        productCategory.includes('girl') || 
                        productName.includes('girl') ||
                        productDescription.includes('girl')
                    );
                }
                return false;
            });
        }
    } else if (selectedCategory) {
        // Filter by main category (but not babygear or clothing - they need subcategory selection)
        if (selectedCategory !== 'babygear' && selectedCategory !== 'clothing') {
            // Map category names for filtering
            const categoryFilterMap = {
                'sleepwear': ['sleepwear', 'sleep wear', 'nightwear', 'night wear'],
                'feeding': ['feeding', 'feeding products', 'food product', 'food products']
            };
            
            const categoriesToMatch = categoryFilterMap[selectedCategory] || [selectedCategory];
            
            filteredProducts = products.filter(product => {
                const productCategory = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                const productCategoryOriginal = product.category?.toLowerCase() || '';
                const normalizedSelected = selectedCategory.toLowerCase().replace(/\s+/g, '');
                
                return categoriesToMatch.some(cat => 
                    productCategory === cat.toLowerCase().replace(/\s+/g, '') ||
                    productCategoryOriginal === cat.toLowerCase() ||
                    productCategory === normalizedSelected ||
                    product.category === selectedCategory
                );
            });
        } else {
            filteredProducts = []; // Show nothing until subcategory is selected
        }
    }

    const getCategoryDisplayName = () => {
        if (selectedSubcategory) {
            const subcategoryNames = {
                'babywalker': 'Baby Walker',
                'highchair': 'High Chair',
                'pottytrainer': 'Potty Trainer',
                'boy': 'Boy Clothing',
                'girl': 'Girl Clothing'
            };
            return subcategoryNames[selectedSubcategory] || selectedSubcategory;
        }
        if (selectedCategory) {
            const categoryNames = {
                'babygear': 'Baby Gear',
                'clothing': 'Clothing',
                'sleepwear': 'Sleep Wear',
                'feeding': 'Feeding'
            };
            return categoryNames[selectedCategory] || 
                   selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        }
        return 'All Products';
    };

    return (
        <section className="products-section" id="products">
            <div className="container">
                <h2 className="section-title">
                    {getCategoryDisplayName()} Products
                </h2>
                <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product}
                                onClick={onProductClick ? () => onProductClick(product) : undefined}
                            />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                            {selectedCategory === 'babygear' || selectedCategory === 'clothing' 
                                ? 'Please select a subcategory above'
                                : 'No products found in this category'}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
