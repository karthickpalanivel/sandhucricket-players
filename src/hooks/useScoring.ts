import { useState, useEffect, useCallback } from 'react';
import { MatchState, BallEvent, InningsData } from '@/types';

export const useScoring = () => {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [historyStack, setHistoryStack] = useState<MatchState[]>([]);
  const [futureStack, setFutureStack] = useState<MatchState[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sandhu_cricket_match');
    if (saved) setMatch(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (match) localStorage.setItem('sandhu_cricket_match', JSON.stringify(match));
  }, [match]);

  const pushToHistory = (currentState: MatchState) => {
    setHistoryStack((prev) => [...prev, currentState]);
    setFutureStack([]); 
  };

  // --- PLAYER ASSIGNMENT ACTIONS ---

  const setStriker = (name: string) => {
    setMatch(prev => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      const innings = next.currentInnings === 1 ? next.inningsOne : next.inningsTwo;
      
      innings.currentStriker = name;
      // Init stats if new
      if (!innings.battingStats[name]) innings.battingStats[name] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
      
      return next;
    });
  };

  const setNonStriker = (name: string) => {
    setMatch(prev => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      const innings = next.currentInnings === 1 ? next.inningsOne : next.inningsTwo;
      
      innings.currentNonStriker = name;
      if (!innings.battingStats[name]) innings.battingStats[name] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
      
      return next;
    });
  };

  const setBowler = (name: string) => {
    setMatch(prev => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      const innings = next.currentInnings === 1 ? next.inningsOne : next.inningsTwo;
      
      innings.currentBowler = name;
      if (!innings.bowlingStats[name]) innings.bowlingStats[name] = { overs: 0, runs: 0, wickets: 0 };
      
      return next;
    });
  };

  // --- CORE SCORING ENGINE ---

  const scoreBall = useCallback((
    type: 'legal' | 'wide' | 'no-ball' | 'wicket', 
    runsOffBat: number = 0,
    isExtraWicket: boolean = false
  ) => {
    setMatch((prevMatch) => {
      if (!prevMatch) return null;
      
      const currentInningsKey = prevMatch.currentInnings === 1 ? 'inningsOne' : 'inningsTwo';
      const innings = prevMatch[currentInningsKey];
      
      // 1. Guard Clauses (Safety Check)
      if (!innings || !innings.currentStriker || !innings.currentBowler) return prevMatch; // Must have players selected

      // 2. OVERS LIMIT CHECK
      const maxBalls = prevMatch.config.totalOvers * 6;
      if (innings.ballsBowled >= maxBalls) return prevMatch; 

      // 3. TARGET CHECK
      if (prevMatch.currentInnings === 2 && prevMatch.inningsOne) {
          const target = prevMatch.inningsOne.totalRuns + 1;
          if (innings.totalRuns >= target) return prevMatch;
      }

      if (innings.wickets >= 10) return prevMatch;

      // --- BEGIN UPDATE ---
      pushToHistory(prevMatch);
      const nextMatch = JSON.parse(JSON.stringify(prevMatch));
      const nextInnings: InningsData = nextMatch[currentInningsKey];
      const config = nextMatch.config;

      // Current Players
      const striker = nextInnings.currentStriker!;
      const bowler = nextInnings.currentBowler!;

      let runsToAdd = runsOffBat;
      let isLegalBall = false;
      let isWicket = (type === 'wicket') || isExtraWicket;
      let displaySymbol = "";

      // --- BALL TYPE LOGIC ---
      if (type === 'legal') {
        isLegalBall = true;
        displaySymbol = runsOffBat.toString();
        if (isWicket) displaySymbol = 'W';
        
        // Batter Stats
        nextInnings.battingStats[striker].balls += 1;
        nextInnings.battingStats[striker].runs += runsOffBat;
        if (runsOffBat === 4) nextInnings.battingStats[striker].fours += 1;
        if (runsOffBat === 6) nextInnings.battingStats[striker].sixes += 1;
      } 
      else if (type === 'wide') {
        const isReball = config.wideRule !== 'run'; 
        runsToAdd += 1; // Base Wide
        isLegalBall = !isReball;
        
        displaySymbol = "WD";
        if (runsOffBat > 0) displaySymbol += `+${runsOffBat}`;
        if (isWicket) displaySymbol += "+W";
        
        nextInnings.extras.wides += 1;
        // Wides don't count to batter balls, but runs might (depending on rule, usually extras go to team, run-hits go to batter. Simplified here: all extras to team).
      } 
      else if (type === 'no-ball') {
        const isReball = config.noBallRule !== 'run';
        runsToAdd += 1; 
        isLegalBall = !isReball;

        displaySymbol = "NB";
        if (runsOffBat > 0) displaySymbol += `+${runsOffBat}`;
        if (isWicket) displaySymbol += "+W";

        nextInnings.extras.noBalls += 1;
        // NB counts as ball faced by batter usually
        nextInnings.battingStats[striker].balls += 1;
        nextInnings.battingStats[striker].runs += runsOffBat;
        if (runsOffBat === 4) nextInnings.battingStats[striker].fours += 1;
        if (runsOffBat === 6) nextInnings.battingStats[striker].sixes += 1;
      }
      else if (type === 'wicket') {
         isLegalBall = true;
         isWicket = true;
         displaySymbol = 'W';
         
         nextInnings.battingStats[striker].balls += 1;
      }

      // --- UPDATE TOTALS ---
      nextInnings.totalRuns += runsToAdd;
      if (isLegalBall) nextInnings.ballsBowled += 1;
      if (isWicket) nextInnings.wickets += 1;
      nextInnings.history.push(displaySymbol as BallEvent);

      // Bowler Stats
      nextInnings.bowlingStats[bowler].runs += runsToAdd;
      if (isWicket && type !== 'wide' && type !== 'no-ball') { // Run outs technically don't go to bowler, but simplified here
        nextInnings.bowlingStats[bowler].wickets += 1;
      }

      // --- ROTATION LOGIC ---
      
      // 1. Rotate Strike on Odd Runs
      if (runsOffBat % 2 !== 0) {
        const temp = nextInnings.currentStriker;
        nextInnings.currentStriker = nextInnings.currentNonStriker;
        nextInnings.currentNonStriker = temp;
      }

      // 2. Over Completion
      if (isLegalBall && nextInnings.ballsBowled % 6 === 0) {
        // Swap Ends
        const temp = nextInnings.currentStriker;
        nextInnings.currentStriker = nextInnings.currentNonStriker;
        nextInnings.currentNonStriker = temp;
        
        // Bowler change required
        nextInnings.currentBowler = undefined; // Will trigger modal
      }

      // 3. Fall of Wicket
      if (isWicket) {
        // Current Striker is out (Simplified. Future: Ask who is out)
        nextInnings.battingStats[striker].outBy = bowler; // Simplified
        nextInnings.currentStriker = undefined; // Will trigger modal
      }

      return nextMatch;
    });
  }, []);

  // --- UNDO/REDO/END (Kept same but ensure full state restore) ---
  const endInnings = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return null;
      pushToHistory(prev);
      const next = JSON.parse(JSON.stringify(prev));

      if (next.currentInnings === 1) {
        next.currentInnings = 2;
        if (!next.inningsTwo) {
             next.inningsTwo = {
                battingTeam: next.config.teamTwoName,
                bowlingTeam: next.config.teamOneName,
                totalRuns: 0,
                wickets: 0,
                ballsBowled: 0,
                history: [],
                extras: { wides: 0, noBalls: 0 },
                battingStats: {},
                bowlingStats: {}
             };
        }
      } else {
        next.status = 'completed';
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyStack.length === 0 || !match) return;
    const previousState = historyStack[historyStack.length - 1];
    setFutureStack((prev) => [match, ...prev]);
    setMatch(previousState);
    setHistoryStack((prev) => prev.slice(0, -1));
  }, [historyStack, match]);

  const redo = useCallback(() => {
    if (futureStack.length === 0 || !match) return;
    const nextState = futureStack[0];
    setHistoryStack((prev) => [...prev, match]);
    setMatch(nextState);
    setFutureStack((prev) => prev.slice(1));
  }, [futureStack, match]);

  return { 
    match, scoreBall, undo, redo, endInnings, 
    setStriker, setNonStriker, setBowler,
    canUndo: historyStack.length > 0, 
    canRedo: futureStack.length > 0 
  };
};