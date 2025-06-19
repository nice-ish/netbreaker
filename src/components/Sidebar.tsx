import React from 'react';
import { useGameStore } from '../state/useGameStore';
import CharacterCard from './CharacterCard';

export default function Sidebar() {
  const player = useGameStore((s) => s.player);
  const party = useGameStore((s) => s.party);
  const currentActor = useGameStore((s) => s.getCurrentActor());

  return (
    <div className="bg-gray-900 text-gray-300 p-4 border-r border-gray-800 flex flex-col h-full min-w-0">
      <p>Party</p>
      <div className="mb-6">
        <CharacterCard
          name={player.name}
          className={player.class}
          integrity={player.integrity}
          maxIntegrity={player.maxIntegrity}
          color="green"
          subsystems={player.subsystems}
          isPlayer={true}
          highlight={currentActor?.id === player.id}
        />
      </div>

      {/* Party Members */}
      {party.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Party</h2>
          <div className="space-y-2">
            {party.map((member) => (
              <CharacterCard
                key={member.id}
                name={member.name}
                className={member.class}
                integrity={member.integrity}
                maxIntegrity={member.maxIntegrity}
                color="blue"
                subsystems={member.subsystems}
                highlight={currentActor?.id === member.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 