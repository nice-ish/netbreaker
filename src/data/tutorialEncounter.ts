import type { Encounter } from "../state/useGameStore"

export const tutorialEncounter: Encounter = {
  id: "tutorial-001",
  name: "Boot Sequence",
  description: "Training protocol active. Scan your surroundings. Learn subsystems.",
  turn: 1,
  enemies: [
    {
      id: "npc-0",
      name: "Training Dummy",
      integrity: 100,
      maxIntegrity: 100,
      stats: { logic: 0, force: 0, stability: 0, speed: 0 },
      subsystems: [],
      status: ["passive"],
    },
  ],
}
