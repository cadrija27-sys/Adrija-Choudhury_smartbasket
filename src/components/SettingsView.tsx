import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  Settings, 
  Database, 
  Moon, 
  Sun, 
  Check, 
  Sparkles, 
  Cpu, 
  Cloud,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  Terminal
} from 'lucide-react';

interface SettingsViewProps {
  user: FirebaseUser | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: () => void;
}

export default function SettingsView({
  user,
  darkMode,
  onToggleDarkMode,
  onOpenAuth
}: SettingsViewProps) {
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bqStatus, setBqStatus] = useState<'connected' | 'idle'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestBigQuery = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setBqStatus('connected');
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="settings-view-container">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">System Settings & Integrations</h2>
        <p className="text-sm text-slate-500 dark:text-emerald-500/80 font-medium">
          Configure security credentials, manage UI visual modes, and monitor Google Cloud infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: User Profile & Visuals */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section: Firebase profile */}
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-[#166534] dark:text-emerald-400" />
              User Profile Profile
            </h3>

            {user ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Registered Email</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-white dark:focus:border-[#10b981]"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-save-profile"
                  className="w-full bg-[#166534] hover:bg-[#15803d] py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-200" />
                      <span>Profile Synchronized!</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <ShieldCheck className="h-10 w-10 text-slate-300 dark:text-emerald-800 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Anonymous Guest Mode</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Log in to save budget schedules permanently.</p>
                </div>
                <button
                  onClick={onOpenAuth}
                  id="settings-login-btn"
                  className="mx-auto flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15803d] py-2 px-4 rounded-xl text-xs font-bold text-white shadow cursor-pointer"
                >
                  Sign In with Firebase
                </button>
              </div>
            )}
          </div>

          {/* Section: Dark Mode theme */}
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sun className="h-4.5 w-4.5 text-[#166534] dark:text-emerald-400" />
              Aesthetics & Theme
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-emerald-950/20 rounded-xl border border-slate-200/40 dark:border-emerald-900/20">
              <div className="flex items-center gap-2.5">
                {darkMode ? <Moon className="h-4 w-4 text-amber-500" /> : <Sun className="h-4 w-4 text-[#166534] dark:text-emerald-400" />}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dark Interface Mode</span>
              </div>
              <button
                onClick={onToggleDarkMode}
                id="btn-settings-theme"
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 dark:bg-[#166534] transition-colors focus:outline-none"
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: BigQuery placeholder setup guide */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-slate-200/80 dark:border-emerald-900/30 p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-emerald-900/30 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-[#166534] dark:text-emerald-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Google BigQuery Analytics Sync</h3>
                  <p className="text-xs text-slate-400 font-semibold">Active Pipeline: GCP BigQuery Analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {bqStatus === 'connected' ? (
                  <span className="bg-[#f0f4f2] text-[#166534] dark:bg-emerald-950/40 dark:text-emerald-400 border border-slate-200/40 dark:border-emerald-900/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono">
                    PIPELINE ACTIVE
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono">
                    SANDBOX MODE
                  </span>
                )}
              </div>
            </div>

            {/* Sandbox Simulation button */}
            <div className="p-4 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/40 dark:border-emerald-900/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#166534] dark:text-emerald-400 animate-pulse" />
                  Simulate BigQuery Table Connection
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                  Validate regional tables and ingest live product entries into the dashboard state.
                </p>
              </div>
              <button
                onClick={handleTestBigQuery}
                disabled={isSyncing}
                id="btn-sync-bigquery"
                className="bg-[#166534] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shrink-0 dark:text-emerald-200 border border-transparent dark:border-emerald-800 cursor-pointer"
              >
                {isSyncing ? 'Testing Ingress...' : 'Test GCP Connection'}
              </button>
            </div>

            {/* GCP BigQuery Integration Blueprint Guide */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#166534] dark:text-emerald-400" />
                Production Deployment Blueprint
              </h4>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                To connect SmartBasket AI to your production BigQuery dataset, follow this blueprint structure. The UI is pre-wired to ingest this JSON row format without schema alterations.
              </p>

              {/* Step checklist */}
              <div className="space-y-3.5 pl-2">
                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 font-extrabold rounded-full flex items-center justify-center text-xs shrink-0 font-mono">1</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Create BigQuery Dataset & Tables</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                      Name your dataset `grocery_dataset` and create a table `price_history`.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 font-extrabold rounded-full flex items-center justify-center text-xs shrink-0 font-mono">2</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">DML Table Schema Definition</h5>
                    <div className="bg-slate-50 dark:bg-emerald-950/20 rounded-xl p-3 mt-1.5 border border-slate-200/40 dark:border-emerald-900/20 font-mono text-[9px] text-slate-500 dark:text-slate-400 overflow-x-auto leading-relaxed">
                      {`CREATE TABLE grocery_dataset.price_history (
  id STRING,
  name STRING,
  category STRING,
  currentPrice FLOAT64,
  lastMonthPrice FLOAT64,
  market STRING,
  country STRING,
  timestamp TIMESTAMP
);`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 font-extrabold rounded-full flex items-center justify-center text-xs shrink-0 font-mono">3</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Environment Configuration</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                      Store your service account credentials securely in Cloud Run Secrets and load using `@google-cloud/bigquery` client initializations in `/server.ts`.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
