import { InningsData } from "@/types";

interface Props {
  data: InningsData;
  target?: number; // Optional target for 2nd innings
}

export default function Scoreboard({ data, target }: Props) {
  // Convert balls (e.g., 7) to overs (e.g., 1.1)
  const overs = Math.floor(data.ballsBowled / 6) + "." + (data.ballsBowled % 6);
  
  // Calculate Run Rate
  const crr = data.ballsBowled > 0 
    ? ((data.totalRuns / data.ballsBowled) * 6).toFixed(2) 
    : "0.00";

  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-2xl mb-6 text-center relative overflow-hidden">
      {/* Background Decor (Vibe Check) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">
        {data.battingTeam} vs {data.bowlingTeam}
      </h2>

      <div className="flex items-end justify-center gap-2 mb-2">
        <span className="text-7xl font-black tracking-tighter">
          {data.totalRuns}/{data.wickets}
        </span>
      </div>

      <div className="flex justify-center gap-6 text-sm font-mono text-gray-400">
        <div className="bg-gray-800 px-3 py-1 rounded-lg">
          Overs: <span className="text-white font-bold">{overs}</span>
        </div>
        <div className="bg-gray-800 px-3 py-1 rounded-lg">
          CRR: <span className="text-white font-bold">{crr}</span>
        </div>
      </div>

      {target && (
        <div className="mt-4 text-sm text-blue-400">
          Need {target - data.totalRuns} runs to win
        </div>
      )}
    </div>
  );
}