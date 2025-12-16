import { BallEvent } from "@/types";
import { useEffect, useRef } from "react";

export default function Timeline({ history }: { history: BallEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [history]);

  // Helper to determine styling
  const getBallStyle = (ball: string) => {
    if (ball.includes('W') && !ball.includes('WD')) return 'bg-red-500 text-white border-red-600'; // Wicket
    if (ball.includes('4')) return 'bg-green-500 text-white border-green-600';
    if (ball.includes('6')) return 'bg-purple-500 text-white border-purple-600';
    if (ball.includes('WD') || ball.includes('NB')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600';
  };

  // LOGIC FOR OVER SEPARATOR (|)
  // We need to rebuild the view array dynamically
  const renderBalls = () => {
    const elements = [];
    let legalBallCount = 0;

    for (let i = 0; i < history.length; i++) {
      const ball = history[i];
      
      // Render the Ball
      elements.push(
        <div 
          key={`ball-${i}`} 
          className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-full border text-xs font-bold shadow-sm shrink-0 ${getBallStyle(ball)}`}
        >
          {ball}
        </div>
      );

      // Check if legal to add Separator
      // A ball is legal if it is NOT WD or NB (Simplified logic based on standard display)
      // Note: If your rules say WD counts as ball, this visual might need tweaking, 
      // but standard scorecards usually separate on 6 legal deliveries regardless.
      const isExtra = ball.includes('WD') || ball.includes('NB');
      
      if (!isExtra) {
        legalBallCount++;
        // If 6 legal balls have passed, add pipe
        if (legalBallCount % 6 === 0) {
          elements.push(
            <div key={`sep-${i}`} className="flex items-center justify-center w-4 text-gray-300 dark:text-gray-600 font-light text-2xl pb-1">
              |
            </div>
          );
        }
      }
    }
    return elements;
  };

  return (
    <div className="mb-6">
      <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Timeline</div>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 pb-2 thin-scrollbar items-center"
      >
        {history.length === 0 && <span className="text-gray-400 text-sm italic">Match started...</span>}
        {renderBalls()}
      </div>
    </div>
  );
}