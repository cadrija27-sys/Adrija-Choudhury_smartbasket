import { Product } from './types';

// Helper to generate 12 months of price history
function generateHistory(basePrice: number, trend: 'up' | 'down' | 'volatile' | 'stable'): { date: string; price: number }[] {
  const dates = [
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
  ];
  
  let currentPrice = basePrice;
  return dates.map((date, idx) => {
    let factor = 1;
    if (trend === 'up') {
      factor = 1 + (idx * 0.02) + (Math.random() * 0.04 - 0.02);
    } else if (trend === 'down') {
      factor = 1 - (idx * 0.015) + (Math.random() * 0.03 - 0.01);
    } else if (trend === 'volatile') {
      factor = 1 + (Math.sin(idx) * 0.08) + (Math.random() * 0.05 - 0.025);
    } else {
      factor = 1 + (Math.random() * 0.02 - 0.01);
    }
    
    return {
      date,
      price: parseFloat((currentPrice * factor).toFixed(2))
    };
  });
}

export const MOCK_PRODUCTS: Product[] = [
  // United States
  {
    id: 'us-tomatoes-freshmart',
    name: 'Organic Vine Tomatoes (1kg)',
    category: 'Produce',
    currentPrice: 4.89,
    lastMonthPrice: 4.65,
    averagePrice: 4.45,
    minPrice: 3.90,
    maxPrice: 4.95,
    country: 'United States',
    market: 'FreshMart',
    trend: 'increasing',
    confidence: 88,
    history: generateHistory(4.20, 'up')
  },
  {
    id: 'us-tomatoes-supersaver',
    name: 'Organic Vine Tomatoes (1kg)',
    category: 'Produce',
    currentPrice: 3.99,
    lastMonthPrice: 3.95,
    averagePrice: 3.85,
    minPrice: 3.50,
    maxPrice: 4.10,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'stable',
    confidence: 91,
    history: generateHistory(3.80, 'stable')
  },
  {
    id: 'us-milk-freshmart',
    name: 'Whole Milk (1 Gallon)',
    category: 'Dairy & Eggs',
    currentPrice: 3.69,
    lastMonthPrice: 3.75,
    averagePrice: 3.82,
    minPrice: 3.65,
    maxPrice: 4.10,
    country: 'United States',
    market: 'FreshMart',
    trend: 'decreasing',
    confidence: 82,
    history: generateHistory(3.95, 'down')
  },
  {
    id: 'us-milk-supersaver',
    name: 'Whole Milk (1 Gallon)',
    category: 'Dairy & Eggs',
    currentPrice: 3.25,
    lastMonthPrice: 3.30,
    averagePrice: 3.45,
    minPrice: 3.20,
    maxPrice: 3.70,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'decreasing',
    confidence: 85,
    history: generateHistory(3.60, 'down')
  },
  {
    id: 'us-chicken-freshmart',
    name: 'Boneless Chicken Breast (1kg)',
    category: 'Meat & Seafood',
    currentPrice: 9.99,
    lastMonthPrice: 9.45,
    averagePrice: 9.15,
    minPrice: 8.50,
    maxPrice: 10.20,
    country: 'United States',
    market: 'FreshMart',
    trend: 'increasing',
    confidence: 94,
    history: generateHistory(8.80, 'up')
  },
  {
    id: 'us-chicken-supersaver',
    name: 'Boneless Chicken Breast (1kg)',
    category: 'Meat & Seafood',
    currentPrice: 8.49,
    lastMonthPrice: 8.45,
    averagePrice: 8.35,
    minPrice: 7.99,
    maxPrice: 8.80,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'stable',
    confidence: 89,
    history: generateHistory(8.20, 'stable')
  },
  {
    id: 'us-eggs-freshmart',
    name: 'Large Brown Eggs (12-pack)',
    category: 'Dairy & Eggs',
    currentPrice: 4.50,
    lastMonthPrice: 4.20,
    averagePrice: 3.90,
    minPrice: 2.99,
    maxPrice: 4.75,
    country: 'United States',
    market: 'FreshMart',
    trend: 'increasing',
    confidence: 76,
    history: generateHistory(3.50, 'volatile')
  },
  {
    id: 'us-eggs-supersaver',
    name: 'Large Brown Eggs (12-pack)',
    category: 'Dairy & Eggs',
    currentPrice: 3.89,
    lastMonthPrice: 3.75,
    averagePrice: 3.50,
    minPrice: 2.80,
    maxPrice: 4.10,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'increasing',
    confidence: 79,
    history: generateHistory(3.20, 'up')
  },
  {
    id: 'us-bread-freshmart',
    name: 'Sourdough Bread (500g)',
    category: 'Bakery',
    currentPrice: 3.49,
    lastMonthPrice: 3.49,
    averagePrice: 3.35,
    minPrice: 2.99,
    maxPrice: 3.59,
    country: 'United States',
    market: 'FreshMart',
    trend: 'stable',
    confidence: 95,
    history: generateHistory(3.20, 'stable')
  },
  {
    id: 'us-bread-supersaver',
    name: 'Sourdough Bread (500g)',
    category: 'Bakery',
    currentPrice: 2.99,
    lastMonthPrice: 2.95,
    averagePrice: 2.85,
    minPrice: 2.50,
    maxPrice: 3.10,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'stable',
    confidence: 92,
    history: generateHistory(2.75, 'stable')
  },
  {
    id: 'us-coffee-freshmart',
    name: 'Arabica Medium Roast Ground Coffee (340g)',
    category: 'Beverages',
    currentPrice: 8.99,
    lastMonthPrice: 8.75,
    averagePrice: 8.30,
    minPrice: 7.50,
    maxPrice: 9.20,
    country: 'United States',
    market: 'FreshMart',
    trend: 'increasing',
    confidence: 90,
    history: generateHistory(7.90, 'up')
  },
  {
    id: 'us-coffee-supersaver',
    name: 'Arabica Medium Roast Ground Coffee (340g)',
    category: 'Beverages',
    currentPrice: 7.49,
    lastMonthPrice: 7.49,
    averagePrice: 7.20,
    minPrice: 6.80,
    maxPrice: 7.80,
    country: 'United States',
    market: 'SuperSaver',
    trend: 'stable',
    confidence: 88,
    history: generateHistory(7.00, 'stable')
  },

  // United Kingdom
  {
    id: 'uk-tomatoes-tesco',
    name: 'Organic Vine Tomatoes (1kg)',
    category: 'Produce',
    currentPrice: 3.80,
    lastMonthPrice: 3.60,
    averagePrice: 3.40,
    minPrice: 2.90,
    maxPrice: 3.90,
    country: 'United Kingdom',
    market: 'Tesco',
    trend: 'increasing',
    confidence: 85,
    history: generateHistory(3.10, 'up')
  },
  {
    id: 'uk-tomatoes-aldi',
    name: 'Organic Vine Tomatoes (1kg)',
    category: 'Produce',
    currentPrice: 2.99,
    lastMonthPrice: 2.90,
    averagePrice: 2.80,
    minPrice: 2.40,
    maxPrice: 3.10,
    country: 'United Kingdom',
    market: 'Aldi',
    trend: 'stable',
    confidence: 90,
    history: generateHistory(2.70, 'stable')
  },
  {
    id: 'uk-eggs-tesco',
    name: 'Free Range Large Eggs (12-pack)',
    category: 'Dairy & Eggs',
    currentPrice: 3.40,
    lastMonthPrice: 3.20,
    averagePrice: 2.95,
    minPrice: 2.50,
    maxPrice: 3.50,
    country: 'United Kingdom',
    market: 'Tesco',
    trend: 'increasing',
    confidence: 83,
    history: generateHistory(2.70, 'up')
  },
  {
    id: 'uk-eggs-aldi',
    name: 'Free Range Large Eggs (12-pack)',
    category: 'Dairy & Eggs',
    currentPrice: 2.65,
    lastMonthPrice: 2.65,
    averagePrice: 2.50,
    minPrice: 2.10,
    maxPrice: 2.80,
    country: 'United Kingdom',
    market: 'Aldi',
    trend: 'stable',
    confidence: 91,
    history: generateHistory(2.40, 'stable')
  },

  // Germany
  {
    id: 'de-butter-aldi',
    name: 'German Brand Butter (250g)',
    category: 'Dairy & Eggs',
    currentPrice: 2.19,
    lastMonthPrice: 2.39,
    averagePrice: 2.45,
    minPrice: 1.89,
    maxPrice: 2.89,
    country: 'Germany',
    market: 'Aldi',
    trend: 'decreasing',
    confidence: 93,
    history: generateHistory(2.60, 'down')
  },
  {
    id: 'de-butter-rewe',
    name: 'German Brand Butter (250g)',
    category: 'Dairy & Eggs',
    currentPrice: 2.59,
    lastMonthPrice: 2.79,
    averagePrice: 2.85,
    minPrice: 2.29,
    maxPrice: 3.19,
    country: 'Germany',
    market: 'REWE',
    trend: 'decreasing',
    confidence: 89,
    history: generateHistory(2.95, 'down')
  },
  {
    id: 'de-apples-aldi',
    name: 'Elstar Apples (1kg)',
    category: 'Produce',
    currentPrice: 2.29,
    lastMonthPrice: 1.99,
    averagePrice: 2.10,
    minPrice: 1.69,
    maxPrice: 2.49,
    country: 'Germany',
    market: 'Aldi',
    trend: 'increasing',
    confidence: 78,
    history: generateHistory(2.00, 'volatile')
  },
  {
    id: 'de-apples-rewe',
    name: 'Elstar Apples (1kg)',
    category: 'Produce',
    currentPrice: 2.69,
    lastMonthPrice: 2.49,
    averagePrice: 2.50,
    minPrice: 1.99,
    maxPrice: 2.89,
    country: 'Germany',
    market: 'REWE',
    trend: 'increasing',
    confidence: 81,
    history: generateHistory(2.40, 'up')
  },

  // Canada
  {
    id: 'ca-salmon-loblaws',
    name: 'Fresh Atlantic Salmon Fillets (1kg)',
    category: 'Meat & Seafood',
    currentPrice: 24.99,
    lastMonthPrice: 23.50,
    averagePrice: 22.80,
    minPrice: 19.99,
    maxPrice: 26.50,
    country: 'Canada',
    market: 'Loblaws',
    trend: 'increasing',
    confidence: 87,
    history: generateHistory(21.50, 'up')
  },
  {
    id: 'ca-salmon-superstore',
    name: 'Fresh Atlantic Salmon Fillets (1kg)',
    category: 'Meat & Seafood',
    currentPrice: 21.99,
    lastMonthPrice: 21.99,
    averagePrice: 21.20,
    minPrice: 18.50,
    maxPrice: 23.50,
    country: 'Canada',
    market: 'Superstore',
    trend: 'stable',
    confidence: 90,
    history: generateHistory(20.50, 'stable')
  }
];

export const MOCK_MARKETS = [
  { name: 'FreshMart', country: 'United States' },
  { name: 'SuperSaver', country: 'United States' },
  { name: 'Aldi', country: 'United Kingdom' },
  { name: 'Tesco', country: 'United Kingdom' },
  { name: 'Aldi', country: 'Germany' },
  { name: 'REWE', country: 'Germany' },
  { name: 'Loblaws', country: 'Canada' },
  { name: 'Superstore', country: 'Canada' }
];

export const MOCK_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'Canada'
];

export const MOCK_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Bakery',
  'Meat & Seafood',
  'Beverages',
  'Pantry'
];
