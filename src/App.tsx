/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { MOCK_PRODUCTS } from './data';
import { Product } from './types';

// View Imports
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import MarketComparisonView from './components/MarketComparisonView';
import PriceForecastView from './components/PriceForecastView';
import PlannerView from './components/PlannerView';
import AdvisorView from './components/AdvisorView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('smartbasket_dark_mode');
    return cached === 'true' || (!cached && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync dark mode class with DOM element for tailwind selectors
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('smartbasket_dark_mode', String(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleImportProducts = (newProds: Product[]) => {
    setProducts(prev => [...newProds, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f2] dark:bg-[#0b110d] text-slate-900 dark:text-slate-100 transition-colors duration-150 flex flex-col md:flex-row">
      
      {/* Navigation panel (Fixed/responsive) */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        mobileOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />

      {/* Main page content layout wrapper */}
      <main className="flex-1 p-4 md:p-8 md:pl-72 max-w-7xl mx-auto w-full transition-all">
        <div className="py-4 md:py-0">
          
          {currentTab === 'dashboard' && <DashboardView products={products} />}
          {currentTab === 'products' && (
            <ProductsView products={products} onAddProducts={handleImportProducts} />
          )}
          {currentTab === 'comparison' && <MarketComparisonView products={products} />}
          {currentTab === 'forecast' && <PriceForecastView products={products} />}
          {currentTab === 'planner' && <PlannerView products={products} user={user} />}
          {currentTab === 'advisor' && <AdvisorView />}
          {currentTab === 'reports' && <ReportsView products={products} />}
          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              darkMode={darkMode}
              onToggleDarkMode={handleToggleDarkMode}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

        </div>
      </main>

      {/* Shared Auth popup modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

