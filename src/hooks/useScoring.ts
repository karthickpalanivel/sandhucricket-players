import { useState, useEffect, useCallback } from 'react';
import { MatchState, BallEvent, InningsData } from '@/types';

export const useScoring = () => {
  const [match, setMatch] = useState<MatchState | null>(null);
  
  // HISTORY STACKS
  const [historyStack, setHistoryStack] = useState<MatchState[]>([]);
  const [futureStack, setFutureStack] = useState<MatchState[]>([]);

  // ... (Keep existing useEffects for Load/Save) ...
  useEffect(() => {
    const saved = localStorage.getItem('sandhu_cricket_match');
    if (saved) setMatch(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (match) localStorage.setItem('sandhu_cricket_match', JSON.stringify(match));
  }, [match]);

  // ... (Keep existing pushToHistory helper) ...
  const pushToHistory = (currentState: MatchState) => {
    setHistoryStack((prev) => [...prev, currentState]);
    setFutureStack([]); 
  };

  // ... (Keep scoreBall function exactly as is from Phase 3) ...
  const scoreBall = useCallback((type: 'legal' | 'wide' | 'no-ball' | 'wicket', runsOffBat: number = 0) => {
    setMatch((prevMatch) => {
      if (!prevMatch) return null;
      pushToHistory(prevMatch);
      const nextMatch = JSON.parse(JSON.stringify(prevMatch));
      
      const currentInningsKey = nextMatch.currentInnings === 1 ? 'inningsOne' : 'inningsTwo';
      const innings: InningsData = nextMatch[currentInningsKey];
      const config = nextMatch.config;

      let runsToAdd = runsOffBat;
      let isLegalBall = false;
      let isWicket = (type === 'wicket');
      let displaySymbol: BallEvent = runsOffBat.toString() as BallEvent;

      if (type === 'legal') {
        isLegalBall = true;
        if (isWicket) displaySymbol = 'W';
      } 
      else if (type === 'wide') {
        const isReball = config.wideRule !== 'run'; 
        runsToAdd += 1; 
        isLegalBall = !isReball;
        displaySymbol = runsOffBat > 0 ? `WD+${runsOffBat}` as any : 'WD';
        innings.extras.wides += 1;
      } 
      else if (type === 'no-ball') {
        const isReball = config.noBallRule !== 'run';
        runsToAdd += 1; 
        isLegalBall = !isReball;
        displaySymbol = runsOffBat > 0 ? `NB+${runsOffBat}` as any : 'NB';
        innings.extras.noBalls += 1;
      }
      else if (type === 'wicket') {
         isLegalBall = true;
         displaySymbol = 'W';
      }

      innings.totalRuns += runsToAdd;
      if (isLegalBall) innings.ballsBowled += 1;
      if (isWicket) innings.wickets += 1;
      innings.history.push(displaySymbol);

      return nextMatch;
    });
  }, []);

  // --- NEW: END INNINGS LOGIC ---
  const endInnings = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return null;
      pushToHistory(prev); // Allow undoing "End Innings"
      const next = JSON.parse(JSON.stringify(prev));

      if (next.currentInnings === 1) {
        // Switch to 2nd Innings
        next.currentInnings = 2;
        
        // Initialize Innings 2 if it's null (it should be based on setup, but safety first)
        if (!next.inningsTwo) {
             next.inningsTwo = {
                battingTeam: next.config.teamTwoName,
                bowlingTeam: next.config.teamOneName,
                totalRuns: 0,
                wickets: 0,
                ballsBowled: 0,
                history: [],
                extras: { wides: 0, noBalls: 0 },
             };
        }
      } else {
        // End Match
        next.status = 'completed';
      }
      return next;
    });
  }, []);

  // ... (Keep undo/redo exactly as is from Phase 3) ...
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
    canUndo: historyStack.length > 0, 
    canRedo: futureStack.length > 0 
  };
};