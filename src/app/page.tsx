"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MatchConfig, MatchState } from '@/types';
import { ChevronRight, Trophy, Settings2 } from 'lucide-react';
import ThemeToggle from "@/components/ThemeToggle";

// --- HELPER COMPONENT: CARD ---
// Modular card component for styling consistency
const Card = ({ 
  children, 
  title, 
  icon 
}: { 
  children: React.ReactNode, 
  title: string, 
  icon?: React.ReactNode 
}) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-all hover:shadow-md">
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
    </div>
    {children}
  </div>
);

// --- MAIN COMPONENT ---
export default function SetupScreen() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Fix hydration mismatch

  // 1. STATE: The "Draft" Configuration
  const [config, setConfig] = useState<MatchConfig>({
    totalOvers: 5,         // Default: 5 over match
    wideRule: 'both',      // Default: Wide = 1 Run + Extra Ball
    noBallRule: 'both',    // Default: No Ball = 1 Run + Extra Ball
    teamOneName: '',       // Empty by default
    teamTwoName: '',
  });

  // Ensure we only render on client (prevents hydration errors with localStorage)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 2. HANDLER: Updates the config state
  const updateConfig = (key: keyof MatchConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // 3. ACTION: The "Start Match" Logic
  const handleStartMatch = () => {
    // Validation: Ensure team names are not empty
    const t1 = config.teamOneName.trim() || 'Team A';
    const t2 = config.teamTwoName.trim() || 'Team B';

    // THE CRITICAL STEP: Creating the "Brain" (Initial State)
    const initialState: MatchState = {
      currentInnings: 1,
      status: 'in-progress',
      config: { ...config, teamOneName: t1, teamTwoName: t2 },
      inningsOne: {
        battingTeam: t1,
        bowlingTeam: t2,
        totalRuns: 0,
        wickets: 0,
        ballsBowled: 0,
        history: [],
        extras: { wides: 0, noBalls: 0 },
      },
      inningsTwo: null, // Second innings doesn't exist yet
    };

    // PERSISTENCE: Save to browser storage
    localStorage.setItem('sandhu_cricket_match', JSON.stringify(initialState));

    // NAVIGATION: Go to the actual game
    router.push('/match');
  };

  if (!isClient) return null; // Render nothing on server

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 pb-24 md:p-8">
      {/* HEADER SECTION */}
      <div className="max-w-md mx-auto mb-8 flex items-center justify-between">
         {/* Title */}
        <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Sandhu Cricket Setup
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Setup your match</p>
        </div>
        
        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Card 1: Teams */}
        <Card title="Teams" icon={<Trophy size={20} />}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Batting First</label>
              <input
                type="text"
                placeholder="Team A"
                value={config.teamOneName}
                onChange={(e) => updateConfig('teamOneName', e.target.value)}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg font-semibold focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Bowling First</label>
              <input
                type="text"
                placeholder="Team B"
                value={config.teamTwoName}
                onChange={(e) => updateConfig('teamTwoName', e.target.value)}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg font-semibold focus:ring-2 ring-red-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Overs */}
        <Card title="Match Length" icon={<Settings2 size={20} />}>
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <button 
              onClick={() => updateConfig('totalOvers', Math.max(1, config.totalOvers - 1))}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-600 dark:text-white rounded-md shadow-sm font-bold text-xl active:scale-90 transition-transform hover:bg-gray-50 dark:hover:bg-gray-500"
            >-</button>
            <div className="text-center">
              <span className="text-3xl font-black text-gray-800 dark:text-white">{config.totalOvers}</span>
              <span className="text-xs block text-gray-500 dark:text-gray-400 font-bold uppercase">Overs</span>
            </div>
            <button 
              onClick={() => updateConfig('totalOvers', Math.min(20, config.totalOvers + 1))}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-600 dark:text-white rounded-md shadow-sm font-bold text-xl active:scale-90 transition-transform hover:bg-gray-50 dark:hover:bg-gray-500"
            >+</button>
          </div>
        </Card>

        {/* Card 3: Rules (Wides & No Balls) */}
        <Card title="Extras Rules">
          {/* Helper Function for Rule Buttons */}
          {['wideRule', 'noBallRule'].map((ruleKey) => (
            <div key={ruleKey} className="mb-4 last:mb-0">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">
                {ruleKey === 'wideRule' ? 'Wide Ball' : 'No Ball'} Handling
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {[
                  { id: 'run', label: '1 Run' },
                  { id: 'reball', label: 'Reball' },
                  { id: 'both', label: 'Both' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateConfig(ruleKey as keyof MatchConfig, opt.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      config[ruleKey as keyof MatchConfig] === opt.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>

      </div>

      {/* Floating Action Button (FAB) for Start */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-10">
        <button
          onClick={handleStartMatch}
          className="w-full max-w-md bg-gray-900 dark:bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Match <ChevronRight />
        </button>
      </div>
    </main>
  );
}