import { useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { 
  TrendingUp, 
  ShoppingBag, 
  Globe, 
  MapPin, 
  Percent, 
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Cell
} from 'recharts';

interface DashboardViewProps {
  products?: Product[];
}

export default function DashboardView({ products = MOCK_PRODUCTS }: DashboardViewProps) {
  
  // 1. Calculations
  const stats = useMemo(() => {
    const totalCount = products.length;
    
    // Unique countries
    const countries = Array.from(new Set(products.map(p => p.country)));
    
    // Unique markets
    const markets = Array.from(new Set(products.map(p => p.market)));
    
    // Average price
    const sumCurrentPrice = products.reduce((acc, p) => acc + p.currentPrice, 0);
    const avgPrice = totalCount > 0 ? sumCurrentPrice / totalCount : 0;
    
    // Average last month price
    const sumLastMonthPrice = products.reduce((acc, p) => acc + p.lastMonthPrice, 0);
    const avgLastMonthPrice = totalCount > 0 ? sumLastMonthPrice / totalCount : 0;
    
    // Monthly Inflation
    const monthlyInflation = avgLastMonthPrice > 0 
      ? ((avgPrice - avgLastMonthPrice) / avgLastMonthPrice) * 100 
      : 0;

    // Average savings: difference between highest and lowest prices of same products
    // We group products by their root name (like 'Organic Vine Tomatoes (1kg)') and find min/max
    const groupedByName: { [key: string]: number[] } = {};
    products.forEach(p => {
      // clean name slightly
      const normalized = p.name.trim();
      if (!groupedByName[normalized]) groupedByName[normalized] = [];
      groupedByName[normalized].push(p.currentPrice);
    });

    let totalPotentialSavings = 0;
    let productsWithAlternatives = 0;
    
    Object.values(groupedByName).forEach(prices => {
      if (prices.length > 1) {
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        totalPotentialSavings += (max - min);
        productsWithAlternatives++;
      }
    });

    const avgSavings = productsWithAlternatives > 0 ? totalPotentialSavings / productsWithAlternatives : 1.15;

    return {
      totalProducts: totalCount,
      avgPrice,
      monthlyInflation,
      avgSavings,
      marketsCount: markets.length,
      countriesCount: countries.length
    };
  }, [products]);

  // 2. Chart: Monthly Price Trends (using 12-month average price points)
  const monthlyTrendsData = useMemo(() => {
    const months = [
      '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
      '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
    ];

    return months.map(m => {
      let sum = 0;
      let count = 0;
      products.forEach(p => {
        const point = p.history.find(h => h.date === m);
        if (point) {
          sum += point.price;
          count++;
        }
      });
      return {
        month: m.replace('2025-', 'Jul-').replace('2026-', 'Jan-'),
        'Average Price ($)': count > 0 ? parseFloat((sum / count).toFixed(2)) : 0
      };
    });
  }, [products]);

  // 3. Chart: Category-wise Average Prices
  const categoryChartData = useMemo(() => {
    const catMap: { [key: string]: { sum: number; count: number } } = {};
    products.forEach(p => {
      if (!catMap[p.category]) {
        catMap[p.category] = { sum: 0, count: 0 };
      }
      catMap[p.category].sum += p.currentPrice;
      catMap[p.category].count++;
    });

    return Object.keys(catMap).map(cat => ({
      category: cat,
      'Average Price ($)': parseFloat((catMap[cat].sum / catMap[cat].count).toFixed(2))
    })).sort((a, b) => b['Average Price ($)'] - a['Average Price ($)']);
  }, [products]);

  // 4. Chart: Cheapest Markets (average price per market)
  const marketChartData = useMemo(() => {
    const marketMap: { [key: string]: { sum: number; count: number } } = {};
    products.forEach(p => {
      if (!marketMap[p.market]) {
        marketMap[p.market] = { sum: 0, count: 0 };
      }
      marketMap[p.market].sum += p.currentPrice;
      marketMap[p.market].count++;
    });

    return Object.keys(marketMap).map(m => ({
      market: m,
      'Average Price ($)': parseFloat((marketMap[m].sum / marketMap[m].count).toFixed(2))
    })).sort((a, b) => a['Average Price ($)'] - b['Average Price ($)']);
  }, [products]);

  // 5. Chart: Price Distribution Histograms
  const priceDistributionData = useMemo(() => {
    let bracketA = 0; // $0 - $3
    let bracketB = 0; // $3 - $6
    let bracketC = 0; // $6 - $10
    let bracketD = 0; // $10 - $20
    let bracketE = 0; // $20+

    products.forEach(p => {
      const price = p.currentPrice;
      if (price <= 3) bracketA++;
      else if (price <= 6) bracketB++;
      else if (price <= 10) bracketC++;
      else if (price <= 20) bracketD++;
      else bracketE++;
    });

    return [
      { range: '$0 - $3', 'Products Count': bracketA },
      { range: '$3 - $6', 'Products Count': bracketB },
      { range: '$6 - $10', 'Products Count': bracketC },
      { range: '$10 - $20', 'Products Count': bracketD },
      { range: '$20+', 'Products Count': bracketE }
    ];
  }, [products]);

  // 6. Top 10 Expensive Products
  const topExpensive = useMemo(() => {
    return [...products]
      .sort((a, b) => b.currentPrice - a.currentPrice)
      .slice(0, 10);
  }, [products]);

  const COLORS = ['#166534', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  const darkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-6" id="dashboard-container">
      
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Price Intelligence Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
            Real-time grocery index tracking across countries, categories, and retail chains.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#dcfce7] dark:bg-[#15803d]/20 border border-[#bbf7d0] dark:border-emerald-800/40 px-3.5 py-1.5 rounded-xl self-start shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-xs font-bold text-[#166534] dark:text-[#86efac] font-mono">BIGQUERY DATA ACTIVE</span>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Total Products */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-total-products">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="p-1.5 bg-[#f0f4f2] dark:bg-[#15803d]/20 text-[#166534] dark:text-emerald-400 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-[#166534] dark:text-[#86efac] font-sans">{stats.totalProducts}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Sourced items</p>
          </div>
        </div>

        {/* Card 2: Average Grocery Price */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-avg-price">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Price</span>
            <div className="p-1.5 bg-[#f0f4f2] dark:bg-[#15803d]/20 text-[#166534] dark:text-emerald-400 rounded-lg">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-[#166534] dark:text-[#86efac] font-sans">${stats.avgPrice.toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Per standardized unit</p>
          </div>
        </div>

        {/* Card 3: Monthly Inflation */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-inflation">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MoM Inflation</span>
            <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Percent className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-extrabold tracking-tight text-[#dc2626] dark:text-red-400 font-sans">
                {stats.monthlyInflation >= 0 ? '+' : ''}{stats.monthlyInflation.toFixed(2)}%
              </p>
              {stats.monthlyInflation >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-[#dc2626] shrink-0 self-center" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-emerald-500 shrink-0 self-center" />
              )}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Vs. previous month</p>
          </div>
        </div>

        {/* Card 4: Average Savings */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-savings">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Savings</span>
            <div className="p-1.5 bg-[#f0f4f2] dark:bg-[#15803d]/20 text-[#16a34a] dark:text-[#86efac] rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-[#16a34a] dark:text-[#86efac] font-sans">${stats.avgSavings.toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">By store optimization</p>
          </div>
        </div>

        {/* Card 5: Number of Markets */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-markets">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Markets</span>
            <div className="p-1.5 bg-[#f0f4f2] dark:bg-[#15803d]/20 text-[#166534] dark:text-emerald-400 rounded-lg">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-[#166534] dark:text-[#86efac] font-sans">{stats.marketsCount}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Retailer chains</p>
          </div>
        </div>

        {/* Card 6: Number of Countries */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" id="stat-countries">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Countries</span>
            <div className="p-1.5 bg-[#f0f4f2] dark:bg-[#15803d]/20 text-[#166534] dark:text-emerald-400 rounded-lg">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-[#166534] dark:text-[#86efac] font-sans">{stats.countriesCount}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Geographic regions</p>
          </div>
        </div>

      </div>

      {/* Master Bento Grid of Charts & AI Advisor Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Monthly Price Trends (Line Chart) - Spans 2 columns */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 lg:col-span-2" id="chart-monthly-trends">
          <div>
            <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              12-Month Grocery Index Trend
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={darkMode ? 0.15 : 0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#166534', border: 'none', borderRadius: '12px', padding: '10px' }} 
                  labelStyle={{ color: '#dcfce7', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Average Price ($)" 
                  stroke="#166534" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#166534' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: AI Advisor Weekly Insight (Glowing Spec-matching Card) - Spans 1 column */}
        <div className="border-2 border-[#22c55e] bg-gradient-to-br from-[#f0fdf4] to-white dark:from-[#0d2214] dark:to-[#121c15] p-5 rounded-2xl relative flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-200 lg:col-span-1 min-h-[340px]" id="advisor-weekly-insight-card">
          <span className="absolute top-4 right-4 bg-[#22c55e] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full tracking-wider uppercase">
            AI Advisor
          </span>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              Weekly Insight
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-emerald-100/90 leading-relaxed pt-2">
              Tomato and green vegetable prices in the <b>Central Region</b> are at a 6-month low due to strong seasonal agricultural yields. We highly recommend stocking up on essentials this week. Overall inflation index charts suggest a potential <b>+2.8%</b> price elevation starting late next month.
            </p>

            <div className="bg-[#dcfce7] dark:bg-[#15803d]/30 border border-[#bbf7d0]/60 dark:border-emerald-800/40 rounded-xl p-3 text-[11px] font-semibold text-[#166534] dark:text-emerald-300 leading-relaxed">
              💡 <b>Smart Saving Strategy</b>: Buying bulk rice and frozen foods today safeguards against upcoming freight diesel rate spikes.
            </div>
          </div>

          <div className="mt-4 pt-2">
            <button
              onClick={() => {
                const navBtn = document.getElementById('nav-tab-advisor');
                if (navBtn) navBtn.click();
              }}
              className="w-full text-center py-2.5 px-4 bg-[#166534] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-800/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ask AI Advisor for recipes & tips →</span>
            </button>
          </div>
        </div>

        {/* Chart 3: Category Price Distribution - Spans 1 column */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 lg:col-span-1" id="chart-category-prices">
          <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Category Price Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={darkMode ? 0.15 : 0.5} />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#166534', border: 'none', borderRadius: '12px', padding: '10px' }} 
                  labelStyle={{ color: '#dcfce7', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                />
                <Bar dataKey="Average Price ($)" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Market Index Comparison - Spans 1 column */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 lg:col-span-1" id="chart-cheapest-markets">
          <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Market Index Comparison
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketChartData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={darkMode ? 0.15 : 0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="market" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#166534', border: 'none', borderRadius: '12px', padding: '10px' }} 
                  labelStyle={{ color: '#dcfce7', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                />
                <Bar dataKey="Average Price ($)" fill="#059669" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Price Distribution Histograms - Spans 1 column */}
        <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 lg:col-span-1" id="chart-price-distribution">
          <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            Volume by Price Bracket
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={darkMode ? 0.15 : 0.5} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#166534', border: 'none', borderRadius: '12px', padding: '10px' }} 
                  labelStyle={{ color: '#dcfce7', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="Products Count" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 10 Expensive Products list / table */}
      <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 p-6 shadow-sm hover:shadow-md transition-all" id="expensive-products-list">
        <h3 className="text-sm font-bold text-[#166534] dark:text-[#86efac] mb-4">Top 10 Highest Price Products Sourced</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/20">
              {topExpensive.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-emerald-950/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-950 dark:text-slate-100">{prod.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f0f4f2] dark:bg-emerald-950/50 text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-800/20">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-emerald-200/80">{prod.market}</td>
                  <td className="py-3 px-4">{prod.country}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${prod.currentPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                      prod.trend === 'increasing' 
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30' 
                        : prod.trend === 'decreasing'
                          ? 'bg-[#f0fdf4] text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30'
                          : 'bg-slate-50 text-slate-600 dark:bg-slate-950/20 dark:text-slate-400'
                    }`}>
                      {prod.trend === 'increasing' ? 'Increasing' : prod.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
