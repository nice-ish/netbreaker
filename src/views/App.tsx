import React from "react";
import Terminal from "../components/Terminal";
import { useGameStore } from "../state/useGameStore"

export default function App() {
  const log = useGameStore((state) => state.log)
  return (
    <main className="bg-black text-green-400 min-h-screen p-4 font-mono">
      <h1 className="text-2xl text-pink-400 font-bold mb-4">
        NETBREAKER: Booting...
      </h1>
      <Terminal />
    </main>
  );
}
