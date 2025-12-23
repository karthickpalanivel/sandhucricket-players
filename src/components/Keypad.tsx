import { useState } from "react";
import { RotateCcw, RotateCw, X, UserMinus } from "lucide-react";

interface Props {
  onScore: (type: 'legal' | 'wide' | 'no-ball' | 'wicket', runs: number, isWicket?: boolean, whoOut?: 'striker' | 'non-striker') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDisabled?: boolean;
  statusLabel?: string; // <--- NEW PROP
}

export default function Keypad({ 
  onScore, onUndo, onRedo, canUndo, canRedo, 
  isDisabled = false, 
  statusLabel = "Innings Closed" // Default text
}: Props) {
  const [pendingMode, setPendingMode] = useState<'wide' | 'no-ball' | 'wicket' | null>(null);
  const [isExtraWicket, setIsExtraWicket] = useState(false);
  const [whoOut, setWhoOut] = useState<'striker' | 'non-striker'>('striker');

  // --- LOCKED STATE (Overs Done / All Out) ---
  if (isDisabled) {
    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl text-center space-y-4 border border-gray-200 dark:border-gray-700">
            <p className="text-red-500 dark:text-red-400 font-black uppercase tracking-widest text-lg animate-pulse">
              {statusLabel}
            </p>
            <div className="flex gap-3 justify-center">
                <button 
                    onClick={onUndo} 
                    disabled={!canUndo}
                    className="px-6 py-3 bg-white dark:bg-gray-700 rounded-xl font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw size={16} /> Undo Last Ball
                </button>
            </div>
        </div>
    );
  }

  // --- 1. STANDARD GRID ---
  if (!pendingMode) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3 mb-2">
          <button onClick={onUndo} disabled={!canUndo} className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-30"><RotateCcw size={16} /> Undo</button>
          <button onClick={onRedo} disabled={!canRedo} className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-30">Redo <RotateCw size={16} /></button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 6, 0].map((runs) => (
            <button
              key={runs}
              onClick={() => onScore('legal', runs)}
              className={`h-16 text-2xl font-bold rounded-xl shadow-sm active:scale-95 transition-transform border border-gray-100 dark:border-gray-700
                ${runs === 4 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                ${runs === 6 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' : ''}
                ${![4,6].includes(runs) ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
            >
              {runs}
            </button>
          ))}
          <button onClick={() => { setPendingMode('wide'); setIsExtraWicket(false); setWhoOut('striker'); }} className="h-16 text-lg font-bold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 rounded-xl active:scale-95 hover:bg-orange-200 dark:hover:bg-orange-800">WD</button>
          <button onClick={() => { setPendingMode('no-ball'); setIsExtraWicket(false); setWhoOut('striker'); }} className="h-16 text-lg font-bold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 rounded-xl active:scale-95 hover:bg-orange-200 dark:hover:bg-orange-800">NB</button>
          <button onClick={() => { setPendingMode('wicket'); setWhoOut('striker'); }} className="h-16 text-lg font-bold bg-red-500 text-white rounded-xl active:scale-95 shadow-md shadow-red-200 dark:shadow-none hover:bg-red-600">OUT</button>
        </div>
      </div>
    );
  }

  // --- 2. WICKET MODAL ---
  if (pendingMode === 'wicket') {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2"><UserMinus size={20}/> Wicket Fall</h3>
                <button onClick={() => setPendingMode(null)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"><X size={16} /></button>
            </div>

            {/* WHO IS OUT SELECTOR */}
            <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-4">
                <button onClick={() => setWhoOut('striker')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${whoOut === 'striker' ? 'bg-red-500 text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>Striker Out</button>
                <button onClick={() => setWhoOut('non-striker')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${whoOut === 'non-striker' ? 'bg-red-500 text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>Non-Striker Out</button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">Runs completed before out?</p>
            <div className="grid grid-cols-4 gap-2">
                <button onClick={() => { onScore('wicket', 0, true, whoOut); setPendingMode(null); }} className="col-span-2 py-4 bg-white dark:bg-gray-700 rounded-lg font-bold shadow-sm active:scale-95 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">0 (Catch/Bowled)</button>
                {[1, 2, 3].map((runs) => (
                    <button key={runs} onClick={() => { onScore('legal', runs, true, whoOut); setPendingMode(null); }} className="py-4 bg-white dark:bg-gray-700 rounded-lg font-bold shadow-sm active:scale-95 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                        {runs} Run{runs > 1 ? 's' : ''}
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // --- 3. EXTRAS MODAL ---
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">{pendingMode === 'wide' ? 'Wide Ball' : 'No Ball'} <span className="text-sm font-normal text-gray-500">(+1 Run)</span></h3>
        <button onClick={() => setPendingMode(null)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"><X size={16} /></button>
      </div>
      
      {/* WICKET TOGGLE */}
      <div onClick={() => setIsExtraWicket(!isExtraWicket)} className={`flex items-center justify-between p-3 rounded-xl mb-4 cursor-pointer border ${isExtraWicket ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-transparent dark:bg-gray-700'}`}>
        <span className={`font-bold text-sm ${isExtraWicket ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>Wicket also fell?</span>
        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isExtraWicket ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}>{isExtraWicket && <X size={14} className="text-white" />}</div>
      </div>

      {isExtraWicket && (
        <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-4">
            <button onClick={() => setWhoOut('striker')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${whoOut === 'striker' ? 'bg-red-500 text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>Striker Out</button>
            <button onClick={() => setWhoOut('non-striker')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${whoOut === 'non-striker' ? 'bg-red-500 text-white shadow' : 'text-gray-500 dark:text-gray-300'}`}>Non-Striker Out</button>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-2 font-semibold">Additional runs off bat/legs:</p>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button key={runs} onClick={() => { onScore(pendingMode!, runs, isExtraWicket, whoOut); setPendingMode(null); }} className="py-3 bg-white dark:bg-gray-700 rounded-lg font-bold shadow-sm active:scale-95 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">+{runs}</button>
        ))}
      </div>
    </div>
  );
}