"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MatchConfig, MatchState } from "@/types";
import { ChevronRight, Trophy, Settings2, Users, History } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

// --- HELPER COMPONENT: CARD ---
const Card = ({
  children,
  title,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-all hover:shadow-md">
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

// --- MAIN COMPONENT ---
export default function SetupScreen() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // 1. STATE
  const [config, setConfig] = useState<MatchConfig>({
    totalOvers: 5,
    wideRule: "both",
    noBallRule: "both",
    teamOneName: "",
    teamTwoName: "",
    teamOnePlayers: [],
    teamTwoPlayers: [],
  });

  // 2. LOAD SAVED TEAMS ON MOUNT
  useEffect(() => {
    // 1. Handle Logic First (Load from storage)
    const teamDataStr = localStorage.getItem("sc_teams_final");
    if (teamDataStr) {
      try {
        const teamData = JSON.parse(teamDataStr);
        setConfig((prev) => ({
          ...prev,
          teamOneName: prev.teamOneName || `Team A (${teamData.teamA.length})`,
          teamTwoName: prev.teamTwoName || `Team B (${teamData.teamB.length})`,
          teamOnePlayers: teamData.teamA.map((p: any) => p.name),
          teamTwoPlayers: teamData.teamB.map((p: any) => p.name),
        }));
      } catch (e) {
        console.error("Failed to load team data", e);
      }
    }

    // 2. Then Mark as Client Ready
    setIsClient(true);
  }, []);

  const updateConfig = (key: keyof MatchConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // NEW: LOAD LAST MATCH RULES
  const loadLastSettings = () => {
    const savedMatch = localStorage.getItem("sandhu_cricket_match");
    if (savedMatch) {
      try {
        const data = JSON.parse(savedMatch);
        if (data.config) {
          if (confirm("Load Overs & Rules from the last match?")) {
            setConfig((prev) => ({
              ...prev,
              totalOvers: data.config.totalOvers || 5,
              wideRule: data.config.wideRule || "both",
              noBallRule: data.config.noBallRule || "both",
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("No previous match settings found.");
    }
  };

  const handleStartMatch = () => {
    // --- VALIDATION CHECK ---
    if (config.teamOnePlayers.length === 0 || config.teamTwoPlayers.length === 0) {
        alert("⚠️ Teams cannot be empty!\n\nPlease use the 'Advanced Roster' button to add players before starting.");
        return;
    }

    const t1 = config.teamOneName.trim() || "Team A";
    const t2 = config.teamTwoName.trim() || "Team B";

    const initialState: MatchState = {
      currentInnings: 1,
      status: "in-progress",
      config: { ...config, teamOneName: t1, teamTwoName: t2 },
      inningsOne: {
        battingTeam: t1,
        bowlingTeam: t2,
        totalRuns: 0,
        wickets: 0,
        ballsBowled: 0,
        history: [],
        extras: { wides: 0, noBalls: 0 },
        battingStats: {},
        bowlingStats: {},
      },
      inningsTwo: null,
    };

    localStorage.setItem("sandhu_cricket_match", JSON.stringify(initialState));
    router.push("/match");
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 pb-24 md:p-8">
      {/* HEADER */}
      <div className="max-w-md mx-auto mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Sandhu Cricket
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Setup your match
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Load History Button */}
          <button
            onClick={loadLastSettings}
            className="flex items-center gap-3 p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
            title="Load Last Match Settings"
          >
            <p>Load Previous</p>
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* --- ROSTER LINK --- */}
        <Link
          href="/teams"
          className="block p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between group transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-indigo-200 dark:shadow-none shadow-lg">
              <Users size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
                Advanced Roster
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                {config.teamOnePlayers && config.teamOnePlayers.length > 0
                  ? `${
                      config.teamOnePlayers.length +
                      config.teamTwoPlayers.length
                    } players loaded`
                  : "Import names & manage squads"}
              </p>
            </div>
          </div>
          <ChevronRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Card 1: Teams */}
        <Card title="Teams" icon={<Trophy size={20} />}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Batting First
              </label>
              <input
                type="text"
                placeholder="Team A"
                value={config.teamOneName}
                onChange={(e) => updateConfig("teamOneName", e.target.value)}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg font-semibold focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Bowling First
              </label>
              <input
                type="text"
                placeholder="Team B"
                value={config.teamTwoName}
                onChange={(e) => updateConfig("teamTwoName", e.target.value)}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg font-semibold focus:ring-2 ring-red-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Overs (SLIDER VERSION) */}
        <Card title="Match Length" icon={<Settings2 size={20} />}>
          <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-xl">
            {/* Display Value */}
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">
                Duration
              </span>
              <div className="text-right">
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400">
                  {config.totalOvers}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-300 font-bold ml-1">
                  OVERS
                </span>
              </div>
            </div>

            {/* Slider Input with 'modern-range' class */}
            <input
              type="range"
              min="1"
              max="20"
              value={config.totalOvers}
              onChange={(e) =>
                updateConfig("totalOvers", parseInt(e.target.value))
              }
              className="modern-range w-full appearance-none focus:outline-none focus:ring-0"
            />

            {/* Scale Labels */}
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-mono font-bold px-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Rules */}
        <Card title="Extras Rules">
          {["wideRule", "noBallRule"].map((ruleKey) => (
            <div key={ruleKey} className="mb-4 last:mb-0">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">
                {ruleKey === "wideRule" ? "Wide Ball" : "No Ball"} Handling
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {[
                  { id: "run", label: "1 Run" },
                  { id: "reball", label: "Reball" },
                  { id: "both", label: "Both" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      updateConfig(ruleKey as keyof MatchConfig, opt.id)
                    }
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      config[ruleKey as keyof MatchConfig] === opt.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
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