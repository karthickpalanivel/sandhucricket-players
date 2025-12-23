"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Users,
  Trash2,
  Plus,
  X,
  History,
} from "lucide-react";
import { Player, TeamDraftState } from "@/types";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// --- COMPONENT: PLAYER IMPORTER MODAL ---
const PlayerImporter = ({
  onImport,
  onClose,
}: {
  onImport: (names: string[]) => void;
  onClose: () => void;
}) => {
  const [text, setText] = useState("");

  const handleProcess = () => {
    const names = text
      .split(/[\n,\t/\\.]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length > 0) onImport(names);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white">Upload Players</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Paste list separated by commas, new lines, or tabs.
        </p>
        <textarea
          className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 ring-blue-500 outline-none resize-none mb-4 dark:text-white placeholder:text-gray-400"
          placeholder="e.g. Kohli, Rohit, Dhoni..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
          >
            Import{" "}
            {text
              ? `(${text.split(/[\n,\t/\\.]+/).filter((n) => n.trim()).length})`
              : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TeamManager() {
  const router = useRouter();

  // --- STATE ---
  // FIX 1: Defined isClient state
  const [isClient, setIsClient] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [activeTab, setActiveTab] = useState<"pool" | "A" | "B">("pool");

  const [state, setState] = useState<TeamDraftState>({
    pool: [],
    teamA: [],
    teamB: [],
  });

  // --- 1. LOAD FROM STORAGE ---
  useEffect(() => {
    setIsClient(true); // Mark as client immediately
    const saved = localStorage.getItem("sc_teams_draft");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  // --- 2. SAVE TO STORAGE ---
  // FIX 2: Removed the incorrect 'setConfig' logic that was causing crashes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("sc_teams_draft", JSON.stringify(state));
    }
  }, [state, isClient]);

  // --- LOGIC ---
  const handleImport = (names: string[]) => {
    // FIX 3: Replaced deprecated substr with slice and ensured robustness
    const newPlayers: Player[] = names.map((name) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
    }));

    setState((prev) => ({
      ...prev,
      // Safety check: Ensure pool is an array before spreading
      pool: [...(prev.pool || []), ...newPlayers],
    }));
    
    setShowImport(false);
    setActiveTab("pool");
  };

  const movePlayer = (
    player: Player,
    from: "pool" | "A" | "B",
    to: "pool" | "A" | "B"
  ) => {
    setState((prev) => {
      const sourceKey =
        from === "pool" ? "pool" : from === "A" ? "teamA" : "teamB";
      const targetKey = to === "pool" ? "pool" : to === "A" ? "teamA" : "teamB";

      return {
        ...prev,
        [sourceKey]: prev[sourceKey].filter((p) => p.id !== player.id),
        [targetKey]: [...prev[targetKey], player],
      };
    });
  };

  const clearAll = () => {
    if (confirm("Clear all players from draft?")) {
      setState({ pool: [], teamA: [], teamB: [] });
    }
  };

  // LOAD PREVIOUS MATCH TEAMS
  const loadLastTeams = () => {
    const saved = localStorage.getItem("sc_teams_final");
    if (saved) {
      if (
        confirm(
          "Load teams from the last match? This will overwrite your current draft."
        )
      ) {
        try {
          setState(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      alert("No previous match teams found.");
    }
  };

  const proceedToSetup = () => {
    if (state.teamA.length === 0 || state.teamB.length === 0) {
      alert("Both teams need at least 1 player!");
      return;
    }
    // Save Final Teams
    localStorage.setItem("sc_teams_final", JSON.stringify(state));
    router.push("/");
  };

  if (!isClient) return null; // Prevent hydration mismatch

  // --- RENDER HELPER: PLAYER CARD ---
  const PlayerCard = ({
    player,
    source,
  }: {
    player: Player;
    source: "pool" | "A" | "B";
  }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl mb-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <span className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2 select-none">
        {player.name}
      </span>
      <div className="flex gap-1 shrink-0">
        {source !== "A" && (
          <button
            onClick={() => movePlayer(player, source, "A")}
            className="px-3 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            {source === "pool" ? "+ A" : "← A"}
          </button>
        )}
        {source !== "pool" && (
          <button
            onClick={() => movePlayer(player, source, "pool")}
            className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        {source !== "B" && (
          <button
            onClick={() => movePlayer(player, source, "B")}
            className="px-3 py-2 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            {source === "pool" ? "+ B" : "B →"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 p-4 shadow-sm z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Draft Players
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Load History Button */}
            <button
              onClick={loadLastTeams}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="Load Last Teams"
            >
              <History size={20} />
            </button>
            <button
              onClick={clearAll}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Clear All"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Upload size={18} /> Upload List
          </button>
          <button
            onClick={() =>
              handleImport([
                `Player ${
                  (state.pool?.length || 0) +
                  (state.teamA?.length || 0) +
                  (state.teamB?.length || 0) +
                  1
                }`,
              ])
            }
            className="w-14 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl flex items-center justify-center font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="Add Single Player"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE TABS (Sticky) */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <TabButton
          active={activeTab === "A"}
          onClick={() => setActiveTab("A")}
          label={`Team A (${state.teamA?.length || 0})`}
          color="blue"
        />
        <TabButton
          active={activeTab === "pool"}
          onClick={() => setActiveTab("pool")}
          label={`Pool (${state.pool?.length || 0})`}
          color="gray"
        />
        <TabButton
          active={activeTab === "B"}
          onClick={() => setActiveTab("B")}
          label={`Team B (${state.teamB?.length || 0})`}
          color="green"
        />
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full md:grid md:grid-cols-3 md:gap-4 md:p-6 max-w-7xl mx-auto">
          {/* TEAM A COLUMN */}
          <div
            className={`h-full overflow-y-auto p-4 md:p-4 bg-blue-50/50 dark:bg-blue-900/5 md:rounded-3xl border border-transparent md:border-blue-100 md:dark:border-blue-900/30 ${
              activeTab !== "A" ? "hidden md:block" : ""
            }`}
          >
            <div className="hidden md:flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-blue-900 dark:text-blue-300">
                Team A
              </h3>
              <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-full">
                {state.teamA?.length || 0}
              </span>
            </div>
            {state.teamA?.length === 0 && <EmptyState text="Team A is empty" />}
            {state.teamA?.map((p) => (
              <PlayerCard key={p.id} player={p} source="A" />
            ))}
          </div>

          {/* POOL COLUMN */}
          <div
            className={`h-full overflow-y-auto p-4 md:p-4 ${
              activeTab !== "pool" ? "hidden md:block" : ""
            }`}
          >
            <div className="hidden md:flex items-center justify-center mb-4 px-1">
              <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">
                Unassigned Pool ({state.pool?.length || 0})
              </h3>
            </div>
            {state.pool?.length === 0 && (
              <EmptyState text="No unassigned players" />
            )}
            {state.pool?.map((p) => (
              <PlayerCard key={p.id} player={p} source="pool" />
            ))}
          </div>

          {/* TEAM B COLUMN */}
          <div
            className={`h-full overflow-y-auto p-4 md:p-4 bg-green-50/50 dark:bg-green-900/5 md:rounded-3xl border border-transparent md:border-green-100 md:dark:border-green-900/30 ${
              activeTab !== "B" ? "hidden md:block" : ""
            }`}
          >
            <div className="hidden md:flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-green-900 dark:text-green-300">
                Team B
              </h3>
              <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full">
                {state.teamB?.length || 0}
              </span>
            </div>
            {state.teamB?.length === 0 && <EmptyState text="Team B is empty" />}
            {state.teamB?.map((p) => (
              <PlayerCard key={p.id} player={p} source="B" />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20">
        <div className="max-w-md mx-auto">
          <button
            onClick={proceedToSetup}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Confirm Teams <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showImport && (
        <PlayerImporter
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </main>
  );
}

const TabButton = ({ active, onClick, label, color }: any) => {
  const colors = {
    blue: "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400",
    green:
      "border-green-600 text-green-600 dark:text-green-400 dark:border-green-400",
    gray: "border-gray-800 text-gray-800 dark:border-white dark:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
        active
          ? colors[color as keyof typeof colors]
          : "border-transparent text-gray-400"
      }`}
    >
      {label}
    </button>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
    <Users size={32} className="mb-2 opacity-20" />
    <span className="text-sm font-medium opacity-50">{text}</span>
  </div>
);