import { 
  LayoutDashboard, 
  ShoppingBag, 
  GitCompare, 
  TrendingUp, 
  CalendarRange, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  User,
  Sparkles
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface NavigationProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: FirebaseUser | null;
  onOpenAuth: () => void;
  mobileOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function Navigation({
  currentTab,
  onChangeTab,
  darkMode,
  onToggleDarkMode,
  user,
  onOpenAuth,
  mobileOpen,
  onToggleMobileMenu
}: NavigationProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'comparison', label: 'Market Comparison', icon: GitCompare },
    { id: 'forecast', label: 'Price Forecast', icon: TrendingUp },
    { id: 'planner', label: 'Weekly Planner', icon: CalendarRange },
    { id: 'advisor', label: 'AI Advisor', icon: MessageSquare, hasSparkle: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#166534] dark:bg-[#0b331a] border-r border-[#14532d] dark:border-[#082211] transition-colors">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#14532d] dark:border-[#082211]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcfce7] text-[#166534] text-lg font-bold shadow-md shadow-[#0c311a]/40">
          🥗
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white">SmartBasket <span className="text-[#86efac]">AI</span></h1>
          <p className="text-[10px] font-semibold text-[#dcfce7]/70 uppercase tracking-widest">Price Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onChangeTab(item.id);
                if (mobileOpen) onToggleMobileMenu();
              }}
              id={`nav-tab-${item.id}`}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#15803d] dark:bg-[#09411f] text-white border-l-4 border-[#86efac] pl-2.5 shadow-sm shadow-[#0a2714]/30'
                  : 'text-[#dcfce7]/85 hover:bg-[#15803d]/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-[#86efac]/80'}`} />
                <span>{item.label}</span>
              </div>
              {item.hasSparkle && (
                <span className="flex h-2 w-2 rounded-full bg-[#86efac] ring-4 ring-[#86efac]/20 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-[#14532d] dark:border-[#082211] space-y-3">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          id="nav-theme-toggle"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#14532d] dark:border-[#082211] text-xs font-semibold text-[#dcfce7] hover:bg-[#15803d]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            {darkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-[#86efac]" />}
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
          <span className="text-[10px] bg-[#15803d] text-white px-1.5 py-0.5 rounded-md font-mono">
            {darkMode ? 'DARK' : 'LIGHT'}
          </span>
        </button>

        {/* User Account Controls */}
        {user ? (
          <div className="p-3 bg-[#15803d]/30 dark:bg-[#092412]/30 rounded-xl border border-[#14532d] dark:border-[#082211] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] text-[#166534]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Profile'} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[9px] text-[#dcfce7]/60 truncate font-semibold">Subscriber</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              id="nav-logout-btn"
              title="Sign Out"
              className="text-[#dcfce7]/80 hover:text-red-300 p-1.5 rounded-lg hover:bg-[#15803d]/50 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            id="nav-login-btn"
            className="w-full flex items-center justify-center gap-2 bg-[#dcfce7] hover:bg-white text-[#166534] font-bold py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left Panel) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMobileMenu}
            id="mobile-menu-toggle"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">SmartBasket AI</span>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 overflow-hidden flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-500 p-1 rounded-md"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onToggleMobileMenu} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full h-full bg-white dark:bg-slate-900">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
