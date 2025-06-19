import React from 'react';
import { useGameStore } from '../state/useGameStore';

export default function StatusBar() {
  const encounter = useGameStore((s) => s.encounter);
  const getCurrentActor = useGameStore((s) => s.getCurrentActor);
  const currentActor = getCurrentActor();

  return (
    <div className="h-8 bg-gray-900 border-t border-gray-800 text-gray-300 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm">READY</span>
        </div>
        {encounter && (
          <>
            <div className="text-sm text-gray-500">|</div>
            <div className="text-sm">Turn: {encounter.turn}</div>
            <div className="text-sm text-gray-500">|</div>
            <div className="text-sm">Current Actor: {currentActor?.name || 'None'}</div>
          </>
        )}
      </div>
      <div className="text-sm text-gray-500">Netbreaker v1.0.0</div>
    </div>
  );
} 