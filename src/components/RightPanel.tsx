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
      {/* Context Card */}
      <div className="mb-6">
        <div className="bg-nb-100 border-l-4 border-nb-accent p-4 rounded-md shadow-sm flex flex-col gap-2">
          <div className="text-xs text-nb-subtext font-mono uppercase tracking-wider mb-1">Context</div>
          <div className="flex flex-col gap-1">
            <div>
              <span className="text-nb-accent font-bold mr-2">Location:</span>
              <span className="text-nb-text font-semibold">{encounter ? encounter.name : 'No active protocol'}</span>
            </div>
            <div>
              <span className="text-nb-accent font-bold mr-2">Objective:</span>
              <span className="text-nb-text">{encounter ? encounter.description : 'Start a protocol to receive your objective.'}</span>
            </div>
          </div>
        </div>
      </div>
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