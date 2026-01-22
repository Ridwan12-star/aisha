# Aisha's Shop - React E-commerce

A beautiful, modern e-commerce website for children's products built with React and Vite.

## Features

- 🛍️ **Product Categories**: Kids Clothing, Nightwear, Toys, Walkers & Gear
- 🛒 **Shopping Cart**: Full cart functionality with quantity controls
- 💬 **WhatsApp Integration**: Checkout directly via WhatsApp
- 📱 **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- ✨ **Modern UI**: Vibrant colors, smooth animations, and kid-friendly design
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd aishas-shop-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Project Structure

```
aishas-shop-react/
├── src/
│   ├── components/       # React components
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Categories.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Cart.jsx
│   │   └── Footer.jsx
│   ├── context/          # React Context for state management
│   │   └── CartContext.jsx
│   ├── data/             # Product data
│   │   └── productsData.js
│   ├── styles/           # CSS styles
│   │   └── index.css
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with custom properties
- **Context API** - State management

## Customization

### Update WhatsApp Number

Edit the WhatsApp number in:
- `src/components/Cart.jsx` (line 17)
- `src/components/Footer.jsx` (line 14)

Replace `2348012345678` with your actual WhatsApp number.

### Add Products

Edit `src/data/productsData.js` to add, remove, or modify products and categories.

### Styling

All styles are in `src/styles/index.css`. The design system uses CSS custom properties (variables) for easy customization.

## License

© 2026 Aisha's Shop. All rights reserved.
