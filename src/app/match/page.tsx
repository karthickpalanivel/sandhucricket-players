"use client";

import { useScoring } from "@/hooks/useScoring";
import Scoreboard from "@/components/Scoreboard";
import Timeline from "@/components/Timeline";
import Keypad from "@/components/Keypad";
import PlayerSelectModal from "@/components/PlayerSelectModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Trophy, Award, TrendingUp } from "lucide-react";
import { InningsData } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";

// --- HELPER: CALCULATE TOP PERFORMERS ---
const getTopPerformers = (innings: InningsData | null) => {
  if (!innings) return { batsmen: [], bowlers: [] };

  // 1. Top Batsmen: Sort by Runs (Desc), then Balls (Asc)
  const batsmen = Object.keys(innings.battingStats).map(name => ({
    name,
    ...innings.battingStats[name]
  })).sort((a, b) => b.runs - a.runs || a.balls - b.balls).slice(0, 2);

  // 2. Top Bowlers: Sort by Wickets (Desc), then Runs (Asc)
  const bowlers = Object.keys(innings.bowlingStats).map(name => ({
    name,
    ...innings.bowlingStats[name]
  })).sort((a, b) => b.wickets - a.wickets || a.runs - b.runs).slice(0, 2);

  return { batsmen, bowlers };
};

// --- COMPONENT: SUMMARY CARD ---
const TeamSummary = ({ teamName, score, wickets, performers }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 w-full">
    <div className="flex justify-between items-center mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider">{teamName}</h3>
      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{score}/{wickets}</span>
    </div>

    {/* Top Batsmen */}
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
        <Award size={12} /> Top Batters
      </div>
      {performers.batsmen.length > 0 ? performers.batsmen.map((p: any, i: number) => (
        <div key={i} className="flex justify-between text-sm py-1">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{p.name}</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            {p.runs} <span className="text-xs text-gray-500 font-normal">({p.balls})</span>
          </span>
        </div>
      )) : <div className="text-xs text-gray-400 italic">No batting data</div>}
    </div>

    {/* Top Bowlers */}
    <div>
      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-400 uppercase">
        <TrendingUp size={12} /> Top Bowlers
      </div>
      {performers.bowlers.length > 0 ? performers.bowlers.map((p: any, i: number) => (
        <div key={i} className="flex justify-between text-sm py-1">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{p.name}</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            {p.wickets}-{p.runs} <span className="text-xs text-gray-500 font-normal">({p.overs})</span>
          </span>
        </div>
      )) : <div className="text-xs text-gray-400 italic">No bowling data</div>}
    </div>
  </div>
);

