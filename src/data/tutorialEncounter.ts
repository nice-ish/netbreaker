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
      class: "None",
      integrity: 100,
      stats: { intellect: 0, precision: 0, willpower: 0 },
      subsystems: [],
      status: ["passive"],
    },
  ],
}
