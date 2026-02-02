import React from 'react';
import ProductCard from './ProductCard';
import { normalizeCategoryId, getSubcategories } from '../utils/categoryUtils';

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
        // Filter by subcategory - dynamic approach
        // Find the subcategory document
        const subcategoryDoc = categories.find(cat => cat.id === selectedSubcategory);
        
        if (subcategoryDoc) {
            // This is a Firebase subcategory - filter products by this category ID
            filteredProducts = products.filter(product => {
                // Match by Firebase category ID (primary method)
                const matchesById = product.category === subcategoryDoc.id;
                
                // Also check product.subcategory field for backward compatibility
                const productSubcategory = product.subcategory?.toLowerCase() || '';
                const subcategoryName = subcategoryDoc.name?.toLowerCase() || '';
                const matchesBySubcategoryField = productSubcategory === subcategoryName || 
                    productSubcategory === subcategoryDoc.id.toLowerCase();
                
                // Check product name and description for keywords (for boy/girl subcategories)
                const productName = product.name?.toLowerCase() || '';
                const productDescription = product.description?.toLowerCase() || '';
                const matchesByName = productName.includes(subcategoryName) || 
                    productDescription.includes(subcategoryName);
                
                return matchesById || matchesBySubcategoryField || matchesByName;
            });
        } else {
            // Fallback: Try to find subcategory by ID match (for backward compatibility)
            // This handles old hardcoded subcategory IDs
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
                        productCategory.includes(cat.toLowerCase().replace(/\s+/g, ''))
                    );
                    
                    // Also check if product.category is a Firebase ID that we need to look up
                    const productCategoryDoc = categories.find(cat => cat.id === product.category);
                    const productCategoryName = productCategoryDoc?.name?.toLowerCase() || '';
                    const matchesByLookup = categoryNamesToMatch.some(name => 
                        productCategoryName.includes(name.toLowerCase())
                    );
                    
                    // For boy/girl subcategories, also check product.subcategory field
                    const productSubcategory = product.subcategory?.toLowerCase() || '';
                    const matchesBySubcategory = (selectedSubcategory === 'boy' || selectedSubcategory === 'girl') &&
                        productSubcategory === selectedSubcategory;
                    
                    return matchesById || matchesByName || matchesByLookup || matchesBySubcategory;
                });
            }
        }
    } else if (selectedCategory) {
        // Check if this category has subcategories
        const categorySubcategories = getSubcategories(selectedCategory, categories);
        const hasSubcategories = categorySubcategories.length > 0;
        
        if (hasSubcategories) {
            // Categories with subcategories (babygear, clothing, sleepwear) require subcategory selection
            filteredProducts = [];
        } else {
            // Categories without subcategories show products directly
            // First check if selectedCategory is a Firebase ID (for new categories)
            const isFirebaseId = categories.some(cat => cat.id === selectedCategory);
            
            if (isFirebaseId) {
                // Filter by Firebase category ID directly
                filteredProducts = products.filter(product => {
                    return product.category === selectedCategory;
                });
            } else {
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
                        fetch('http://127.0.0.1:7242/ingest/801788a4-a8a9-4777-ab8c-d2e805755fb6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductGrid.jsx:167',message:'Filtering product by category (no subcategories)',data:{productName:product.name,productCategory:product.category,selectedCategory,matchingCategoryIds,matchesById,matchesByLookup,matchesByName,productCategoryDocName:productCategoryDoc?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    }
                    // #endregion
                    
                    return matchesById || matchesByLookup || matchesByName;
                });
            }
        }
    }

    const getCategoryDisplayName = () => {
        if (selectedSubcategory) {
            // Try to find the subcategory document for display name
            const subcategoryDoc = categories.find(cat => cat.id === selectedSubcategory);
            if (subcategoryDoc) {
                return subcategoryDoc.name;
            }
            
            // Fallback to hardcoded names for backward compatibility
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
            // First try to find by Firebase ID (for new categories)
            let categoryDoc = categories.find(cat => cat.id === selectedCategory && !cat.parentCategory);
            
            // If not found, try normalized ID (for known categories)
            if (!categoryDoc) {
                categoryDoc = categories.find(cat => {
                    const normalized = normalizeCategoryId(cat.id, cat.name);
                    return normalized === selectedCategory && !cat.parentCategory;
                });
            }
            
            if (categoryDoc) {
                return categoryDoc.name;
            }
            
            // Fallback to hardcoded names
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

    // Show products when:
    // 1. No category is selected (All Products)
    // 2. A subcategory is selected
    // 3. A category without subcategories is selected (onesies, toys, feeding)
    const categorySubcategories = selectedCategory ? getSubcategories(selectedCategory, categories) : [];
    const hasSubcategories = categorySubcategories.length > 0;
    const shouldShowProducts = !selectedCategory || selectedSubcategory || !hasSubcategories;

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
