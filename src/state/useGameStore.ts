import { create } from 'zustand'

interface Character {
  id: string
  name: string
  class: string
  integrity: number
  maxIntegrity: number
  isPlayer?: boolean
  stats: {
    logic: number
    force: number
    stability: number
    speed: number
  }
  subsystems: string[]
  status: string[]
}

export interface Encounter {
  id: string
  name: string
  enemies: Character[]
  description: string
  turn: number
}

interface GameState {
    log: string[]
    player: Character
    party: Character[]
    addPartyMember: (member: Character) => void
    encounter: Encounter | null
    inBranch: boolean
    branchState: GameState | null
    target: string | null
    setTarget: (name: string) => void
    updateEnemy: (name: string, changes: Partial<Character>) => void
    updatePlayer: (changes: Partial<Character>) => void
    turnOrder: Character[]
    currentTurnIndex: number
    setTurnOrder: (order: Character[]) => void
    nextTurn: () => void
    getCurrentActor: () => Character | null
    pushLog: (entry: string) => void
    startEncounter: (encounter: Encounter) => void
    advanceTurn: () => void
    resetGame: () => void
    createBranch: () => void
    rebase: () => void
    merge: () => void
}
  

export const useGameStore = create<GameState>((set, get) => ({
    target: null as string | null,
    setTarget: (name: string) => set({ target: name }),
    log: [],
    inBranch: false,
    branchState: null,
    party: [],
    player: {
        id: 'user-1',
        name: 'Root',
        class: 'Promptweaver',
        integrity: 100,
        maxIntegrity: 100,
        isPlayer: true,
        stats: { logic: 4, force: 3, stability: 2, speed: 2 },
        subsystems: ['Exploit', 'Patch', 'Branch', 'Merge'],
        status: [],
    },

  encounter: null,

  pushLog: (entry) => set((state) => ({ log: [...state.log, entry] })),
  
  addPartyMember: (member) => set((state) => ({
    party: [...state.party, member],
    })),

startEncounter: (encounter) => {
    const { player, party, pushLog } = get();
    const allActors = [player, ...party, ...encounter.enemies];
    
    const sorted = allActors.sort((a, b) => b.stats.speed - a.stats.speed);
    
    set({
        encounter,
        turnOrder: sorted,
        currentTurnIndex: 0,
    });
    
    pushLog(`dm:: Turn order established: ${sorted.map(c => c.name).join(" → ")}`);
    },
      

  advanceTurn: () => set((state) => {
    if (!state.encounter) return state
    return {
      encounter: {
        ...state.encounter,
        turn: state.encounter.turn + 1,
      },
    }
  }),

  resetGame: () => set((state) => ({
    encounter: null,
    log: [],
    inBranch: false,
    branchState: null,
    player: {
      ...state.player,
      integrity: 100,
      status: [],
    }
  })),

  createBranch: () => set((state) => ({
    inBranch: true,
    branchState: JSON.parse(JSON.stringify(state)), // deep clone
  })),

  rebase: () => {
    const branch = get().branchState
    if (branch) set(branch)
  },

  merge: () => set({ inBranch: false, branchState: null }),

  turnOrder: [] as Character[],
    currentTurnIndex: 0,

    setTurnOrder: (order: Character[]) => set({ turnOrder: order }),
    nextTurn: () => {
    const { turnOrder, currentTurnIndex } = get();
    const nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    set({ currentTurnIndex: nextIndex });
    },
    getCurrentActor: () => get().turnOrder[get().currentTurnIndex],


  // inside useGameStore
attackTarget: () => {
    set((state) => {
      if (!state.encounter || !state.target) return {}
      const enemies = state.encounter.enemies.map((enemy) => {
        if (enemy.name === state.target) {
          return { ...enemy, integrity: Math.max(0, enemy.integrity - 30) }
        }
        return enemy
      })
      return {
        encounter: { ...state.encounter, enemies },
        log: [...state.log, `exploit:: -30 integrity to ${state.target}`]
      }
    })
  },
  
  patchSelf: () => {
    set((state) => ({
      player: {
        ...state.player,
        integrity: Math.min(100, state.player.integrity + 20)
      },
      log: [...state.log, "patch:: +20 integrity"]
    }))
  },

  updateEnemy: (name: string, changes: Partial<Character>) =>
    set((state) => {
      if (!state.encounter) return {}
      const updatedEnemies = state.encounter.enemies.map((enemy) =>
        enemy.name === name ? { ...enemy, ...changes } : enemy
      )
      return {
        encounter: { ...state.encounter, enemies: updatedEnemies },
      }
    }),
  
  updatePlayer: (changes: Partial<Character>) =>
    set((state) => ({
      player: { ...state.player, ...changes },
    })),
  
  
  branchTimeline: () => set((state) => ({
    log: [...state.log, "branch:: timeline checkpoint created"]
  })),
  
  mergeTimeline: () => set((state) => ({
    log: [...state.log, "merge:: committed timeline"]
  })),
  
  rebaseTimeline: () => set((state) => ({
    log: [...state.log, "rebase:: reverted to previous checkpoint"]
  }))
  
}))