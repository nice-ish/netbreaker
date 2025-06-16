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
  resetGame: () => void
  createBranch: () => void
  rebase: () => void
  merge: () => void
  hasSummonedBash: boolean
}

export const useGameStore = create<GameState>((set, get) => ({
  target: null,
  setTarget: (name) => set({ target: name }),
  log: [],
  inBranch: false,
  branchState: null,
  party: [],
  hasSummonedBash: false,
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
  turnOrder: [],
  currentTurnIndex: -1,

  pushLog: (entry) => set((state) => ({ log: [...state.log, entry] })),

  addPartyMember: (member) =>
    set((state) => ({ party: [...state.party, member] })),

  startEncounter: (encounter) => {
    const { player, party, pushLog } = get()
    const allActors = [player, ...party, ...encounter.enemies]
    const sorted = allActors.sort((a, b) => b.stats.speed - a.stats.speed)

    set({
      encounter: { ...encounter, turn: 1 },
      turnOrder: sorted,
      currentTurnIndex: -1,
      hasSummonedBash: false,
    })

    pushLog(`dm:: Turn order established: ${sorted.map(c => c.name).join(' → ')}`)

    setTimeout(() => get().nextTurn(), 300)
  },

  nextTurn: () => {
    const state = get()
    let index = state.currentTurnIndex
    const order = get().turnOrder

    const getNextLivingActor = () => {
      for (let i = 0; i < order.length; i++) {
        index = (index + 1) % order.length
        const actor = order[index]
        if (actor.integrity > 0) return actor
      }
      return null
    }

    const actor = getNextLivingActor()
    if (!actor) return

    set({
      currentTurnIndex: index,
      encounter: state.encounter
        ? { ...state.encounter, turn: state.encounter.turn + 1 }
        : null,
    })

    if (actor.isPlayer) return // wait for player command

    const player = get().player
    const party = get().party
    const enemies = get().encounter?.enemies || []
    const targets = [player, ...party].filter(t => t.integrity > 0)

    if (actor.name === 'Training Dummy') {
      const target = targets[0]
      if (target) {
        const damage = 10
        const newIntegrity = Math.max(0, target.integrity - damage)

        if (target.id === player.id) {
          get().updatePlayer({ integrity: newIntegrity })
        } else {
          const updatedParty = party.map(p =>
            p.id === target.id ? { ...p, integrity: newIntegrity } : p
          )
          set({ party: updatedParty })
        }

        get().pushLog(`Training Dummy::thump:: -${damage} integrity to ${target.name}`)

        if (!get().hasSummonedBash) {
          const bash: Character = {
            id: 'bash-1',
            name: 'Bash',
            class: 'Brute',
            integrity: 100,
            maxIntegrity: 100,
            isPlayer: false, // ✅ AI-controlled
            stats: { logic: 1, force: 5, stability: 3, speed: 2 },
            subsystems: ['Force', 'Crash', 'Branch', 'Merge'],
            status: [],
          }

          const newParty = [...party, bash]
          const newOrder = [player, ...newParty, ...enemies].sort(
            (a, b) => b.stats.speed - a.stats.speed
          )
          const newIndex = newOrder.findIndex(c => c.name === actor.name)

          set({
            party: newParty,
            turnOrder: newOrder,
            currentTurnIndex: newIndex,
            hasSummonedBash: true,
          })

          get().pushLog("dm:: Proximity breach detected. Unauthorized kinetic signature inbound…")
          setTimeout(() => get().pushLog("dm:: Reinforcement authorized by root protocol."), 1000)
          setTimeout(() => get().pushLog("dm:: Bash // Class: Brute // has entered the field."), 2000)
          setTimeout(() => get().pushLog("dm:: Bash joined your party."), 3000)
        }
      }
    }

    if (actor.name === 'Bash') {
      const foe = enemies.find(f => f.name.toLowerCase() === (state.target || '').toLowerCase())
      if (foe && foe.integrity > 0) {
        const damage = 20
        const newIntegrity = Math.max(0, foe.integrity - damage)
        get().updateEnemy(foe.name, { integrity: newIntegrity })
        get().pushLog(`Bash::force:: -${damage} integrity to ${foe.name}`)
      } else {
        get().pushLog("Bash::force:: no valid target")
      }
    }

    setTimeout(() => get().nextTurn(), 1000)
  },

  resetGame: () => set((state) => ({
    encounter: null,
    log: [],
    inBranch: false,
    branchState: null,
    hasSummonedBash: false,
    player: {
      ...state.player,
      integrity: 100,
      status: [],
    },
    party: [],
    turnOrder: [],
    currentTurnIndex: -1,
  })),

  createBranch: () => set((state) => ({
    inBranch: true,
    branchState: JSON.parse(JSON.stringify(state)),
  })),

  rebase: () => {
    const branch = get().branchState
    if (branch) set(branch)
  },

  merge: () => set({ inBranch: false, branchState: null }),

  setTurnOrder: (order: Character[]) => set({ turnOrder: order }),
  getCurrentActor: () => get().turnOrder[get().currentTurnIndex],

  updateEnemy: (name, changes) =>
    set((state) => {
      if (!state.encounter) return {}
      const updatedEnemies = state.encounter.enemies.map((enemy) =>
        enemy.name === name ? { ...enemy, ...changes } : enemy
      )
      return {
        encounter: { ...state.encounter, enemies: updatedEnemies },
      }
    }),

  updatePlayer: (changes) =>
    set((state) => ({
      player: { ...state.player, ...changes },
    })),
}))
