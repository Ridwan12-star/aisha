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
        } else if (selectedCategory === 'clothing') {
            // For clothing, filter by subcategory (boy/girl)
            // Handle both "clothing" and "baby clothes" category names
            filteredProducts = products.filter(product => {
                const productCategory = product.category?.toLowerCase() || '';
                const productCategoryNormalized = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                const productName = product.name?.toLowerCase() || '';
                const productDescription = product.description?.toLowerCase() || '';
                const productSubcategory = product.subcategory?.toLowerCase() || '';
                
                // Check if product.category is a Firebase ID that maps to clothing
                const productCategoryDoc = categories.find(cat => cat.id === product.category);
                const productCategoryName = productCategoryDoc?.name?.toLowerCase() || '';
                const normalizedProductCategory = productCategoryDoc ? normalizeCategoryId(productCategoryDoc.id, productCategoryDoc.name) : '';
                
                const isClothingCategory = productCategoryNormalized.includes('clothing') || 
                                          productCategoryNormalized.includes('babyclothes') ||
                                          productCategory.includes('baby clothes') ||
                                          productCategory.includes('clothing') ||
                                          productCategoryName.includes('clothing') ||
                                          productCategoryName.includes('baby clothes') ||
                                          normalizedProductCategory === 'clothing';
                
                // #region agent log
                if (products.indexOf(product) < 5) {
                    fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:74',message:'Filtering clothing product by subcategory',data:{productName:product.name,productCategory,productSubcategory,selectedSubcategory,isClothingCategory,productCategoryDocName:productCategoryDoc?.name,normalizedProductCategory},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                }
                // #endregion
                
                if (selectedSubcategory === 'boy') {
                    const matches = isClothingCategory && (
                        productSubcategory === 'boy' ||
                        productCategory.includes('boy') || 
                        productName.includes('boy') ||
                        productDescription.includes('boy')
                    );
                    // #region agent log
                    if (products.indexOf(product) < 3 && isClothingCategory) {
                        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:95',message:'Boy subcategory match check',data:{productName:product.name,matches,productSubcategory,productCategoryIncludesBoy:productCategory.includes('boy'),productNameIncludesBoy:productName.includes('boy'),productDescriptionIncludesBoy:productDescription.includes('boy')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    }
                    // #endregion
                    return matches;
                } else if (selectedSubcategory === 'girl') {
                    const matches = isClothingCategory && (
                        productSubcategory === 'girl' ||
                        productCategory.includes('girl') || 
                        productName.includes('girl') ||
                        productDescription.includes('girl')
                    );
                    // #region agent log
                    if (products.indexOf(product) < 3 && isClothingCategory) {
                        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:105',message:'Girl subcategory match check',data:{productName:product.name,matches,productSubcategory,productCategoryIncludesGirl:productCategory.includes('girl'),productNameIncludesGirl:productName.includes('girl'),productDescriptionIncludesGirl:productDescription.includes('girl')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    }
                    // #endregion
                    return matches;
                }
                return false;
            });
        }
    } else if (selectedCategory) {
        // Filter by main category (but not babygear or clothing - they need subcategory selection)
        if (selectedCategory !== 'babygear' && selectedCategory !== 'clothing') {
            // Get Firebase category document IDs that match the selected normalized category
            const matchingCategoryIds = getCategoryIdsForNormalized(selectedCategory);
            
            // Also include name-based matching for backward compatibility
            const categoryFilterMap = {
                'sleepwear': ['sleepwear', 'sleep wear', 'nightwear', 'night wear'],
                'feeding': ['feeding', 'feeding products', 'food product', 'food products'],
                'onesies': ['onesies'],
                'toys': ['toys']
            };
            
            const categoryNamesToMatch = categoryFilterMap[selectedCategory] || [selectedCategory];
            
            filteredProducts = products.filter(product => {
                // Match by Firebase document ID (primary method)
                const matchesById = matchingCategoryIds.includes(product.category);
                
                // Match by category name (fallback for old data)
                const productCategory = product.category?.toLowerCase().replace(/\s+/g, '') || '';
                const productCategoryOriginal = product.category?.toLowerCase() || '';
                const normalizedSelected = selectedCategory.toLowerCase().replace(/\s+/g, '');
                
                // Also check if product.category is a Firebase ID that we need to look up
                const productCategoryDoc = categories.find(cat => cat.id === product.category);
                const productCategoryNormalized = productCategoryDoc ? normalizeCategoryId(productCategoryDoc.id, productCategoryDoc.name) : '';
                const matchesByLookup = productCategoryNormalized === selectedCategory;
                
                const matchesByName = categoryNamesToMatch.some(cat => 
                    productCategory === cat.toLowerCase().replace(/\s+/g, '') ||
                    productCategoryOriginal === cat.toLowerCase() ||
                    productCategory === normalizedSelected ||
                    product.category === selectedCategory
                );
                
                // #region agent log
                if (products.indexOf(product) < 3) {
                    fetch('http://127.0.0.1:7243/ingest/98eed7ba-aa2e-4edd-ad9c-fb8e5845045f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:95',message:'Filtering product by category',data:{productName:product.name,productCategory:product.category,selectedCategory,matchingCategoryIds,matchesById,matchesByLookup,matchesByName,productCategoryDocName:productCategoryDoc?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'E'})}).catch(()=>{});
                }
                // #endregion
                
                return matchesById || matchesByLookup || matchesByName;
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