export default function MatchPage() {
  const { 
    match, scoreBall, undo, redo, endInnings, 
    setStriker, setNonStriker, setBowler,
    canUndo, canRedo 
  } = useScoring();
  
  const [viewInnings, setViewInnings] = useState<1 | 2>(1);

  useEffect(() => {
    if (match) setViewInnings(match.currentInnings);
  }, [match?.currentInnings]);

  if (!match) return <div className="flex h-screen items-center justify-center">Loading Arena...</div>;

  const isViewingActive = viewInnings === match.currentInnings && match.status !== 'completed';
  const displayInningsData: InningsData = viewInnings === 1 ? match.inningsOne : (match.inningsTwo || match.inningsOne);
  
  // --- PLAYER LIST FILTERING LOGIC ---
  const isInnings1 = match.currentInnings === 1;
  const battingTeamList = isInnings1 ? match.config.teamOnePlayers : match.config.teamTwoPlayers;
  const bowlingTeamList = isInnings1 ? match.config.teamTwoPlayers : match.config.teamOnePlayers;

  // 1. Filter Batsmen: Remove current players AND dismissed players
  const activeBatsmen = [displayInningsData.currentStriker, displayInningsData.currentNonStriker];
  const dismissedPlayers = Object.keys(displayInningsData.battingStats || {}).filter(
    player => displayInningsData.battingStats[player]?.outBy // If 'outBy' is set, they are out
  );

  // Available = All Players - (Active + Dismissed)
  const availableBatsmen = battingTeamList.filter(p => 
    !activeBatsmen.includes(p) && !dismissedPlayers.includes(p)
  );

  // 2. Filter Bowlers: Just exclude current bowler (Street cricket usually allows re-bowling after break, but basic filter prevents self-spell)
  // Note: Standard rule is bowler can't bowl consecutive overs.
  const availableBowlers = bowlingTeamList.filter(p => p !== displayInningsData.currentBowler);


  // --- MODAL LOGIC ---
  let modal = null;

  if (isViewingActive) {
    if (!displayInningsData.currentStriker) {
      modal = (
        <PlayerSelectModal 
          title="Select Striker"
          players={availableBatsmen} // <--- Filtered List
          onSelect={setStriker}
        />
      );
    } else if (!displayInningsData.currentNonStriker) {
      modal = (
        <PlayerSelectModal 
          title="Select Non-Striker"
          players={availableBatsmen} // <--- Filtered List
          onSelect={setNonStriker}
        />
      );
    } else if (!displayInningsData.currentBowler) {
      modal = (
        <PlayerSelectModal 
          title="Select Next Bowler"
          players={availableBowlers}
          onSelect={setBowler}
        />
      );
    }
  }

  // --- STANDARD MATCH LOGIC ---
  const maxLegalBalls = match.config.totalOvers * 6;
  const isOversCompleted = displayInningsData.ballsBowled >= maxLegalBalls;
  const isAllOut = displayInningsData.wickets >= 10 || availableBatsmen.length === 0; // Auto-detect All Out if no batsmen left
  const target = match.inningsTwo ? match.inningsOne.totalRuns + 1 : undefined;
  const isTargetReached = (match.currentInnings === 2) && (target !== undefined) && (displayInningsData.totalRuns >= target);
  const isKeypadDisabled = isOversCompleted || isAllOut || isTargetReached;

  // --- MATCH COMPLETED VIEW ---
  if (match.status === 'completed') {
    const runs1 = match.inningsOne.totalRuns;
    const runs2 = match.inningsTwo?.totalRuns || 0;
    const wickets1 = match.inningsOne.wickets;
    const wickets2 = match.inningsTwo?.wickets || 0;

    let winnerText = "Match Tied!";
    if (runs1 > runs2) winnerText = `${match.config.teamOneName} Won!`;
    if (runs2 > runs1) winnerText = `${match.config.teamTwoName} Won!`;

    // Prepare Stats
    const team1Perf = getTopPerformers(match.inningsOne);
    const team2Perf = getTopPerformers(match.inningsTwo);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start text-white p-4 overflow-y-auto">
          <div className="mt-8 mb-6 text-center animate-in zoom-in duration-500">
            <Trophy size={64} className="text-yellow-400 mx-auto mb-4 drop-shadow-glow" />
            <h1 className="text-4xl font-black tracking-tight">{winnerText}</h1>
            <p className="text-gray-400 text-sm mt-1">Match Summary</p>
          </div>

          <div className="w-full max-w-md space-y-4 animate-in slide-in-from-bottom-8 duration-700 fade-in">
             {/* TEAM 1 CARD */}
             <TeamSummary 
                teamName={match.config.teamOneName} 
                score={runs1} 
                wickets={wickets1}
                performers={team1Perf}
             />

             {/* TEAM 2 CARD */}
             {match.inningsTwo && (
                <TeamSummary 
                    teamName={match.config.teamTwoName} 
                    score={runs2} 
                    wickets={wickets2}
                    performers={team2Perf}
                />
             )}
          </div>
          
          <div className="h-8"/>
          
          <Link href="/" className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl mb-8">
              Start New Match
          </Link>
        </div>
    );
  }

  // --- ACTIVE MATCH VIEW ---
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 shadow-sm z-10 transition-colors duration-300">
        <div className="p-4 flex items-center justify-between">
            <div className="w-10">
                <Link href="/" className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full inline-block transition-colors">
                    <ArrowLeft size={24} />
                </Link>
            </div>
            <div className="flex-1 text-center">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider truncate px-2">
                    {match.config.teamOneName} vs {match.config.teamTwoName}
                </h1>
            </div>
            <div className="w-10 flex justify-end">
                <ThemeToggle />
            </div>
        </div>

        {/* TABS */}
        <div className="flex px-4 gap-4">
            <button onClick={() => setViewInnings(1)} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${viewInnings === 1 ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>1st Innings</button>
            <button onClick={() => setViewInnings(2)} disabled={!match.inningsTwo && match.currentInnings === 1} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${viewInnings === 2 ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600 disabled:opacity-30'}`}>2nd Innings</button>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col">
        {/* PLAYER INFO CARD */}
        <div className="mb-4 grid grid-cols-2 gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <span className="block mb-1 text-blue-600 dark:text-blue-400">Batting</span>
                <div className="flex justify-between items-center text-gray-900 dark:text-white text-sm normal-case">
                    <span>{displayInningsData.currentStriker || "Select..."} *</span>
                    <span>{displayInningsData.battingStats[displayInningsData.currentStriker || ""]?.runs || 0}({displayInningsData.battingStats[displayInningsData.currentStriker || ""]?.balls || 0})</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 text-sm normal-case mt-1">
                    <span>{displayInningsData.currentNonStriker || "Select..."}</span>
                    <span>{displayInningsData.battingStats[displayInningsData.currentNonStriker || ""]?.runs || 0}({displayInningsData.battingStats[displayInningsData.currentNonStriker || ""]?.balls || 0})</span>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                 <span className="block mb-1 text-red-600 dark:text-red-400">Bowling</span>
                 <div className="text-gray-900 dark:text-white text-sm normal-case truncate">
                    {displayInningsData.currentBowler || "Select..."}
                 </div>
                 <div className="text-gray-400 text-xs normal-case mt-1">
                    {displayInningsData.bowlingStats[displayInningsData.currentBowler || ""]?.wickets || 0}W - {displayInningsData.bowlingStats[displayInningsData.currentBowler || ""]?.runs || 0}R
                 </div>
            </div>
        </div>

        <Scoreboard data={displayInningsData} target={viewInnings === 2 ? target : undefined} />
        <Timeline history={displayInningsData.history} />
        
        <div className="flex-1" />

        {isViewingActive ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                {isTargetReached && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-center font-bold text-sm border border-green-200 dark:border-green-800">🎉 Target Chased! Match Won.</div>}
                
                <Keypad 
                  onScore={scoreBall} 
                  onUndo={undo} 
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  isDisabled={isKeypadDisabled} 
                />
                
                <button 
                    onClick={() => {
                        const action = match.currentInnings === 2 ? "Finish Match?" : "End 1st Innings?";
                        if(confirm(action)) {
                            endInnings();
                        }
                    }}
                    className={`w-full mt-6 py-4 font-bold rounded-xl border transition-all shadow-lg active:scale-95 ${isKeypadDisabled ? 'bg-green-600 text-white border-green-600 animate-pulse hover:bg-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50 hover:bg-red-100'}`}
                >
                    {match.currentInnings === 2 ? "Finish Match" : "End Innings"}
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 opacity-70">
                <Lock size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Read Only Mode</h3>
                <p className="text-center text-sm text-gray-500 mt-2 mb-6">Viewing past data. <br/>Switch tabs to resume.</p>
                {match.currentInnings !== viewInnings && (
                     <button onClick={() => setViewInnings(match.currentInnings)} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform">Go to Live Scoring</button>
                )}
            </div>
        )}
        <div className="h-6" />
      </div>

      {/* RENDER MODAL IF NEEDED */}
      {modal}
      
    </main>
  );
}