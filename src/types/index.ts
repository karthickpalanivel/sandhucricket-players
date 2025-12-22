// src/types/index.ts

export interface Player {
  id: string;
  name: string;
}

// Used for the draft screen state
export interface TeamDraftState {
  pool: Player[];
  teamA: Player[];
  teamB: Player[];
}

export interface MatchConfig {
  totalOvers: number;
  wideRule: 'run' | 'reball' | 'both';
  noBallRule: 'run' | 'reball' | 'both';
  teamOneName: string;
  teamTwoName: string;
  // NEW: Connected Players
  teamOnePlayers: string[]; // List of names
  teamTwoPlayers: string[];
}

export interface MatchState {
  currentInnings: 1 | 2;
  config: MatchConfig;
  inningsOne: InningsData;
  inningsTwo: InningsData | null;
  status: 'setup' | 'in-progress' | 'completed';
}

export interface InningsData {
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  ballsBowled: number;
  history: BallEvent[];
  extras: {
    wides: number;
    noBalls: number;
  };
  // NEW: Player Performance Tracking (Placeholder for next phase)
  battingStats: { [playerId: string]: { runs: number; balls: number; fours: number; sixes: number; outBy?: string } };
  bowlingStats: { [playerId: string]: { overs: number; runs: number; wickets: number } };
  currentStriker?: string;
  currentNonStriker?: string;
  currentBowler?: string;
}

export type BallEvent = '0' | '1' | '2' | '3' | '4' | '6' | 'W' | 'WD' | 'NB' | string;