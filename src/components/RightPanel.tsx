import React from 'react';
import { useGameStore } from '../state/useGameStore';
import CharacterCard from './CharacterCard';

export default function RightPanel() {
  const encounter = useGameStore((s) => s.encounter);
  const targets = useGameStore((s) => s.targets);
  const turnOrder = useGameStore((s) => s.turnOrder);
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const currentActor = turnOrder && currentTurnIndex >= 0 ? turnOrder[currentTurnIndex] : null;

  if (!encounter) return <div className="bg-nb-200 border-l border-gray-800 p-4 h-full flex flex-col min-w-0" />;

  return (
    <div className="bg-nb-200 text-slate-200 border-l border-gray-800 p-4 h-full flex flex-col min-w-0">
      {/* Encounter/Location */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white mb-1">Location</h2>
        <div className="text-slate-400 font-bold text-sm">{encounter.name}</div>
        <div className="text-slate-400 text-xs mt-1">{encounter.description}</div>
      </div>
      {/* Enemies */}
      <div>
        <h2 className="text-base font-semibold text-white mb-2">Detected Foes</h2>
        {encounter.enemies.length === 0 && <div className="text-gray-500 text-xs">No foes detected.</div>}
        {encounter.enemies.map((enemy) => (
          <CharacterCard
            key={enemy.id}
            name={enemy.name}
            className={enemy.class}
            integrity={enemy.integrity}
            maxIntegrity={enemy.maxIntegrity}
            color="red"
            status={enemy.status}
            highlight={currentActor?.id === enemy.id}
            currentTurn={currentActor?.id === enemy.id}
            isTargeted={!!(currentActor && targets[currentActor.id] && targets[currentActor.id].toLowerCase() === enemy.name.toLowerCase())}
          />
        ))}
      </div>
    </div>
  );
} 