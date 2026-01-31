import React from 'react';
import ProductCard from './ProductCard';
import { normalizeCategoryId } from '../utils/categoryUtils';

const ProductGrid = ({ products, selectedCategory, selectedSubcategory, onProductClick, categories = [] }) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:5',message:'ProductGrid render',data:{productsCount:products.length,selectedCategory,selectedSubcategory,categoriesCount:categories.length,onProductClickExists:typeof onProductClick==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    let filteredProducts = products;
    
    // Helper function to get Firebase category IDs that match a normalized category
    const getCategoryIdsForNormalized = (normalizedCategory) => {
        return categories
            .filter(cat => {
                const normalized = normalizeCategoryId(cat.id, cat.name);
                return normalized === normalizedCategory;
            })
            .map(cat => cat.id);
    };

    if (selectedSubcategory) {
        // Filter by subcategory
        if (selectedCategory === 'babygear') {
            // Map subcategories to Firebase category names/IDs
            const subcategoryMap = {
                'babywalker': ['walkers', 'walker', 'babywalker', 'baby walker'],
                'highchair': ['highchair', 'high chair'],
                'pottytrainer': ['pottytrainer', 'potty trainer']
            };
            const categoryNamesToMatch = subcategoryMap[selectedSubcategory] || [selectedSubcategory];
            
            // Get Firebase category IDs that match the subcategory
            const matchingCategoryIds = categories
                .filter(cat => {
                    const catName = cat.name?.toLowerCase() || '';
                    return categoryNamesToMatch.some(name => catName.includes(name.toLowerCase()));
                })
                .map(cat => cat.id);
            
            if (matchingCategoryIds.length > 0 || categoryNamesToMatch.length > 0) {
                filteredProducts = products.filter(product => {
                    // Match by Firebase document ID (primary)
                    const matchesById = matchingCategoryIds.includes(product.category);
                    
                    // Match by category name (fallback)
                    const productCategory = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                    const productCategoryOriginal = product.category?.toLowerCase() || '';
                    const matchesByName = categoryNamesToMatch.some(cat => 
                        productCategory === cat.toLowerCase().replace(/\s+/g, '') ||
                        productCategoryOriginal === cat.toLowerCase() ||
                        productCategory.includes(cat.toLowerCase().replace(/\s+/g, '')) ||
                        (selectedSubcategory === 'babywalker' && (productCategory.includes('walker') || productCategoryOriginal.includes('walker')))
                    );
                    
                    // Also check if product.category is a Firebase ID that we need to look up
                    const productCategoryDoc = categories.find(cat => cat.id === product.category);
                    const productCategoryName = productCategoryDoc?.name?.toLowerCase() || '';
                    const matchesByLookup = categoryNamesToMatch.some(name => 
                        productCategoryName.includes(name.toLowerCase())
                    );
                    
                    // #region agent log
                    if (products.indexOf(product) < 3) {
                        fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:30',message:'Filtering product by subcategory',data:{productName:product.name,productCategory:product.category,selectedSubcategory,matchingCategoryIds,matchesById,matchesByName,matchesByLookup,productCategoryDocName:productCategoryDoc?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'E'})}).catch(()=>{});
                    }
                    // #endregion
                    
                    return matchesById || matchesByName || matchesByLookup;
                });
            }
        } else if (selectedCategory === 'clothing' || selectedCategory === 'sleepwear') {
            // For clothing and sleepwear, filter by subcategory (boy/girl)
            // Handle both "clothing" and "baby clothes" category names for clothing
            // Handle "sleepwear", "sleep wear", "nightwear", "night wear" for sleepwear
            filteredProducts = products.filter(product => {
                const productCategory = product.category?.toLowerCase() || '';
                const productCategoryNormalized = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                const productName = product.name?.toLowerCase() || '';
                const productDescription = product.description?.toLowerCase() || '';
                const productSubcategory = product.subcategory?.toLowerCase() || '';
                
                // Check if product.category is a Firebase ID that maps to clothing or sleepwear
                const productCategoryDoc = categories.find(cat => cat.id === product.category);
                const productCategoryName = productCategoryDoc?.name?.toLowerCase() || '';
                const normalizedProductCategory = productCategoryDoc ? normalizeCategoryId(productCategoryDoc.id, productCategoryDoc.name) : '';
                
                // Check if product belongs to the selected category (clothing or sleepwear)
                const isClothingCategory = selectedCategory === 'clothing' && (
                    productCategoryNormalized.includes('clothing') || 
                    productCategoryNormalized.includes('babyclothes') ||
                    productCategory.includes('baby clothes') ||
                    productCategory.includes('clothing') ||
                    productCategoryName.includes('clothing') ||
                    productCategoryName.includes('baby clothes') ||
                    normalizedProductCategory === 'clothing'
                );
                
                const isSleepwearCategory = selectedCategory === 'sleepwear' && (
                    productCategoryNormalized.includes('sleepwear') ||
                    productCategoryNormalized.includes('sleepwear') ||
                    productCategoryNormalized.includes('nightwear') ||
                    productCategory.includes('sleep wear') ||
                    productCategory.includes('sleepwear') ||
                    productCategory.includes('night wear') ||
                    productCategory.includes('nightwear') ||
                    productCategoryName.includes('sleep wear') ||
                    productCategoryName.includes('sleepwear') ||
                    productCategoryName.includes('night wear') ||
                    productCategoryName.includes('nightwear') ||
                    normalizedProductCategory === 'sleepwear'
                );
                
                const isTargetCategory = isClothingCategory || isSleepwearCategory;
                
                // #region agent log
                if (products.indexOf(product) < 5) {
                    fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:94',message:'Filtering product by subcategory',data:{productName:product.name,productCategory,productSubcategory,selectedSubcategory,selectedCategory,isTargetCategory,productCategoryDocName:productCategoryDoc?.name,normalizedProductCategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                }
                // #endregion
                
                if (selectedSubcategory === 'boy') {
                    const matches = isTargetCategory && (
                        productSubcategory === 'boy' ||
                        productCategory.includes('boy') || 
                        productName.includes('boy') ||
                        productDescription.includes('boy')
                    );
                    // #region agent log
                    if (products.indexOf(product) < 3 && isTargetCategory) {
                        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:125',message:'Boy subcategory match check',data:{productName:product.name,matches,productSubcategory,productCategoryIncludesBoy:productCategory.includes('boy'),productNameIncludesBoy:productName.includes('boy'),productDescriptionIncludesBoy:productDescription.includes('boy')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    }
                    // #endregion
                    return matches;
                } else if (selectedSubcategory === 'girl') {
                    const matches = isTargetCategory && (
                        productSubcategory === 'girl' ||
                        productCategory.includes('girl') || 
                        productName.includes('girl') ||
                        productDescription.includes('girl')
                    );
                    // #region agent log
                    if (products.indexOf(product) < 3 && isTargetCategory) {
                        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:137',message:'Girl subcategory match check',data:{productName:product.name,matches,productSubcategory,productCategoryIncludesGirl:productCategory.includes('girl'),productNameIncludesGirl:productName.includes('girl'),productDescriptionIncludesGirl:productDescription.includes('girl')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    }
                    // #endregion
                    return matches;
                }
                return false;
            });
        }
    } else if (selectedCategory) {
        // Don't show any products when only a category is selected (no subcategory)
        // Products will only show when a subcategory is selected
        filteredProducts = [];
    }

    const getCategoryDisplayName = () => {
        if (selectedSubcategory) {
            const subcategoryNames = {
                'babywalker': 'Baby Walker',
                'highchair': 'High Chair',
                'pottytrainer': 'Potty Trainer',
                'boy': selectedCategory === 'sleepwear' ? 'Boy Sleep Wear' : 'Boy Clothing',
                'girl': selectedCategory === 'sleepwear' ? 'Girl Sleep Wear' : 'Girl Clothing'
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

    // Don't show products when only a category is selected (no subcategory) - only show for "All Products" or when subcategory is selected
    const shouldShowProducts = !selectedCategory || selectedSubcategory;

    return (
        <section className="products-section" id="products">
            <div className="container">
                <h2 className="section-title">
                    {getCategoryDisplayName()}
                </h2>
                {shouldShowProducts ? (
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
                                {selectedCategory === 'babygear' || selectedCategory === 'clothing' || selectedCategory === 'sleepwear'
                                    ? 'Please select a subcategory above'
                                    : selectedCategory 
                                    ? 'No products found in this category'
                                    : 'No products available'}
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default ProductGrid;
