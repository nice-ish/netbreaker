import React from 'react';
import { useGameStore } from '../state/useGameStore';
import CharacterCard from './CharacterCard';

export default function RightPanel() {
  const encounter = useGameStore((s) => s.encounter);
  const targets = useGameStore((s) => s.targets);
  const turnOrder = useGameStore((s) => s.turnOrder);
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const currentActor = turnOrder && currentTurnIndex >= 0 ? turnOrder[currentTurnIndex] : null;
  const scanned = useGameStore((s) => s.scanned);

  return (
    <div className="bg-nb-300 text-slate-200 border-l border-nb-border p-4 h-full flex flex-col min-w-0">

      {/* Enemies */}
      <div>
        <h2 className="text-xs text-nb-subtext font-mono uppercase tracking-wider mb-2">Enemy protocols</h2>
        {(!encounter || !scanned) && <div className="text-gray-500 text-xs">No foes detected.</div>}
        {encounter && scanned && encounter.enemies.map((enemy) => (
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