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
    
    categories
        .filter(cat => !shouldHideCategory(cat))
        .forEach(cat => {
            const normalizedId = normalizeCategoryId(cat.id, cat.name);
            
            // Only include if it's a main category
            if (MAIN_CATEGORIES.includes(normalizedId)) {
                // If we already have this normalized category, prefer the one with the matching name
                if (!categoryMap.has(normalizedId)) {
                    const displayName = displayNameMap[normalizedId] || cat.name;
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
            }
        });
    
    // Convert map to array and ensure all main categories are represented
    const result = Array.from(categoryMap.values());
    
    // If "Baby Gear" (babygear) is missing but we have "Walkers", create it
    const hasBabyGear = result.some(cat => cat.normalizedId === 'babygear');
    if (!hasBabyGear) {
        const walkersCategory = categories.find(cat => {
            const normalized = normalizeCategoryId(cat.id, cat.name);
            return normalized === 'babygear';
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

// Get subcategories for a parent category
export const getSubcategories = (parentCategoryId) => {
    const subcategories = {
        babygear: [
            { id: 'babywalker', name: 'Baby Walker', icon: '🚼', firebaseCategoryId: 'walkers' },
            { id: 'highchair', name: 'High Chair', icon: '🪑', firebaseCategoryId: 'highchair' },
            { id: 'pottytrainer', name: 'Potty Trainer', icon: '🚽', firebaseCategoryId: 'pottytrainer' }
        ],
        clothing: [
            { id: 'boy', name: 'Boy', icon: '👦', firebaseCategoryId: 'clothing' },
            { id: 'girl', name: 'Girl', icon: '👧', firebaseCategoryId: 'clothing' }
        ]
    };
    
    const normalized = parentCategoryId?.toLowerCase().replace(/\s+/g, '') || '';
    return subcategories[normalized] || [];
};
