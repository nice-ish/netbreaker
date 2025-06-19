import React from 'react';
import { useGameStore } from '../state/useGameStore';
import CharacterCard from './CharacterCard';

export default function RightPanel() {
  const encounter = useGameStore((s) => s.encounter);
  const target = useGameStore((s) => s.target);
  const currentActor = useGameStore((s) => s.getCurrentActor());

  if (!encounter) return <div className="bg-gray-900 border-l border-gray-800 p-4 h-full flex flex-col min-w-0" />;

  return (
    <div className="bg-gray-900 border-l border-gray-800 p-4 h-full flex flex-col min-w-0">
      {/* Encounter/Location */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Location</h2>
        <div className="text-blue-300 font-bold">{encounter.name}</div>
        <div className="text-gray-400 text-sm mt-1">{encounter.description}</div>
      </div>
      {/* Enemies */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Detected Foes</h2>
        {encounter.enemies.length === 0 && <div className="text-gray-500 text-sm">No foes detected.</div>}
        {encounter.enemies.map((enemy) => (
          <CharacterCard
            key={enemy.id}
            name={enemy.name}
            className={enemy.class}
            integrity={enemy.integrity}
            maxIntegrity={enemy.maxIntegrity}
            color="red"
            status={enemy.status}
            highlight={!!(currentActor?.id === enemy.id || (target && enemy.name.toLowerCase() === target.toLowerCase()))}
          />
        ))}
      </div>
    </div>
  );
} 