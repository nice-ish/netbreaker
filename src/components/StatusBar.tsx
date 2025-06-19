import React from 'react';
import { useGameStore } from '../state/useGameStore';

export default function StatusBar() {
  const encounter = useGameStore((s) => s.encounter);
  const getCurrentActor = useGameStore((s) => s.getCurrentActor);
  const currentActor = getCurrentActor();

  return (
    <div className="h-8 bg-nb-500 border-t border-nb-border text-nb-subtext px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-mono uppercase">Ready</span>
        </div>
        {encounter && (
          <>
            <div className="text-xs text-nb-subtext">|</div>
            <div className="text-xs font-mono uppercase">Turn: {encounter.turn}</div>
            <div className="text-xs text-nb-subtext">|</div>
            <div className="text-xs font-mono uppercase">Current Actor: {currentActor?.name || 'None'}</div>
          </>
        )}
      </div>
      <div className="text-xs font-mono uppercase">Netbreaker v1.0.0</div>
    </div>
  );
} 