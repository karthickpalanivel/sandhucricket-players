"use client";

import { X } from "lucide-react";

interface Props {
  title: string;
  players: string[]; // List of available names
  onSelect: (player: string) => void;
  onClose?: () => void; // Optional if forced selection
}

export default function PlayerSelectModal({ title, players, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="grid gap-3 max-h-[60vh] overflow-y-auto thin-scrollbar pr-2">
          {players.length === 0 ? (
             <p className="text-center text-gray-500 py-4 italic">No players available</p>
          ) : (
            players.map((p, i) => (
              <button
                key={i}
                onClick={() => onSelect(p)}
                className="w-full text-left p-4 rounded-xl font-bold text-lg transition-all
                  bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200
                  hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600
                  active:scale-[0.98]"
              >
                {p}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}