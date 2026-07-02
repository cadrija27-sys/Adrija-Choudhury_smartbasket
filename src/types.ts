export type PriceTrend = 'increasing' | 'stable' | 'decreasing';

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  lastMonthPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  country: string;
  market: string;
  trend: PriceTrend;
  confidence: number; // 0 to 100
  history: PricePoint[];
}

export interface MarketComparisonResult {
  productName: string;
  category: string;
  marketAPrice: number;
  marketBPrice: number;
  difference: number;
  percentage: number;
  cheapest: 'Market A' | 'Market B' | 'Equal';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WeeklyPlan {
  budget: number;
  familySize: number;
  items: {
    product: Product;
    quantity: number;
    estimatedCost: number;
    recommendedMarket: string;
    savings: number;
  }[];
  totalCost: number;
  totalSavings: number;
}
