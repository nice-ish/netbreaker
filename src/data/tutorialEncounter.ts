import { Encounter } from "../state/useGameStore"

export const tutorialEncounter: Encounter = {
  id: "tutorial-1",
  name: "Training Protocol",
  description: "A basic simulation with one dummy foe.",
  turn: 1,
  enemies: [
    {
      id: "dummy-1",
      name: "Training Dummy",
      class: "Target",
      integrity: 100,
      maxIntegrity: 100,
      isPlayer: false, // ✅ THIS IS MISSING
      stats: {
        logic: 0,
        force: 1,
        stability: 1,
        speed: 1,
      },
      subsystems: [],
      status: [],
    }
  ],  
}
