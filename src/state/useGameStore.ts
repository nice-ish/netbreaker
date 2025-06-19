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
  performAction: (attacker: Character, defender: Character, action: Action) => void
  advanceTurn: () => void
  enemyTurn: () => void
}

export function calculateDamage(attacker: Character, type: 'exploit' | 'force' | 'crash'): number {
  switch (type) {
    case 'exploit':
      return 15 + attacker.stats.logic * 5
    case 'force':
      return 20 + attacker.stats.force * 6
    case 'crash':
      return 10 + attacker.stats.force * 3
    default:
      return 10
  }
}

// Dice roll utility
function rollDice(sides: number = 20, modifier: number = 0): { roll: number, total: number } {
  const roll = Math.ceil(Math.random() * sides);
  return { roll, total: roll + modifier };
}

type Stat = 'logic' | 'force' | 'stability' | 'speed';

export interface Action {
  name: string;
  attackStat: Stat;
  defenseStat: Stat;
  resolve: (attacker: Character, defender: Character) => ActionResult;
}

interface ActionResult {
  attackerRoll: number;
  attackerTotal: number;
  defenderRoll: number;
  defenderTotal: number;
  hit: boolean;
  damage: number;
  log: string;
}

// Example actions
export const exploitAction: Action = {
  name: 'exploit',
  attackStat: 'logic',
  defenseStat: 'stability',
  resolve(attacker, defender) {
    const atkMod = attacker.stats.logic;
    const defMod = defender.stats.stability;
    const atk = rollDice(20, atkMod);
    const def = rollDice(20, defMod);
    const hit = atk.total > def.total;
    const damage = hit ? 20 + atkMod : 0;
    return {
      attackerRoll: atk.roll,
      attackerTotal: atk.total,
      defenderRoll: def.roll,
      defenderTotal: def.total,
      hit,
      damage,
      log: `${attacker.name} rolls ${atk.roll}+${atkMod} (${atk.total}) vs ${defender.name} ${def.roll}+${defMod} (${def.total}) — ${hit ? `HIT for ${damage}` : 'MISS'}`
    };
  }
};

export const thumpAction: Action = {
  name: 'thump',
  attackStat: 'force',
  defenseStat: 'stability',
  resolve(attacker, defender) {
    const atkMod = attacker.stats.force;
    const defMod = defender.stats.stability;
    const atk = rollDice(20, atkMod);
    const def = rollDice(20, defMod);
    const hit = atk.total > def.total;
    const damage = hit ? 10 + atkMod : 0;
    return {
      attackerRoll: atk.roll,
      attackerTotal: atk.total,
      defenderRoll: def.roll,
      defenderTotal: def.total,
      hit,
      damage,
      log: `${attacker.name} rolls ${atk.roll}+${atkMod} (${atk.total}) vs ${defender.name} ${def.roll}+${defMod} (${def.total}) — ${hit ? `HIT for ${damage}` : 'MISS'}`
    };
  }
};

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

    if (actor.isPlayer) return

    const player = get().player
    const party = get().party
    const enemies = get().encounter?.enemies || []
    const targets = [player, ...party].filter(t => t.integrity > 0)

    if (actor.name === 'Training Dummy') {
        const target = targets[Math.floor(Math.random() * targets.length)]

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
            isPlayer: false,
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
          setTimeout(() => {
            const currentOrder = get().turnOrder
            get().pushLog(`dm:: Updated turn order: ${currentOrder.map(c => c.name).join(' → ')}`)
          }, 3500)


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
        const damage = calculateDamage(actor, "force")
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

  performAction: (attacker: Character, defender: Character, action: Action) => {
    const result = action.resolve(attacker, defender);
    set((state) => {
      // Update defender integrity if hit
      if (result.hit) {
        if (defender.isPlayer) {
          return {
            player: { ...state.player, integrity: Math.max(0, state.player.integrity - result.damage) },
            log: [...state.log, `dm:: ${result.log}`],
          };
        } else {
          // Find and update the correct enemy
          const updatedEnemies = state.encounter?.enemies.map((enemy) =>
            enemy.name === defender.name ? { ...enemy, integrity: Math.max(0, enemy.integrity - result.damage) } : enemy
          ) || [];
          return {
            encounter: state.encounter ? { ...state.encounter, enemies: updatedEnemies } : null,
            log: [...state.log, `dm:: ${result.log}`],
          };
        }
      }
      // Log even if miss
      return { log: [...state.log, `dm:: ${result.log}`] };
    });
  },

  advanceTurn: () => set((state) => {
    if (!state.encounter) return state;
    return {
      encounter: {
        ...state.encounter,
        turn: state.encounter.turn + 1,
      },
    };
  }),

  enemyTurn: () => {
    const state = get();
    const foe = state.encounter?.enemies[0];
    if (foe && foe.integrity > 0) {
      state.performAction(foe, state.player, thumpAction);
      get().advanceTurn();
    }
  },
}))
