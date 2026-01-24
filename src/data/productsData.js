// ===================================
// AISHA'S SHOP - PRODUCT DATA
// ===================================

import pottyGreen from '../assets/products/potty-trainer-green.jpg';
import pottyGray from '../assets/products/potty-trainer-gray.jpg';
import pottyPink from '../assets/products/potty-trainer-pink.jpg';
import pottyBlue from '../assets/products/potty-trainer-blue.jpg';
import pottyYellowBlue from '../assets/products/potty-trainer-yellow-blue.jpg';
import sleepBunny1 from '../assets/products/sleepwear-bunny-1.jpg';
import sleepStrawberryLarge from '../assets/products/sleepwear-strawberry-large.jpg';
import sleepBunny2 from '../assets/products/sleepwear-bunny-2.jpg';
import sleepStrawberrySmall from '../assets/products/sleepwear-strawberry-small.jpg';
import sleepStrawberryAllover from '../assets/products/sleepwear-strawberry-allover.jpg';

import lunchUnicorn from '../assets/products/lunch-bag-unicorn.jpg';
import lunchRacecar from '../assets/products/lunch-bag-racecar.jpg';
import lunchFairy from '../assets/products/lunch-bag-fairy.jpg';
import lunchAirplane from '../assets/products/lunch-bag-airplane.jpg';
import lunchCat from '../assets/products/lunch-bag-cat.jpg';

import lunchBox1 from '../assets/products/lunch-box-beige-1.jpg';
import lunchBox2 from '../assets/products/lunch-box-beige-2.jpg';
import lunchBox3 from '../assets/products/lunch-box-beige-3.jpg';
import lunchBox4 from '../assets/products/lunch-box-beige-4.jpg';

import feedingSetBeige from '../assets/products/feeding-set-beige.jpg';
import feedingSetDarkPink from '../assets/products/feeding-set-dark-pink.jpg';
import feedingSetDarkBlue from '../assets/products/feeding-set-dark-blue.jpg';
import feedingSetSmokeGrey from '../assets/products/feeding-set-smoke-grey.jpg';



import waterBottleCharacters from '../assets/products/water-bottle-characters.jpg';
import waterBottleAntlers from '../assets/products/water-bottle-antlers.jpg';

import highChairBeige from '../assets/products/highchair-beige.jpg';
import highChairDarkGrey from '../assets/products/highchair-dark-grey.jpg';
import highChairLightGrey from '../assets/products/highchair-light-grey.jpg';

export const products = [
    // SLEEPWEAR CATEGORY
    {
        id: 7,
        name: "Cozy Bunny Sleep Set",
        category: "sleepwear",
        price: 85,
        description: "Soft pink sleepwear with cute bunny design",
        image: sleepBunny1,
        icon: "🐰",
        variants: [
            { name: "Design 1", image: sleepBunny1 },
            { name: "Design 2", image: sleepBunny2 }
        ]
    },
    {
        id: 8,
        name: "Sweet Strawberry Sleep Set",
        category: "sleepwear",
        price: 85,
        description: "Comfortable pink sleepwear with strawberry patterns",
        icon: "🍓",
        variants: [
            { name: "Large Strawberry", image: sleepStrawberryLarge },
            { name: "Small Strawberries", image: sleepStrawberrySmall },
            { name: "Allover Pattern", image: sleepStrawberryAllover }
        ]
    },

    // POTTY TRAINER CATEGORY
    {
        id: 29,
        name: "Potty Training Ladder",
        category: "pottytrainer",
        price: 350,
        description: "Adjustable potty training seat with step stool ladder",
        icon: "🚽",
        variants: [
            { name: "Green", image: pottyGreen },
            { name: "Gray", image: pottyGray },
            { name: "Pink", image: pottyPink },
            { name: "Blue", image: pottyBlue },
            { name: "Blue/Yellow", image: pottyYellowBlue }
        ]
    },

    // HIGH CHAIR CATEGORY
    {
        id: 32,
        name: "Adjustable High Chair",
        category: "highchair",
        price: 450,
        description: "Premium foldable high chair with adjustable height and tray",
        icon: "🪑",
        variants: [
            { name: "Beige", image: highChairBeige },
            { name: "Dark Grey", image: highChairDarkGrey },
            { name: "Light Grey", image: highChairLightGrey }
        ]
    },

    // FEEDING PRODUCTS CATEGORY
    {
        id: 43,
        name: "Insulated Lunch Bag",
        category: "feeding",
        price: 150,
        description: "Thermal insulation lunch bag with various fun designs",
        icon: "🍱",
        variants: [
            { name: "Unicorn", image: lunchUnicorn },
            { name: "Race Car", image: lunchRacecar },
            { name: "Fairy", image: lunchFairy },
            { name: "Airplane", image: lunchAirplane },
            { name: "Cute Cat", image: lunchCat }
        ]
    },
    {
        id: 48,
        name: "Premium Bento Lunch Box",
        category: "feeding",
        price: 200,
        description: "Stainless steel multi-layer lunch box with cutlery set",
        icon: "🍱",
        variants: [
            { name: "View 1", image: lunchBox1 },
            { name: "View 2", image: lunchBox2 },
            { name: "View 3", image: lunchBox3 },
            { name: "View 4", image: lunchBox4 }
        ]
    },
    {
        id: 49,
        name: "Ultimate Silicone Feeding Set",
        category: "feeding",
        price: 180,
        description: "Complete set with bib, plate, bowl, cup, and cutlery",
        icon: "🥣",
        variants: [
            { name: "Beige", image: feedingSetBeige },
            { name: "Dark Pink", image: feedingSetDarkPink },
            { name: "Smoke Grey", image: feedingSetSmokeGrey },
            { name: "Dark Blue", image: feedingSetDarkBlue }
        ]
    },
    {
        id: 50,
        name: "Kids Water Bottle",
        category: "feeding",
        price: 65,
        description: "Cute and durable water bottles for kids",
        icon: "💧",
        variants: [
            { name: "Character Designs", image: waterBottleCharacters },
            { name: "Antler Designs", image: waterBottleAntlers }
        ]
    }
];

// Category information
export const categories = [
    {
        id: "sleepwear",
        name: "Sleepwear",
        description: "Cozy pajamas for sweet dreams",
        icon: "🌙"
    },
    {
        id: "onesies",
        name: "Onesies",
        description: "Comfortable one-piece outfits",
        icon: "👶"
    },
    {
        id: "toys",
        name: "Toys",
        description: "Fun and educational playthings",
        icon: "🧸"
    },
    {
        id: "walkers",
        name: "Walkers",
        description: "Essential baby equipment",
        icon: "🚼"
    },
    {
        id: "pottytrainer",
        name: "Potty Trainer",
        description: "Training essentials for toddlers",
        icon: "🚽"
    },
    {
        id: "highchair",
        name: "High Chair",
        description: "Safe and comfortable feeding chairs",
        icon: "🪑"
    },
    {
        id: "feeding",
        name: "Feeding Products",
        description: "Essential feeding supplies",
        icon: "🍼"
    }
];
