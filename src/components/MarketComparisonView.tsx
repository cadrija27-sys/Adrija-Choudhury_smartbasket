import { useState, useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { GitCompare, CheckCircle2, ChevronRight, Landmark, ArrowLeftRight, HelpCircle } from 'lucide-react';

interface MarketComparisonViewProps {
  products?: Product[];
}

export default function MarketComparisonView({ products = MOCK_PRODUCTS }: MarketComparisonViewProps) {
  // Extract all unique markets available in the database
  const availableMarkets = useMemo(() => {
    return Array.from(new Set(products.map(p => p.market)));
  }, [products]);

  // Default to comparing the first two markets
  const [marketA, setMarketA] = useState(availableMarkets[0] || 'FreshMart');
  const [marketB, setMarketB] = useState(availableMarkets[1] || 'SuperSaver');

  // Pair products by name that are found in both Market A and Market B
  const comparisons = useMemo(() => {
    const listA = products.filter(p => p.market === marketA);
    const listB = products.filter(p => p.market === marketB);

    const results: {
      productName: string;
      category: string;
      priceA: number;
      priceB: number;
      difference: number;
      percentage: number;
      cheapest: string;
    }[] = [];

    listA.forEach(prodA => {
      // Find matching item in list B by name
      const prodB = listB.find(p => p.name === prodA.name);
      if (prodB) {
        const diff = prodA.currentPrice - prodB.currentPrice;
        const pct = prodA.currentPrice > 0 ? (diff / prodA.currentPrice) * 100 : 0;
        let cheapest = 'Equal';
        if (prodA.currentPrice < prodB.currentPrice) {
          cheapest = marketA;
        } else if (prodB.currentPrice < prodA.currentPrice) {
          cheapest = marketB;
        }

        results.push({
          productName: prodA.name,
          category: prodA.category,
          priceA: prodA.currentPrice,
          priceB: prodB.currentPrice,
          difference: parseFloat(Math.abs(diff).toFixed(2)),
          percentage: parseFloat(Math.abs(pct).toFixed(1)),
          cheapest
        });
      }
    });

    return results;
  }, [products, marketA, marketB]);

  // Overall calculations
  const summary = useMemo(() => {
    if (comparisons.length === 0) return null;

    let totalA = 0;
    let totalB = 0;
    let countAIsCheaper = 0;
    let countBIsCheaper = 0;

    comparisons.forEach(c => {
      totalA += c.priceA;
      totalB += c.priceB;
      if (c.cheapest === marketA) countAIsCheaper++;
      if (c.cheapest === marketB) countBIsCheaper++;
    });

    const difference = Math.abs(totalA - totalB);
    const percentage = totalA > 0 ? (difference / totalA) * 100 : 0;
    const cheapestMarket = totalA < totalB ? marketA : marketB;
    const averageSavings = totalA > 0 ? difference : 0;

    return {
      totalA,
      totalB,
      difference,
      percentage,
      cheapestMarket,
      countAIsCheaper,
      countBIsCheaper,
      savings: difference
    };
  }, [comparisons, marketA, marketB]);

  return (
    <div className="space-y-6" id="market-comparison-container">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Store Price Competitiveness Audit</h2>
        <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
          Compare item inventories side-by-side to find the most cost-effective retailer for your shopping list.
        </p>
      </div>

      {/* Selectors Panel */}
      <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        
        {/* Selector A */}
        <div className="w-full sm:flex-1 space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Retail Market A</label>
          <div className="relative">
            <select
              value={marketA}
              onChange={(e) => setMarketA(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-[#121c15]/50"
              id="market-select-a"
            >
              {availableMarkets.map(m => (
                <option key={m} value={m} disabled={m === marketB}>{m}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 font-bold font-mono">
              A
            </span>
          </div>
        </div>

        {/* Transfer Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0c130f] text-slate-400 border border-slate-200/30 dark:border-emerald-900/20 shadow-sm">
          <ArrowLeftRight className="h-5 w-5 text-[#166534] dark:text-emerald-400" />
        </div>

        {/* Selector B */}
        <div className="w-full sm:flex-1 space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Retail Market B</label>
          <div className="relative">
            <select
              value={marketB}
              onChange={(e) => setMarketB(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-[#121c15]/50"
              id="market-select-b"
            >
              {availableMarkets.map(m => (
                <option key={m} value={m} disabled={m === marketA}>{m}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-500 font-bold font-mono">
              B
            </span>
          </div>
        </div>

      </div>

      {/* Comparisons Content */}
      {comparisons.length === 0 ? (
        <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 p-12 text-center shadow-sm animate-fade-in">
          <HelpCircle className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No overlapping products found</p>
          <p className="text-xs text-slate-400 mt-1">
            Choose a different pair of markets or check if items share exact names.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Audit Card */}
          {summary && (
            <div className="bg-gradient-to-r from-[#166534] to-[#22c55e] rounded-2xl p-6 text-white shadow-md shadow-emerald-800/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-fade-in">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#dcfce7] bg-white/10 px-2.5 py-1 rounded-full">
                  Competitive Audit
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight mt-3">
                  {summary.cheapestMarket} is cheaper!
                </h3>
                <p className="text-sm text-emerald-100 mt-1 font-medium">
                  Overall basket cost is lower by **{summary.percentage.toFixed(1)}%** compared to alternatives.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-l border-white/20 pl-6">
                <div>
                  <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Basket Total ({marketA})</p>
                  <p className="text-xl font-extrabold font-mono mt-0.5">${summary.totalA.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Basket Total ({marketB})</p>
                  <p className="text-xl font-extrabold font-mono mt-0.5">${summary.totalB.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4.5 text-center border border-white/10">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Estimated Savings</p>
                <p className="text-3xl font-black font-mono mt-1">${summary.savings.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-100 mt-1 font-medium">By shopping at {summary.cheapestMarket}</p>
              </div>
            </div>
          )}

          {/* Side-by-Side Product Table */}
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200/60 dark:border-emerald-900/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matching Inventory Catalog</h3>
              <span className="text-[10px] font-bold bg-[#f0f4f2] dark:bg-emerald-950/50 text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-800/20 px-2 py-0.5 rounded-full font-mono">
                {comparisons.length} MATCHING ITEMS
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                <thead>
                  <tr className="border-b border-slate-200/40 dark:border-emerald-950/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">{marketA} Price</th>
                    <th className="py-3 px-4 text-right">{marketB} Price</th>
                    <th className="py-3 px-4 text-right">Price Diff</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                    <th className="py-3 px-4 text-center">Cheaper Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/20">
                  {comparisons.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-emerald-950/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-100">{c.productName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4f2] dark:bg-[#0c130f] text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-900/10">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">${c.priceA.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">${c.priceB.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-500 font-semibold">
                        {c.difference === 0 ? '-' : `$${c.difference.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 font-medium">
                        {c.percentage === 0 ? '-' : `${c.percentage}%`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          c.cheapest === 'Equal'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : c.cheapest === marketA
                              ? 'bg-[#f0fdf4] text-[#166534] dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/10'
                              : 'bg-[#f0fdf4] text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-200/10'
                        }`}>
                          {c.cheapest}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
