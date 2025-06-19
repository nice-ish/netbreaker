import React from 'react';
import Terminal from './Terminal';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import RightPanel from './RightPanel';
import { useGameStore } from '../state/useGameStore';

export default function Layout() {
  const encounter = useGameStore((s) => s.encounter);

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className="hidden md:flex flex-col min-w-0 md:w-1/4"><Sidebar /></div>
        <main className="flex flex-col min-w-0 w-full md:w-1/2">
          <Terminal />
        </main>
        {/* Animated right panel */}
        <div
          className="hidden md:flex flex-col min-w-0 md:w-1/4 transition-all duration-500 ease-in-out"
        >
          <RightPanel />
        </div>
      </div>
      <StatusBar />
    </div>
  );
} 