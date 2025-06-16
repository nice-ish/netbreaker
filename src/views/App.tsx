import React from "react";
import Terminal from "../components/Terminal";
import { useGameStore } from "../state/useGameStore";

export default function App() {

  const encounter = useGameStore((state) => state.encounter);
  const target = useGameStore((state) => state.target);
  const player = useGameStore((state) => state.player);
  const party = [player, ...useGameStore((state) => state.party)];

  // For now, party is just the player

  const foes = encounter?.enemies || [];

  return (
    <div className="h-screen w-full bg-neutral-950 text-green-400 font-mono flex flex-row">
      {/* Left Sidebar */}
      <aside className="w-64 min-w-48 max-w-xs border-r border-neutral-800 bg-neutral-900 flex flex-col p-4">
        <div className="mb-6">
          <h2 className="text-green-300 text-lg font-bold border-b border-green-900 pb-1 mb-2 uppercase tracking-widest">Location</h2>
          <div>
            <div className="text-blue-300 font-semibold">{encounter?.name || "No Encounter"}</div>
            <div className="text-green-400 text-sm mt-1">{encounter?.description || "Start the tutorial to begin."}</div>
          </div>
        </div>
        <div className="mt-auto text-xs text-neutral-500">[Resize handle]</div>
      </aside>

      {/* Main Terminal Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-black border-x border-neutral-800 h-screen">
        <header className="px-6 py-2 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <span className="text-green-300 font-bold tracking-widest text-lg">NETBREAKER</span>
          <span className="text-xs text-neutral-500">[Resize handle]</span>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          <Terminal />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-72 min-w-56 max-w-sm border-l border-neutral-800 bg-neutral-900 flex flex-col p-4">
        {/* Party Section */}
        <div className="mb-6">
          <h2 className="text-blue-300 text-lg font-bold border-b border-blue-900 pb-1 mb-2 uppercase tracking-widest">Party</h2>
          {party.map((member) => (
            <div key={member.id} className="mb-3 p-2 rounded bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between">
              <span className="font-semibold text-green-300">
                {member.name}
                {member.isPlayer && (
                  <span className="ml-1 text-xs text-green-500">(you)</span>
                )}
              </span>
                <span className="text-xs text-green-400">{member.class}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-400">Integrity:</span>
                <span className="text-green-200 font-bold">{member.integrity}%</span>
              </div>
              <div className="flex gap-2 mt-1">
                {member.subsystems.map((ss) => (
                  <span key={ss} className="text-xs px-2 py-0.5 bg-green-900 text-green-300 rounded font-mono uppercase">{ss}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Foes Section */}
        <div>
          <h2 className="text-red-400 text-lg font-bold border-b border-red-900 pb-1 mb-2 uppercase tracking-widest">Detected Foes</h2>
          {foes.length === 0 && <div className="text-neutral-500 text-sm">No foes detected.</div>}
          {foes.map((foe) => (
            <div key={foe.id} className="mb-3 p-2 rounded bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-300">
                  {foe.name}
                  {target && foe.name.toLowerCase() === target.toLowerCase() && (
                    <span className="ml-2" title="Targeted">🎯</span>
                  )}
                </span>
                <span className="text-xs text-neutral-400">{foe.class}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-red-400">Integrity:</span>
                <span className="text-red-200 font-bold">{foe.integrity}%</span>
              </div>
              <div className="flex gap-2 mt-1">
                {foe.status.map((status) => (
                  <span key={status} className="text-xs px-2 py-0.5 bg-red-900 text-red-300 rounded font-mono uppercase">{status}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto text-xs text-neutral-500">[Resize handle]</div>
      </aside>
    </div>
  );
}
