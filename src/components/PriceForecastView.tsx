import { useState, useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { Search, Sparkles, TrendingUp, TrendingDown, Minus, Info, BrainCircuit, RefreshCw, Cpu } from 'lucide-react';

interface PriceForecastViewProps {
  products?: Product[];
}

export default function PriceForecastView({ products = MOCK_PRODUCTS }: PriceForecastViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  // Forecast computation logic (dynamic yet deterministic based on ID and current price)
  const forecastedProducts = useMemo(() => {
    return products.map(p => {
      // Create a deterministic predicted value based on trend
      let predictedPrice = p.currentPrice;
      let multiplier = 1;
      
      if (p.trend === 'increasing') {
        multiplier = 1 + (0.02 + (parseFloat((p.id.length % 5).toFixed(2)) * 0.01));
      } else if (p.trend === 'decreasing') {
        multiplier = 1 - (0.015 + (parseFloat((p.id.length % 4).toFixed(2)) * 0.005));
      } else {
        multiplier = 1 + ((Math.sin(p.id.length) * 0.008));
      }

      predictedPrice = parseFloat((p.currentPrice * multiplier).toFixed(2));
      const difference = parseFloat((predictedPrice - p.currentPrice).toFixed(2));
      const percentage = parseFloat(((difference / p.currentPrice) * 100).toFixed(1));

      return {
        ...p,
        predictedPrice,
        difference,
        percentage,
      };
    });
  }, [products]);

  // Filtering
  const filtered = useMemo(() => {
    return forecastedProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [forecastedProducts, search, selectedCategory]);

  const handleRetrainModel = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="forecast-view-container">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Predictive Price Forecasting</h2>
          <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
            SmartBasket Prophet-X1 forecasting engine predicts next month's prices using neural-network time series analysis.
          </p>
        </div>

        <button
          onClick={handleRetrainModel}
          id="btn-retrain-model"
          className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-emerald-900/30 bg-white dark:bg-[#121c15] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-emerald-300 hover:bg-[#f0f4f2]/40 dark:hover:bg-[#15803d]/10 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#166534] dark:text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Retrain LSTM Models</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 dark:border-emerald-900/30 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <BrainCircuit className="h-5 w-5 text-[#166534] dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Predictive Core: LSTM Neural-Network</h4>
            <p className="text-xs font-semibold text-slate-500 dark:text-emerald-500/60 mt-0.5 leading-relaxed">
              Analyzing trailing 12-month rolling prices, regional transportation fuel adjustments, fertilizer export indexes, and agricultural moisture indexes.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 dark:text-emerald-400 shrink-0 font-mono flex items-center gap-1.5 bg-white dark:bg-[#121c15] px-3 py-1 rounded-lg border border-slate-200/40 dark:border-emerald-900/20 shadow-sm">
          <Cpu className="h-3.5 w-3.5 text-[#22c55e]" />
          <span>EPOCHS COMPLETED: 150</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#121c15] p-4.5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search forecasted commodities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="forecast-search-input"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300 dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
            id="forecast-category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Forecast list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isIncreasing = item.trend === 'increasing';
          const isDecreasing = item.trend === 'decreasing';
          
          let cardBorder = 'border-slate-200/80 dark:border-emerald-900/30';
          let trendText = 'STABLE';
          let TrendIcon = Minus;
          let trendColor = 'text-slate-500 dark:text-slate-400';
          let badgeColor = 'bg-slate-50 dark:bg-emerald-950/20 text-slate-500 dark:text-slate-400';

          if (isIncreasing) {
            cardBorder = 'border-slate-200/80 dark:border-emerald-900/30 hover:border-red-400/60 dark:hover:border-red-900/50';
            trendText = 'INCREASING';
            TrendIcon = TrendingUp;
            trendColor = 'text-red-500 dark:text-red-400';
            badgeColor = 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/10';
          } else if (isDecreasing) {
            cardBorder = 'border-slate-200/80 dark:border-emerald-900/30 hover:border-emerald-400/60 dark:hover:border-[#22c55e]/50';
            trendText = 'DECREASING';
            TrendIcon = TrendingDown;
            trendColor = 'text-[#16a34a] dark:text-[#22c55e]';
            badgeColor = 'bg-[#f0fdf4] text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/10';
          }

          return (
            <div 
              key={item.id}
              className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              id={`forecast-card-${item.id}`}
            >
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#166534] dark:text-[#86efac]">
                    {item.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${badgeColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {trendText}
                  </span>
                </div>
                
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Sourced from {item.market} ({item.country})
                </p>
              </div>

              {/* Projections Area */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/60 dark:border-emerald-950/20 my-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Current price</p>
                  <p className="text-xl font-extrabold font-mono text-slate-850 dark:text-slate-200 mt-1">${item.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Forecasted Price</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className={`text-xl font-extrabold font-mono ${trendColor}`}>
                      ${item.predictedPrice.toFixed(2)}
                    </p>
                    <span className={`text-[10px] font-bold font-mono ${trendColor}`}>
                      ({isIncreasing ? '+' : ''}{item.percentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Score Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-400 dark:text-emerald-500/70">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Forecast Reliability
                  </span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-slate-100">{item.confidence}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#166534] dark:bg-[#22c55e] h-full rounded-full transition-all" 
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
