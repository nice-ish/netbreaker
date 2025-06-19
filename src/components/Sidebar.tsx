import React from 'react';
import { useGameStore } from '../state/useGameStore';
import CharacterCard from './CharacterCard';

export default function Sidebar() {
  const player = useGameStore((s) => s.player);
  const party = useGameStore((s) => s.party);
  const turnOrder = useGameStore((s) => s.turnOrder);
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const currentActor = turnOrder && currentTurnIndex >= 0 ? turnOrder[currentTurnIndex] : null;
  const targets = useGameStore((s) => s.targets);

  return (
    <div className="bg-nb-200 text-slate-200 p-4 border-r border-gray-800 flex flex-col h-full min-w-0">
      <h2 className="text-base font-semibold text-white mb-2">Party</h2>
        <CharacterCard
          name={player.name}
          className={player.class}
          integrity={player.integrity}
          maxIntegrity={player.maxIntegrity}
          color="green"
          subsystems={player.subsystems}
          isPlayer={true}
          highlight={currentActor?.id === player.id}
          currentTurn={currentActor?.id === player.id}
          isTargeted={!!(currentActor && targets[currentActor.id] && targets[currentActor.id].toLowerCase() === player.name.toLowerCase())}
        />
      
      {party.length > 0 && (
        <div className="mt-2">         
          <div className="space-y-2">
            {party.map((member) => (
              <CharacterCard
                key={member.id}
                name={member.name}
                className={member.class}
                integrity={member.integrity}
                maxIntegrity={member.maxIntegrity}
                color="slate"
                subsystems={member.subsystems}
                highlight={currentActor?.id === member.id}
                currentTurn={currentActor?.id === member.id}
                isTargeted={!!(currentActor && targets[currentActor.id] && targets[currentActor.id].toLowerCase() === member.name.toLowerCase())}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 