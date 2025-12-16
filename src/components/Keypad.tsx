import { useState } from "react";
import { ArrowLeft, RotateCcw, RotateCw, X } from "lucide-react";

interface Props {
  onScore: (type: 'legal' | 'wide' | 'no-ball' | 'wicket', runs: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function Keypad({ onScore, onUndo, onRedo, canUndo, canRedo }: Props) {
  // Local state to handle the "Extra" sub-menu
  const [pendingExtra, setPendingExtra] = useState<'wide' | 'no-ball' | null>(null);

  // 1. STANDARD VIEW
  if (!pendingExtra) {
    return (
      <div className="space-y-3">
        {/* Undo / Redo Row */}
        <div className="flex gap-3 mb-2">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-30 transition-opacity"
          >
            <RotateCcw size={16} /> Undo
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-30 transition-opacity"
          >
            Redo <RotateCw size={16} />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 6, 0].map((runs) => (
            <button
              key={runs}
              onClick={() => onScore('legal', runs)}
              className={`h-16 text-2xl font-bold rounded-xl shadow-sm active:scale-95 transition-transform
                ${runs === 4 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                ${runs === 6 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' : ''}
                ${![4,6].includes(runs) ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : ''}
              `}
            >
              {runs}
            </button>
          ))}

          {/* Special Keys */}
          <button 
            onClick={() => setPendingExtra('wide')}
            className="h-16 text-lg font-bold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 rounded-xl active:scale-95"
          >
            WD
          </button>
          <button 
            onClick={() => setPendingExtra('no-ball')}
            className="h-16 text-lg font-bold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 rounded-xl active:scale-95"
          >
            NB
          </button>
          <button 
            onClick={() => onScore('wicket', 0)}
            className="h-16 text-lg font-bold bg-red-500 text-white rounded-xl active:scale-95"
          >
            OUT
          </button>
        </div>
      </div>
    );
  }

  // 2. EXTRA DETAILS VIEW (Modal-like)
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {pendingExtra === 'wide' ? 'Wide Ball' : 'No Ball'} 
          <span className="text-sm font-normal text-gray-500">(+1 Run)</span>
        </h3>
        <button onClick={() => setPendingExtra(null)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <X size={16} />
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mb-3">Did they run any extra runs?</p>
      
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button
            key={runs}
            onClick={() => {
              onScore(pendingExtra, runs); // Pass the extra type + runs ran
              setPendingExtra(null);     // Close modal
            }}
            className="py-3 bg-white dark:bg-gray-700 rounded-lg font-bold shadow-sm active:scale-95"
          >
            +{runs}
          </button>
        ))}
      </div>
      <button 
        onClick={() => setPendingExtra(null)}
        className="w-full mt-4 py-3 text-gray-500 font-bold"
      >
        Cancel
      </button>
    </div>
  );
}