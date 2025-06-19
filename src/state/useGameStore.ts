import { create } from 'zustand'


interface Character {
  id: string
  name: string
  class: string
  integrity: number
  maxIntegrity: number
  isPlayer?: boolean
  avatar: string
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
    targets: { [characterId: string]: string }
    setTarget: (characterId: string, targetName: string) => void
    pushLog: (entry: string) => void
    startEncounter: (encounter: Encounter) => void
    resetGame: () => void
    createBranch: () => void
    rebase: () => void
    merge: () => void
  hasSummonedBash: boolean
  performAction: (attacker: Character, defender: Character, action: Action, nextTurn: () => void) => void
  advanceTurn: () => void
  enemyTurn: () => void
  bashHasTargeted: boolean
  updatePlayer: (changes: Partial<Character>) => void
  nextTurn: () => void
  turnOrder: Character[]
  currentTurnIndex: number
  scanned: boolean
  setScanned: (scanned: boolean) => void
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
  getSummary?: (hit: boolean, damage: number, attacker: Character, defender: Character) => string;
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
  },
  getSummary: (hit, damage, attacker, defender) =>
    hit
      ? `A weakness in the code was exploited. -${damage} to ${defender.name}'s code integrity.`
      : `Exploit attempt failed. ${defender.name}'s defenses held.`
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
  },
  getSummary: (hit, damage, attacker, defender) =>
    hit
      ? `A direct hit! ${attacker.name} thumped ${defender.name} for -${damage} integrity.`
      : `Thump missed. ${defender.name} evaded the attack.`
};

export const forceAction: Action = {
  name: 'force',
  attackStat: 'force',
  defenseStat: 'stability',
  resolve(attacker, defender) {
    const atkMod = attacker.stats.force;
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
  },
  getSummary: (hit, damage, attacker, defender) =>
    hit
      ? `Forceful breach! ${attacker.name} overpowered ${defender.name} for -${damage} integrity.`
      : `Force attack failed. ${defender.name} resisted the breach.`
};

export const useGameStore = create<GameState>((set, get) => ({
  targets: {},
  setTarget: (characterId: string, targetName: string) => set((state) => ({
    targets: { ...state.targets, [characterId]: targetName }
  })),
    log: [],
    inBranch: false,
    branchState: null,
  party: [],
  hasSummonedBash: false,
  bashHasTargeted: false,
    player: {
        id: 'user-1',
        name: 'Root',
        class: 'Promptweaver',
        integrity: 100,
        maxIntegrity: 100,
        isPlayer: true,
        avatar: 'RT',
        stats: { logic: 4, force: 3, stability: 2, speed: 2 },
        subsystems: ['Exploit', 'Patch', 'Branch', 'Merge'],
        status: [],
    },
  encounter: null,
  turnOrder: [],
  currentTurnIndex: -1,
  scanned: false,
  setScanned: (scanned: boolean) => set({ scanned }),

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
        get().performAction(actor, target, thumpAction, get().nextTurn)

        if (!get().hasSummonedBash) {
          const bash: Character = {
            id: 'bash-1',
            name: 'Bash',
            class: 'Brute',
            integrity: 100,
            maxIntegrity: 100,
            isPlayer: false,
            avatar: 'B',
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

          // Set Bash's target to the first living enemy
          const firstEnemy = enemies.find(e => e.integrity > 0)
          if (firstEnemy) {
            get().setTarget(bash.id, firstEnemy.name)
          }

          setTimeout(() => {
            const currentOrder = get().turnOrder
            get().pushLog(`dm:: Updated turn order: ${currentOrder.map(c => c.name).join(' → ')}`)
          }, 3500)


          get().pushLog("dm:: Proximity breach detected. Unauthorized kinetic signature inbound…")
          setTimeout(() => get().pushLog("dm:: Reinforcement authorized by root protocol."), 2000)
          setTimeout(() => get().pushLog("dm:: Bash // Class: Brute // has entered the field."), 3000)
          setTimeout(() => get().pushLog("dm:: Bash joined your party."), 4000)
        }
      }
    }

    if (actor.name === 'Bash') {
      const foe = enemies.find(f => f.name.toLowerCase() === (state.targets[actor.id] || '').toLowerCase())
      if (foe && foe.integrity > 0) {
        if (!state.bashHasTargeted) {
          get().pushLog(`dm:: Bash targets ${foe.name}`)
          set({ bashHasTargeted: true })
        }
        get().performAction(actor, foe, forceAction, get().nextTurn)
      } else {
        get().pushLog("Bash::force:: no valid target")
      }
    }
  },

  resetGame: () => set((state) => ({
    encounter: null,
    log: [],
    inBranch: false,
    branchState: null,
    hasSummonedBash: false,
    bashHasTargeted: false,
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
  
  performAction: (attacker: Character, defender: Character, action: Action, nextTurn: () => void) => {
    // Log action explainer
    get().pushLog(`dm:: ${attacker.name} uses ${action.name} on ${defender.name}`);
    const result = action.resolve(attacker, defender);
    // Push dice roll log immediately
    get().pushLog(`dm:: ${result.log}`);
    // After 1s, push outcome log and queue the next turn
    setTimeout(() => {
      set((state) => {
        let newLog = [...state.log];
        const summary = action.getSummary
          ? action.getSummary(result.hit, result.damage, attacker, defender)
          : result.hit
            ? `${action.name.charAt(0).toUpperCase() + action.name.slice(1)} success! -${result.damage} integrity to ${defender.name}.`
            : `${action.name.charAt(0).toUpperCase() + action.name.slice(1)} failed! No damage to ${defender.name}.`;
        newLog = [...newLog, `dm:: ${summary}`];
        // Update defender integrity if hit
        if (result.hit) {
          if (defender.isPlayer) {
            return {
              player: { ...state.player, integrity: Math.max(0, state.player.integrity - result.damage) },
              log: newLog,
            };
          } else if (state.party.some(p => p.id === defender.id)) {
            // Update party member (including Bash)
            const updatedParty = state.party.map(p =>
              p.id === defender.id ? { ...p, integrity: Math.max(0, p.integrity - result.damage) } : p
            );
            return {
              party: updatedParty,
              log: newLog,
            };
          } else {
            // Find and update the correct enemy
            const updatedEnemies = state.encounter?.enemies.map((enemy) =>
              enemy.name === defender.name ? { ...enemy, integrity: Math.max(0, enemy.integrity - result.damage) } : enemy
            ) || [];
            return {
              encounter: state.encounter ? { ...state.encounter, enemies: updatedEnemies } : null,
              log: newLog,
            };
          }
        }
        // Log even if miss
        return { log: newLog };
      });
      if (typeof window !== 'undefined' && (window as any).requestNextTurn) {
        (window as any).requestNextTurn(nextTurn)
      } else if (nextTurn) {
        nextTurn()
      }
    }, 1000);
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
      state.performAction(foe, state.player, thumpAction, state.nextTurn);
      get().advanceTurn();
    }
  },
}))
