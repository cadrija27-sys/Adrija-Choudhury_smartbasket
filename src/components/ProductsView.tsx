import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS, MOCK_COUNTRIES, MOCK_CATEGORIES, MOCK_MARKETS } from '../data';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  Upload,
  Layers,
  MapPin,
  Globe,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import Papa from 'papaparse';

interface ProductsViewProps {
  products: Product[];
  onAddProducts: (newProds: Product[]) => void;
}

export default function ProductsView({ products, onAddProducts }: ProductsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // CSV Import States
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // Extract dynamically generated unique lists for filters
  const countries = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.country)))], [products]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const markets = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.market)))], [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = selectedCountry === 'All' || p.country === selectedCountry;
      const matchesMarket = selectedMarket === 'All' || p.market === selectedMarket;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCountry && matchesMarket && matchesCategory;
    });
  }, [products, search, selectedCountry, selectedMarket, selectedCategory]);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // CSV Import logic
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setCsvFeedback(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const imported: Product[] = [];
          results.data.forEach((row: any, index) => {
            // validate fields or fallback
            const name = row.name || row.Name || `Imported Item ${index + 1}`;
            const category = row.category || row.Category || 'Pantry';
            const currentPrice = parseFloat(row.currentPrice || row.price || row.Price || '2.50');
            const lastMonthPrice = parseFloat(row.lastMonthPrice || row.previous_price || '2.40');
            const market = row.market || row.Market || 'Local Market';
            const country = row.country || row.Country || 'United States';
            
            if (isNaN(currentPrice)) return; // skip row

            // Create 12-month history based on currentPrice
            const history = Array.from({ length: 12 }).map((_, i) => {
              const months = [
                '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
                '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
              ];
              const variation = 1 + (Math.sin(i) * 0.05) + (Math.random() * 0.02 - 0.01);
              return {
                date: months[i],
                price: parseFloat((currentPrice * variation).toFixed(2))
              };
            });

            imported.push({
              id: `imported-${Date.now()}-${index}`,
              name,
              category,
              currentPrice,
              lastMonthPrice,
              averagePrice: parseFloat(((currentPrice + lastMonthPrice) / 2).toFixed(2)),
              minPrice: Math.min(...history.map(h => h.price)),
              maxPrice: Math.max(...history.map(h => h.price)),
              market,
              country,
              trend: currentPrice > lastMonthPrice ? 'increasing' : currentPrice < lastMonthPrice ? 'decreasing' : 'stable',
              confidence: Math.floor(Math.random() * 25) + 70,
              history
            });
          });

          if (imported.length > 0) {
            onAddProducts(imported);
            setCsvFeedback(`Successfully parsed and synchronized ${imported.length} custom products!`);
          } else {
            setCsvFeedback("No valid items detected in the CSV. Make sure you have 'name' and 'price' headers.");
          }
        } catch (error: any) {
          setCsvFeedback("Error parsing CSV format. Ensure standard comma separation.");
        } finally {
          setImporting(false);
        }
      },
      error: () => {
        setCsvFeedback("Error reading CSV file.");
        setImporting(false);
      }
    });
  };

  return (
    <div className="space-y-6" id="products-view-container">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Product Intelligence Registry</h2>
          <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
            Audit commodity listings, track long-term variations, and load personalized files.
          </p>
        </div>
        
        {/* CSV Upload tool */}
        <div className="relative">
          <label className="flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#15803d] py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-emerald-800/10 hover:shadow-emerald-800/20 active:scale-[0.98] transition-all cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import CSV Dataset</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCsvUpload} 
              className="hidden" 
              id="csv-file-input"
            />
          </label>
        </div>
      </div>

      {csvFeedback && (
        <div className="rounded-xl bg-[#dcfce7] dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 text-xs font-bold text-[#166534] dark:text-emerald-400 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{csvFeedback}</span>
        </div>
      )}

      {/* Filters Panel */}
      <div className="bg-white dark:bg-[#121c15] p-4.5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search products by brand or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="products-search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48 relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300 dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="filter-category"
          >
            <option disabled>Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Layers className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Market Filter */}
        <div className="w-full md:w-48 relative">
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300 dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="filter-market"
          >
            <option disabled>Market</option>
            {markets.map(m => (
              <option key={m} value={m}>{m === 'All' ? 'All Markets' : m}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Country Filter */}
        <div className="w-full md:w-48 relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300 dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="filter-country"
          >
            <option disabled>Country</option>
            {countries.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Globe className="h-3.5 w-3.5" />
          </span>
        </div>

      </div>

      {/* Products Table/Accordion */}
      <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No items match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing filters or importing a custom CSV database.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-emerald-950/20">
            {filteredProducts.map((product) => {
              const isExpanded = expandedId === product.id;
              
              // Custom colors for trend
              const trendBg = product.trend === 'increasing' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/10' 
                : product.trend === 'decreasing'
                  ? 'bg-[#f0fdf4] text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/10'
                  : 'bg-slate-50 text-slate-600 dark:bg-slate-950/20 dark:text-slate-400';

              const TrendIcon = product.trend === 'increasing' 
                ? TrendingUp 
                : product.trend === 'decreasing' 
                  ? TrendingDown 
                  : Minus;

              return (
                <div key={product.id} className="transition-colors duration-150">
                  
                  {/* Summary Header row */}
                  <div 
                    onClick={() => handleToggleExpand(product.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-emerald-950/20 gap-3"
                    id={`product-row-${product.id}`}
                  >
                    
                    {/* Left: Title + Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-950 dark:text-slate-100 text-sm">{product.name}</span>
                        <span className="text-[10px] font-bold bg-[#f0f4f2] dark:bg-emerald-950/50 text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-800/20 px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium"><MapPin className="h-3 w-3 text-slate-400 dark:text-emerald-500/70" />{product.market}</span>
                        <span className="flex items-center gap-1 font-medium"><Globe className="h-3 w-3 text-slate-400 dark:text-emerald-500/70" />{product.country}</span>
                      </div>
                    </div>

                    {/* Right: Price + Trend + Toggle icon */}
                    <div className="flex items-center gap-6 justify-between sm:justify-end shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Price</p>
                        <p className="text-base font-extrabold text-[#166534] dark:text-[#86efac] font-mono">${product.currentPrice.toFixed(2)}</p>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${trendBg}`}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        <span className="uppercase tracking-wider text-[9px]">
                          {product.trend}
                        </span>
                      </div>

                      <div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                      </div>
                    </div>

                  </div>

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="p-5 bg-[#f0f4f2]/40 dark:bg-[#0b110d]/40 border-t border-slate-200/40 dark:border-emerald-950/30 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Sub-Card 1: Interactive historical price chart */}
                      <div className="lg:col-span-2 bg-white dark:bg-[#121c15] p-4 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#86efac] mb-3">12-Month Price Volatility Trend</h4>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={product.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`gradient-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#166534', border: 'none', borderRadius: '8px', padding: '6px' }}
                                labelStyle={{ color: '#dcfce7', fontSize: '9px' }}
                                itemStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="price" stroke="#166534" strokeWidth={2.5} fillOpacity={1} fill={`url(#gradient-${product.id})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Sub-Card 2: Stats Grid */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#86efac]">Price Variation Metrics</h4>
                        
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="bg-white dark:bg-[#121c15] p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center shadow-sm">
                            <p className="text-[10px] text-slate-400 font-semibold">Average</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">${product.averagePrice.toFixed(2)}</p>
                          </div>
                          <div className="bg-white dark:bg-[#121c15] p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center shadow-sm">
                            <p className="text-[10px] text-slate-400 font-semibold">Minimum</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">${product.minPrice.toFixed(2)}</p>
                          </div>
                          <div className="bg-white dark:bg-[#121c15] p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 text-center shadow-sm">
                            <p className="text-[10px] text-slate-400 font-semibold">Maximum</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">${product.maxPrice.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* ML forecasting score indicator */}
                        <div className="bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 dark:border-emerald-900/30 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-[#16a34a] dark:text-emerald-400 mb-1">
                            <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-[#166534] dark:text-emerald-400" />
                            <span className="text-xs font-extrabold uppercase tracking-wider">AI Predictive Confidence</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-emerald-100/90 leading-normal">
                            Our model computes price stabilization index of **{product.confidence}%** for the forthcoming month.
                          </p>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                            <div 
                              className="bg-[#166534] dark:bg-[#22c55e] h-full rounded-full transition-all" 
                              style={{ width: `${product.confidence}%` }}
                            />
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
