import { useState, useMemo } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { FileSpreadsheet, FileText, Download, Printer, Settings, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

interface ReportsViewProps {
  products?: Product[];
}

export default function ReportsView({ products = MOCK_PRODUCTS }: ReportsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const markets = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.market)))], [products]);

  // Filtered dataset for report
  const reportData = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchMarket = selectedMarket === 'All' || p.market === selectedMarket;
      return matchCat && matchMarket;
    });
  }, [products, selectedCategory, selectedMarket]);

  // Calculations
  const stats = useMemo(() => {
    if (reportData.length === 0) return null;
    const avgPrice = reportData.reduce((acc, p) => acc + p.currentPrice, 0) / reportData.length;
    const maxPrice = Math.max(...reportData.map(p => p.currentPrice));
    const minPrice = Math.min(...reportData.map(p => p.currentPrice));
    
    return {
      count: reportData.length,
      avgPrice,
      maxPrice,
      minPrice
    };
  }, [reportData]);

  // CSV Export
  const handleExportCSV = () => {
    const formatted = reportData.map(p => ({
      'Product Name': p.name,
      'Category': p.category,
      'Market': p.market,
      'Country': p.country,
      'Current Price ($)': p.currentPrice,
      'Last Month Price ($)': p.lastMonthPrice,
      'Average Price ($)': p.averagePrice,
      'Min Price ($)': p.minPrice,
      'Max Price ($)': p.maxPrice,
      'Trend direction': p.trend,
      'Model Confidence (%)': p.confidence
    }));

    const csv = Papa.unparse(formatted);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartBasket_AI_Report_${selectedCategory}_${selectedMarket}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setReportFeedback('CSV Report compiled and downloaded successfully!');
    setTimeout(() => setReportFeedback(null), 3000);
  };

  // PDF Export using Print stylesheets
  const handleExportPDF = () => {
    setReportFeedback('Preparing browser print-PDF layouts...');
    setTimeout(() => {
      window.print();
      setReportFeedback(null);
    }, 1000);
  };

  return (
    <div className="space-y-6" id="reports-view-container">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reports & Export Centre</h2>
          <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
            Export structural indexes, download grocery audit catalogs, or print high-fidelity PDF summaries.
          </p>
        </div>
      </div>

      {reportFeedback && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-850 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 print:hidden animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
          <span>{reportFeedback}</span>
        </div>
      )}

      {/* Scope Selectors (Hidden on print) */}
      <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end print:hidden">
        
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Report Category Scope</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-slate-300 dark:focus:border-[#10b981]"
            id="report-cat-select"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Retail Market Scope</label>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-700 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-slate-300 dark:focus:border-[#10b981]"
            id="report-market-select"
          >
            {markets.map(m => (
              <option key={m} value={m}>{m === 'All' ? 'All Markets' : m}</option>
            ))}
          </select>
        </div>

        {/* Export CSV button */}
        <button
          onClick={handleExportCSV}
          id="btn-export-csv"
          className="w-full flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-emerald-800/10 transition-all hover:shadow-emerald-850/20 active:scale-[0.98] cursor-pointer"
        >
          <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-200" />
          <span>Export CSV Report</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={handleExportPDF}
          id="btn-export-pdf"
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#121c15] border border-slate-200/80 dark:border-emerald-900/30 text-slate-700 dark:text-emerald-300 font-bold py-3 rounded-xl text-xs shadow-md shadow-slate-900/10 transition-all active:scale-[0.98] hover:bg-[#f0f4f2]/40 dark:hover:bg-[#15803d]/10 cursor-pointer"
        >
          <Printer className="h-4.5 w-4.5 text-[#166534] dark:text-emerald-400" />
          <span>Print / Export PDF</span>
        </button>

      </div>

      {/* Structured Report Printable Node */}
      <div className="bg-white dark:bg-[#121c15] rounded-3xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm p-8 space-y-6 print:border-none print:shadow-none" id="printable-report-node">
        
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/60 dark:border-emerald-900/30 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#166534] dark:text-emerald-400 font-extrabold text-xs uppercase tracking-widest font-mono">
              <Settings className="h-4 w-4 animate-spin text-[#166534] dark:text-emerald-400" />
              SmartBasket AI Audit Report
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">Grocery Price Intelligence Audit</h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-[#0c130f] border border-slate-200/40 dark:border-emerald-900/20 px-3 py-1.5 rounded-lg">
              Scope: {selectedCategory} / {selectedMarket}
            </span>
          </div>
        </div>

        {/* Report Stats Summary Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 bg-[#f0f4f2]/40 dark:bg-[#0c130f] rounded-2xl border border-slate-200/60 dark:border-emerald-900/10 p-4">
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Commodities Sourced</p>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{stats.count}</p>
            </div>
            <div className="text-center md:text-left border-l border-slate-200/40 dark:border-emerald-900/20 pl-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Price</p>
              <p className="text-2xl font-black font-mono text-[#16a34a] dark:text-emerald-400 mt-1">${stats.avgPrice.toFixed(2)}</p>
            </div>
            <div className="text-center md:text-left border-l border-slate-200/40 dark:border-emerald-900/20 pl-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lowest Price</p>
              <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">${stats.minPrice.toFixed(2)}</p>
            </div>
            <div className="text-center md:text-left border-l border-slate-200/40 dark:border-emerald-900/20 pl-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Highest Price</p>
              <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">${stats.maxPrice.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Report Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-emerald-900/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Commodity Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4 text-right">Last Month</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-center">Trend Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/20">
              {reportData.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#0c130f]/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{prod.name}</td>
                  <td className="py-3 px-4 font-medium">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4f2] dark:bg-[#0c130f] text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-900/10">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{prod.market}</td>
                  <td className="py-3 px-4 text-right font-mono">${prod.lastMonthPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${prod.currentPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      prod.trend === 'increasing' 
                        ? 'text-red-500 font-extrabold' 
                        : prod.trend === 'decreasing'
                          ? 'text-[#16a34a] dark:text-[#22c55e] font-extrabold'
                          : 'text-slate-400'
                    }`}>
                      {prod.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclosure Panel */}
        <div className="border-t border-slate-200/60 dark:border-emerald-900/30 pt-6 text-[10px] text-slate-400 leading-relaxed font-semibold">
          **Disclaimer**: This predictive report is formulated by the SmartBasket Retail Prophet algorithms. Historical listings are subject to local merchant deviations. To automate continuous sync direct to live corporate pricing indices, connect to active Google BigQuery cloud instances in active workspace panels.
        </div>

      </div>

    </div>
  );
}
