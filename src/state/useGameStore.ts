import { create } from 'zustand'

interface Character {
  id: string
  name: string
  class: string
  integrity: number
  stats: {
    intellect: number
    precision: number
    willpower: number
  }
  subsystems: string[]
  status: string[]
}

interface Encounter {
  id: string
  name: string
  enemies: Character[]
  description: string
  turn: number
}

interface GameState {
    log: string[]
    player: Character
    encounter: Encounter | null
    inBranch: boolean
    branchState: GameState | null
    target: string | null
    setTarget: (name: string) => void
    updateEnemy: (name: string, changes: Partial<Character>) => void
    updatePlayer: (changes: Partial<Character>) => void

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

    player: {
        id: 'user-1',
        name: 'Root',
        class: 'Promptweaver',
        integrity: 100,
        stats: { intellect: 4, precision: 3, willpower: 2 },
        subsystems: ['Exploit', 'Patch', 'Branch', 'Merge'],
        status: [],
    },

  encounter: null,

  pushLog: (entry) => set((state) => ({ log: [...state.log, entry] })),

  startEncounter: (encounter) => set({ encounter, log: [], inBranch: false, branchState: null }),

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