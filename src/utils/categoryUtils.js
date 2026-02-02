// Shared category utilities for both main site and admin panel

// Define main categories that should be displayed
export const MAIN_CATEGORIES = [
    'feeding',
    'clothing',
    'sleepwear',
    'onesies',
    'toys',
    'babygear'
];

// Define subcategories that should be hidden from main category list
// Note: "walkers" and "walker" are NOT hidden - they map to "Baby Gear" main category
export const SUBCATEGORIES_TO_HIDE = [
    'pottytrainer',
    'potty trainer',
    'highchair',
    'high chair',
    'babywalker',
    'baby walker'
];

// Map category names to normalized IDs
export const categoryIdMap = {
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
    'food products': 'feeding',
    'onesies': 'onesies',
    'toys': 'toys'
};

// Map display names for renamed categories
export const displayNameMap = {
    'babygear': 'Baby Gear',
    'clothing': 'Clothing',
    'sleepwear': 'Sleep Wear',
    'feeding': 'Feeding',
    'onesies': 'Onesies',
    'toys': 'Toys'
};

// Normalize category ID
export const normalizeCategoryId = (categoryId, categoryName) => {
    const id = categoryId?.toLowerCase().replace(/\s+/g, '') || '';
    const name = categoryName?.toLowerCase() || '';
    return categoryIdMap[name] || categoryIdMap[id] || id || categoryId;
};

// Check if category should be hidden (is a subcategory)
export const shouldHideCategory = (category) => {
    const name = category.name?.toLowerCase() || '';
    const id = category.id?.toLowerCase().replace(/\s+/g, '') || '';
    return SUBCATEGORIES_TO_HIDE.some(hide => 
        name.includes(hide.toLowerCase()) || 
        id.includes(hide.toLowerCase().replace(/\s+/g, ''))
    );
};

// Filter and process categories for display
export const getMainCategories = (categories) => {
    // Group categories by normalized ID to avoid duplicates
    const categoryMap = new Map();
    
    // First, get all categories that don't have a parentCategory (main categories)
    const mainCategories = categories.filter(cat => !cat.parentCategory && !shouldHideCategory(cat));
    
    mainCategories.forEach(cat => {
        const normalizedId = normalizeCategoryId(cat.id, cat.name);
        
        // If it's a known main category, use the display name mapping
        if (MAIN_CATEGORIES.includes(normalizedId)) {
            const displayName = displayNameMap[normalizedId] || cat.name;
            if (!categoryMap.has(normalizedId)) {
                categoryMap.set(normalizedId, {
                    ...cat,
                    normalizedId,
                    displayName,
                    isMainCategory: true
                });
            } else {
                // If current category name matches the display name better, use it
                const existing = categoryMap.get(normalizedId);
                const displayName = displayNameMap[normalizedId] || cat.name;
                if (cat.name?.toLowerCase() === displayName.toLowerCase()) {
                    categoryMap.set(normalizedId, {
                        ...cat,
                        normalizedId,
                        displayName,
                        isMainCategory: true
                    });
                }
            }
        } else {
            // For new categories not in MAIN_CATEGORIES, use their own name and ID
            // Use normalizedId as a unique key, but prefer the category's own ID if it's unique
            const key = cat.id || normalizedId;
            if (!categoryMap.has(key)) {
                categoryMap.set(key, {
                    ...cat,
                    normalizedId: normalizedId,
                    displayName: cat.name,
                    isMainCategory: true
                });
            }
        }
    });
    
    // Convert map to array
    let result = Array.from(categoryMap.values());
    
    // If "Baby Gear" (babygear) is missing but we have "Walkers", create it (backward compatibility)
    const hasBabyGear = result.some(cat => cat.normalizedId === 'babygear');
    if (!hasBabyGear) {
        const walkersCategory = categories.find(cat => {
            const normalized = normalizeCategoryId(cat.id, cat.name);
            return normalized === 'babygear' && !cat.parentCategory;
        });
        if (walkersCategory) {
            result.push({
                ...walkersCategory,
                normalizedId: 'babygear',
                displayName: 'Baby Gear',
                isMainCategory: true
            });
        }
    }
    
    return result;
};

// Get subcategories for a parent category (dynamically from Firebase categories)
export const getSubcategories = (parentCategoryId, categories = []) => {
    if (!parentCategoryId || !categories || categories.length === 0) {
        return [];
    }
    
    // First, try to find parent category by Firebase ID directly (for new categories)
    let parentCategory = categories.find(cat => cat.id === parentCategoryId && !cat.parentCategory);
    
    // If not found, try normalized ID matching (for known categories)
    if (!parentCategory) {
        const normalized = parentCategoryId?.toLowerCase().replace(/\s+/g, '') || '';
        parentCategory = categories.find(cat => {
            const catNormalized = normalizeCategoryId(cat.id, cat.name);
            return catNormalized === normalized && !cat.parentCategory;
        });
    }
    
    if (!parentCategory) {
        // Fallback to hardcoded subcategories for backward compatibility
        const normalized = parentCategoryId?.toLowerCase().replace(/\s+/g, '') || '';
        const hardcodedSubcategories = {
            babygear: [
                { id: 'babywalker', name: 'Baby Walker', icon: '🚼', firebaseCategoryId: 'walkers' },
                { id: 'highchair', name: 'High Chair', icon: '🪑', firebaseCategoryId: 'highchair' },
                { id: 'pottytrainer', name: 'Potty Trainer', icon: '🚽', firebaseCategoryId: 'pottytrainer' }
            ],
            clothing: [
                { id: 'boy', name: 'Boys', icon: '👦', firebaseCategoryId: 'clothing' },
                { id: 'girl', name: 'Girls', icon: '👧', firebaseCategoryId: 'clothing' }
            ],
            sleepwear: [
                { id: 'boy', name: 'Boys', icon: '👦', firebaseCategoryId: 'sleepwear' },
                { id: 'girl', name: 'Girls', icon: '👧', firebaseCategoryId: 'sleepwear' }
            ]
        };
        return hardcodedSubcategories[normalized] || [];
    }
    
    // Get all subcategories that have this parent category as their parentCategory
    const subcategories = categories
        .filter(cat => cat.parentCategory === parentCategory.id)
        .map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '📦',
            firebaseCategoryId: cat.id, // Use the Firebase category ID
            parentCategoryId: cat.parentCategory
        }));
    
    return subcategories;
};
