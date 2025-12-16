// src/types/index.ts

// 1. CONFIGURATION: What the user chooses on the Setup Screen
export interface MatchConfig {
  totalOvers: number;
  wideRule: 'run' | 'reball' | 'both';  
  noBallRule: 'run' | 'reball' | 'both';
  teamOneName: string;
  teamTwoName: string;
}

// 2. THE LIVE STATE: This is what changes every time you press a button
export interface MatchState {
  currentInnings: 1 | 2;
  config: MatchConfig;         
  inningsOne: InningsData;      
  inningsTwo: InningsData | null; 
  status: 'setup' | 'in-progress' | 'completed';
}

// 3. INNINGS DATA: The specific stats for one team
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
}

// 4. EVENTS: Valid values for a single ball
export type BallEvent = '0' | '1' | '2' | '3' | '4' | '6' | 'W' | 'WD' | 'NB';