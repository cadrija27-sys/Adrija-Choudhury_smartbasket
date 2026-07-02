import React, { useState, useEffect } from 'react';
import { Product, WeeklyPlan } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { 
  Plus, 
  Minus, 
  CircleDollarSign, 
  Users, 
  Sparkles, 
  Save, 
  FolderDown, 
  Store,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { saveUserPlanner, getUserPlanner } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface PlannerViewProps {
  products?: Product[];
  user: FirebaseUser | null;
}

export default function PlannerView({ products = MOCK_PRODUCTS, user }: PlannerViewProps) {
  const [budget, setBudget] = useState<number>(120);
  const [familySize, setFamilySize] = useState<number>(3);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load user saved planner on mount or user change
  useEffect(() => {
    async function loadSaved() {
      if (user) {
        const saved = await getUserPlanner(user.uid);
        if (saved) {
          setBudget(saved.budget || 120);
          setFamilySize(saved.familySize || 3);
          if (saved.items && saved.items.length > 0) {
            // Find corresponding products to restore full object
            const reconstructedItems = saved.items.map((item: any) => {
              const prod = products.find(p => p.id === item.productId) || products[0];
              return {
                product: prod,
                quantity: item.quantity,
                estimatedCost: item.estimatedCost,
                recommendedMarket: item.recommendedMarket,
                savings: item.savings
              };
            });

            setPlan({
              budget: saved.budget,
              familySize: saved.familySize,
              items: reconstructedItems,
              totalCost: saved.totalCost,
              totalSavings: saved.totalSavings
            });
          }
        }
      }
    }
    loadSaved();
  }, [user, products]);

  // Generation algorithm
  const handleGeneratePlan = () => {
    setLoading(true);
    setSaveStatus(null);
    
    setTimeout(() => {
      // Staple product keys/names we want to recommend
      // We look at our product categories and find the cheapest options
      const staples = [
        { key: 'Milk', category: 'Dairy & Eggs', baseQuantity: 1 }, // 1 gallon per family member/week
        { key: 'Eggs', category: 'Dairy & Eggs', baseQuantity: 1 }, // 1 dozen per family member/week
        { key: 'Bread', category: 'Bakery', baseQuantity: 1 }, // 1 loaf per family member/week
        { key: 'Tomatoes', category: 'Produce', baseQuantity: 0.5 }, // 0.5kg per member
        { key: 'Chicken', category: 'Meat & Seafood', baseQuantity: 0.5 }, // 0.5kg per member
        { key: 'Coffee', category: 'Beverages', baseQuantity: 0.3 }
      ];

      const items: WeeklyPlan['items'] = [];
      let totalCost = 0;
      let totalSavings = 0;

      staples.forEach(staple => {
        // Find all products in database that match this item
        const candidates = products.filter(p => 
          p.name.toLowerCase().includes(staple.key.toLowerCase()) ||
          p.category.toLowerCase().includes(staple.key.toLowerCase())
        );

        if (candidates.length === 0) return;

        // Find the absolute cheapest candidate
        const sorted = [...candidates].sort((a, b) => a.currentPrice - b.currentPrice);
        const cheapestProduct = sorted[0];

        // Find the absolute most expensive candidate to calculate potential savings
        const expensiveProduct = sorted[sorted.length - 1];

        // Calculate quantity required based on family size
        const qty = Math.max(1, Math.round(staple.baseQuantity * familySize));
        const estimatedCost = parseFloat((cheapestProduct.currentPrice * qty).toFixed(2));
        
        // Savings = (Expensive - Cheapest) * Qty
        const unitSaving = Math.max(0, expensiveProduct.currentPrice - cheapestProduct.currentPrice);
        const savings = parseFloat((unitSaving * qty).toFixed(2));

        items.push({
          product: cheapestProduct,
          quantity: qty,
          estimatedCost,
          recommendedMarket: cheapestProduct.market,
          savings
        });

        totalCost += estimatedCost;
        totalSavings += savings;
      });

      setPlan({
        budget,
        familySize,
        items,
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalSavings: parseFloat(totalSavings.toFixed(2))
      });
      setLoading(false);
    }, 800);
  };

  // Save to Firebase
  const handleSavePlan = async () => {
    if (!plan) return;
    setSaveStatus('Saving...');
    try {
      const dbFormat = {
        budget: plan.budget,
        familySize: plan.familySize,
        totalCost: plan.totalCost,
        totalSavings: plan.totalSavings,
        items: plan.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          estimatedCost: item.estimatedCost,
          recommendedMarket: item.recommendedMarket,
          savings: item.savings
        }))
      };

      if (user) {
        await saveUserPlanner(user.uid, dbFormat);
        setSaveStatus('Plan synced securely to Firebase Firestore!');
      } else {
        localStorage.setItem('smartbasket_anonymous_planner', JSON.stringify(dbFormat));
        setSaveStatus('Plan cached locally! Log in to sync permanently to your cloud account.');
      }
    } catch (err: any) {
      console.error(err);
      setSaveStatus('Error saving plan.');
    }
  };

  const budgetRatio = plan ? (plan.totalCost / budget) * 100 : 0;
  const isOverBudget = plan ? plan.totalCost > budget : false;

  return (
    <div className="space-y-6" id="planner-view-container">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Weekly Smart Grocery Planner</h2>
          <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
            Generate custom weekly menus optimized across stores to guarantee you never overspend.
          </p>
        </div>
      </div>

      {/* Input panel */}
      <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        {/* Budget Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Weekly Grocery Budget ($)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">
              $
            </span>
            <input
              type="number"
              min="10"
              max="1000"
              value={budget}
              onChange={(e) => setBudget(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-[#10b981] dark:focus:bg-[#121c15]/50"
              id="planner-budget-input"
            />
          </div>
        </div>

        {/* Family Size Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Family Size (People)
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <button 
              onClick={() => setFamilySize(Math.max(1, familySize - 1))}
              className="px-4 py-3 text-slate-500 hover:text-[#166534] dark:hover:text-[#22c55e] cursor-pointer"
              id="planner-family-dec"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex-1 text-center font-extrabold text-slate-900 dark:text-white font-mono text-sm">
              {familySize}
            </span>
            <button 
              onClick={() => setFamilySize(Math.min(10, familySize + 1))}
              className="px-4 py-3 text-slate-500 hover:text-[#166534] dark:hover:text-[#22c55e] cursor-pointer"
              id="planner-family-inc"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          id="btn-generate-planner"
          className="w-full flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-emerald-800/10 hover:shadow-emerald-850/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5 text-emerald-200" />
              <span>Optimize Weekly Basket</span>
            </>
          )}
        </button>

      </div>

      {/* Plan Output Content */}
      {plan && (
        <div className="space-y-6">
          
          {/* Summary Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Box 1: Cost Breakdown */}
            <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Estimated Cost</span>
                <p className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  ${plan.totalCost.toFixed(2)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-emerald-900/20 text-xs flex justify-between items-center text-slate-400">
                <span className="font-semibold">Optimized basket list</span>
                <span className="font-mono bg-[#f0f4f2] dark:bg-emerald-950/40 text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-900/10 px-2 py-0.5 rounded text-[10px] font-bold">
                  {plan.items.length} items
                </span>
              </div>
            </div>

            {/* Box 2: Savings Indicator */}
            <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16a34a] dark:text-emerald-400">Computed Savings</span>
                <p className="text-3xl font-black font-mono text-[#16a34a] dark:text-emerald-400 mt-1">
                  ${plan.totalSavings.toFixed(2)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-emerald-900/20 text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" />
                <span>By sourcing from cheapest stores</span>
              </div>
            </div>

            {/* Box 3: Budget Status Slider */}
            <div className="bg-white dark:bg-[#121c15] p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Budget Utilization</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-3xl font-black font-mono ${isOverBudget ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {budgetRatio.toFixed(0)}%
                  </p>
                  <span className="text-xs text-slate-400 font-semibold">of ${budget} limit</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-transparent dark:border-emerald-900/10">
                  <div 
                    className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-[#166534] dark:bg-[#22c55e]'}`}
                    style={{ width: `${Math.min(100, budgetRatio)}%` }}
                  />
                </div>
                {isOverBudget ? (
                  <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Overallocated! Consider removing high-cost proteins.
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Within target boundaries. Excellent planning!
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Action Row & Save State */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f0f4f2]/40 dark:bg-emerald-950/10 p-4 rounded-xl border border-slate-200/60 dark:border-emerald-900/30">
            <div className="text-xs text-slate-500 dark:text-emerald-500/80 font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-[#166534] dark:text-emerald-400" />
              <span>{user ? 'Changes are automatically synchronized' : 'Anonymous plan'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">
                  {saveStatus}
                </span>
              )}
              <button
                onClick={handleSavePlan}
                id="btn-save-planner"
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#121c15] border border-slate-200/80 dark:border-emerald-900/30 px-4 py-2 text-xs font-bold text-slate-700 dark:text-emerald-300 hover:bg-[#f0f4f2]/40 dark:hover:bg-[#15803d]/10 transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4 text-[#16a34a] dark:text-emerald-400" />
                <span>Save Weekly Planner</span>
              </button>
            </div>
          </div>

          {/* Recommendation Table */}
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200/60 dark:border-emerald-900/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sourcing recommendations</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                <thead>
                  <tr className="border-b border-slate-200/40 dark:border-emerald-950/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4">Recommended Sourcing</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Estimated Cost</th>
                    <th className="py-3 px-4 text-right">Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/20">
                  {plan.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-emerald-950/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-100">{item.product.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4f2] dark:bg-[#0c130f] text-[#166534] dark:text-emerald-400 border border-transparent dark:border-emerald-900/10">
                          {item.product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 py-4.5">
                        <Store className="h-3.5 w-3.5 text-[#166534] dark:text-emerald-400 shrink-0" />
                        <span>{item.recommendedMarket}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">${item.product.currentPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${item.estimatedCost.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-[#22c55e] font-extrabold">
                        {item.savings === 0 ? '-' : `+$${item.savings.toFixed(2)}`}
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
