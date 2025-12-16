"use client";

import { useScoring } from "@/hooks/useScoring";
import Scoreboard from "@/components/Scoreboard";
import Timeline from "@/components/Timeline";
import Keypad from "@/components/Keypad";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { InningsData } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";


export default function MatchPage() {
  const { match, scoreBall, undo, redo, endInnings, canUndo, canRedo } = useScoring();
  
  const [viewInnings, setViewInnings] = useState<1 | 2>(1);

  // Sync view with reality when innings changes
  useEffect(() => {
    if (match) {
      setViewInnings(match.currentInnings);
    }
  }, [match?.currentInnings]);

  if (!match) return <div className="flex h-screen items-center justify-center">Loading Arena...</div>;

  const isViewingActive = viewInnings === match.currentInnings && match.status !== 'completed';
  const displayInningsData: InningsData = viewInnings === 1 ? match.inningsOne : (match.inningsTwo || match.inningsOne);
  const target = match.inningsTwo ? match.inningsOne.totalRuns + 1 : undefined;

  // --- MATCH COMPLETED VIEW ---
  if (match.status === 'completed') {
    const runs1 = match.inningsOne.totalRuns;
    const runs2 = match.inningsTwo?.totalRuns || 0;
    let winnerText = "Match Tied!";
    if (runs1 > runs2) winnerText = `${match.config.teamOneName} Wins!`;
    if (runs2 > runs1) winnerText = `${match.config.teamTwoName} Wins!`;

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <Trophy size={64} className="text-yellow-400 mb-4" />
        <h1 className="text-4xl font-black mb-2">{winnerText}</h1>
        <p className="text-gray-400 mb-8">
            {match.config.teamOneName}: {runs1} | {match.config.teamTwoName}: {runs2}
        </p>
        <Link href="/" className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold">
            Start New Match
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* 1. Header with Tabs */}
      <div className="bg-white dark:bg-gray-900 shadow-sm z-10 transition-colors duration-300">
        <div className="p-4 flex items-center justify-between">
            {/* Left: Back Button */}
            <div className="w-10">
                <Link href="/" className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full inline-block transition-colors">
                    <ArrowLeft size={24} />
                </Link>
            </div>

            {/* Center: Title */}
            <div className="flex-1 text-center">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider truncate px-2">
                    {match.config.teamOneName} vs {match.config.teamTwoName}
                </h1>
            </div>

            {/* Right: Theme Toggle */}
            <div className="w-10 flex justify-end">
                <ThemeToggle />
            </div>
        </div>

        {/* Innings Tabs */}
        <div className="flex px-4 gap-4">
            <button 
                onClick={() => setViewInnings(1)}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                    viewInnings === 1 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
                1st Innings
            </button>
            <button 
                onClick={() => setViewInnings(2)}
                disabled={!match.inningsTwo && match.currentInnings === 1}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                    viewInnings === 2 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 disabled:opacity-30'
                }`}
            >
                2nd Innings
            </button>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col">
        {/* 2. Scoreboard & Timeline */}
        <Scoreboard 
            data={displayInningsData} 
            target={viewInnings === 2 ? target : undefined} 
        />
        
        <Timeline history={displayInningsData.history} />
        
        <div className="flex-1" />

        {/* 3. Dynamic Bottom Section */}
        {isViewingActive ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                <Keypad 
                  onScore={scoreBall} 
                  onUndo={undo} 
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
                
                <button 
                    onClick={() => {
                        if(confirm(match.currentInnings === 2 ? "End Match?" : "End 1st Innings?")) {
                            endInnings();
                        }
                    }}
                    className="w-full mt-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-colors"
                >
                    {match.currentInnings === 2 ? "Finish Match" : "End Innings"}
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 opacity-70">
                <Lock size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Read Only Mode</h3>
                <p className="text-center text-sm text-gray-500 mt-2 mb-6">
                    You are viewing past data. <br/>Switch tabs to resume scoring.
                </p>
                {match.currentInnings !== viewInnings && (
                     <button 
                        onClick={() => setViewInnings(match.currentInnings)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                     >
                        Go to Live Scoring
                     </button>
                )}
            </div>
        )}
        <div className="h-6" />
      </div>
    </main>
  );
}