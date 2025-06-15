import React, { useState, useEffect } from "react"
import { useGameStore } from "../state/useGameStore"
import { tutorialEncounter } from "../data/tutorialEncounter"

const POSSIBLE_COMMANDS = ["start", "status", "scan", "target", "exploit", "patch", "branch", "merge", "rebase", "who"]

function LogLine({ line }: { line: string }) {
  let className = ""
  let display = line

  // New: parse for actor and action
  // Format: actor::action::message
  const parts = line.split("::")
  if (parts.length >= 3) {
    const actor = parts[0].trim()
    const action = parts[1].trim()
    const message = parts.slice(2).join("::").trim()
    if (actor.toLowerCase() === "root" || actor.toLowerCase() === "player") {
      className = "text-blue-400"
      display = `Root: ${action} ${message}`
    } else if (actor.toLowerCase() === "training dummy" || actor.toLowerCase() === "enemy") {
      className = "text-red-400"
      display = `Training Dummy: ${action} ${message}`
    } else if (actor.toLowerCase() === "dm") {
      className = "text-purple-400"
      display = message
    } else {
      className = "text-green-400"
      display = `${actor}: ${action} ${message}`
    }
  } else if (line.startsWith(">")) {
    className = "text-yellow-300"
  } else if (
    line.includes("set::") ||
    line.includes("usage::") ||
    line.includes("error::")
  ) {
    className = "text-yellow-300"
  }

  return <p className={className}>{display}</p>
}



export default function Terminal() {
  const [input, setInput] = useState("")
  const [suggestion, setSuggestion] = useState("")

  const encounter = useGameStore((s) => s.encounter)
  const log = useGameStore((s) => s.log)
  const player = useGameStore((s) => s.player)
  const start = useGameStore((s) => s.startEncounter)
  const pushLog = useGameStore((s) => s.pushLog)
  const setTarget = useGameStore((s) => s.setTarget)
  const target = useGameStore((s) => s.target)
  const updateEnemy = useGameStore((s) => s.updateEnemy)
  const updatePlayer = useGameStore((s) => s.updatePlayer)
  const advanceTurn = useGameStore((s) => s.advanceTurn)

  useEffect(() => {
    pushLog("dm:: Netspace interface initialised. Awaiting protocol engagement.")
  }, [])

  const handleInput = (e: React.FormEvent) => {
    e.preventDefault()

    const raw = input.trim()
    const [cmd, ...argParts] = raw.split(" ")
    const command = cmd.toLowerCase()
    const argument = argParts.join(" ").toLowerCase()

    setInput("")
    setSuggestion("")

    if (!command) return

    const completeEnemyTurn = () => {
      setTimeout(() => {
        simulateEnemyTurn()
      }, 300)
    }

    switch (command) {
      case "start":
        start(tutorialEncounter)
        pushLog("dm:: SYSTEM ONLINE. Training protocol initiated.")
        break
      case "status":
        pushLog(`integrity:: ${player.integrity}%`)
        break
      case "scan":
        if (encounter) {
          const foes = encounter.enemies?.map(f => `${f.name} (${f.integrity}%)`).join(", ")
          pushLog(foes ? `foes:: ${foes}` : "no foes detected")
        } else {
          pushLog("no encounter active")
        }
        break
      case "target":
        if (argument) {
          const validTarget = encounter?.enemies?.find(f => f.name.toLowerCase() === argument)
          if (validTarget && validTarget.integrity > 0) {
            setTarget(validTarget.name)
            pushLog(`target set:: ${validTarget.name}`)
          } else {
            pushLog("target not found or already destroyed")
          }
        } else {
          pushLog("usage:: target <enemy>")
        }
        break
      case "who":
        if (target) {
          const foe = encounter?.enemies.find(f => f.name.toLowerCase() === target.toLowerCase())
          const integrity = foe ? ` (${foe.integrity}%)` : ""
          pushLog(`target:: ${target}${integrity}`)
        } else {
          pushLog("target:: none")
        }
        break
      case "exploit": {
        if (!target) return pushLog("error:: no target selected")
        const foe = encounter?.enemies.find(f => f.name.toLowerCase() === target.toLowerCase())
        if (!foe || foe.integrity <= 0) return pushLog("error:: target already destroyed")

        const damage = 30
        const newIntegrity = Math.max(0, foe.integrity - damage)
        updateEnemy(foe.name, { integrity: newIntegrity })
        pushLog(`Root::exploit:: -${damage} integrity to ${foe.name}`)
        if (newIntegrity === 0) pushLog(`dm:: ${foe.name} collapses. Training sequence successful.`)
        advanceTurn()
        completeEnemyTurn()
        break
      }
      case "patch": {
        if (player.integrity >= 100) {
          pushLog("patch:: integrity already full")
        } else {
          const heal = 20
          const newIntegrity = Math.min(100, player.integrity + heal)
          updatePlayer({ integrity: newIntegrity })
          pushLog(`Root::patch:: +20 integrity`)
        }
        advanceTurn()
        completeEnemyTurn()
        break
      }
      case "branch":
        pushLog("branch:: timeline checkpoint created")
        completeEnemyTurn()
        break
      case "merge":
        pushLog("merge:: committed timeline")
        completeEnemyTurn()
        break
      case "rebase":
        pushLog("rebase:: reverted to previous checkpoint")
        completeEnemyTurn()
        break
      default:
        if (POSSIBLE_COMMANDS.includes(command) && argument) {
          pushLog(`${command}:: targeting ${argument}`)
        } else if (POSSIBLE_COMMANDS.includes(command)) {
          if (target) {
            pushLog(`${command}:: using stored target ${target}`)
          } else {
            pushLog("error:: no target specified")
          }
        } else {
          pushLog("unknown:: command not recognized")
        }
    }
  }

  const simulateEnemyTurn = () => {
    const state = useGameStore.getState()
    const foe = state.encounter?.enemies[0]
    if (foe && foe.integrity > 0) {
      const retaliation = 10
      const newIntegrity = Math.max(0, state.player.integrity - retaliation)
      state.updatePlayer({ integrity: newIntegrity })
      state.pushLog(`Training Dummy::counterattack:: hits Root for ${retaliation}`)
      state.advanceTurn()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const raw = input.toLowerCase()
      const [cmd, ...argParts] = raw.split(" ")
      const arg = argParts.join(" ")

      if (!POSSIBLE_COMMANDS.includes(cmd)) {
        const match = POSSIBLE_COMMANDS.find((c) => c.startsWith(cmd) && c !== cmd)
        if (match) {
          setInput(match)
          setSuggestion("")
        }
        return
      }

      if (encounter?.enemies && arg) {
        const match = encounter.enemies.find((enemy) =>
          enemy.name.toLowerCase().startsWith(arg) && enemy.name.toLowerCase() !== arg
        )
        if (match) {
          setInput(`${cmd} ${match.name.toLowerCase()}`)
          setSuggestion("")
        }
      }
    }
  }

  useEffect(() => {
    const raw = input.toLowerCase()
    const [cmd, ...argParts] = raw.split(" ")
    const arg = argParts.join(" ")

    if (!cmd) return

    if (!POSSIBLE_COMMANDS.includes(cmd)) {
      const match = POSSIBLE_COMMANDS.find((c) => c.startsWith(cmd) && c !== cmd)
      setSuggestion(match || "")
      return
    }

    if (encounter?.enemies && arg) {
      const match = encounter.enemies.find(enemy =>
        enemy.name.toLowerCase().startsWith(arg) && enemy.name.toLowerCase() !== arg
      )
      setSuggestion(match?.name.toLowerCase() || "")
    } else {
      setSuggestion("")
    }
  }, [input, encounter])

  const handleClickTarget = (name: string) => {
    setInput(`target ${name.toLowerCase()}`)
    setSuggestion("")
  }

  return (
    <div className="bg-black text-green-400 font-mono h-full p-4 flex flex-col relative">
      <div className="flex-1 overflow-y-auto space-y-1">
        {!encounter && <p>Welcome to Netbreaker. Type <code>start</code> to begin tutorial.</p>}

        {encounter && (
          <>
            <p><strong>{encounter.name}</strong></p>
            <p>{encounter.description}</p>
            <p>turn::{encounter.turn}</p>
            <hr className="border-green-700 my-2" />
            {log.map((line, i) => (
              <LogLine key={i} line={line} />
            ))}
          </>
        )}
      </div>

      {/* Sticky input and available commands */}
      <div className="sticky bottom-0 bg-black z-20 border-t border-green-900 pt-2 pb-2">
        <form onSubmit={handleInput} className="mb-2">
          <div className="relative">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full bg-black border border-green-700 text-green-400 p-2 outline-none relative z-10 font-mono`}
              placeholder=">"
              style={{ position: 'relative', background: 'transparent' }}
            />
            {suggestion && input && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center px-2 pointer-events-none select-none z-0 whitespace-pre font-mono"
                style={{ color: 'rgba(34,197,94,0.6)' }} // Tailwind green-600 at 60% opacity
              >
                <span className="invisible">{input}</span>
                <span className="opacity-60">
                  {suggestion.slice(input.split(" ").slice(-1)[0].length)}
                  <span className="ml-2 text-xs text-green-500">[⇥]</span>
                </span>
              </div>
            )}
          </div>
        </form>
        <div className="text-sm text-green-600">
          <p>available:: {POSSIBLE_COMMANDS.join(" | ")}</p>
          {encounter?.enemies.map((enemy) => (
            <p
              key={enemy.name}
              className="cursor-pointer underline hover:text-green-300"
              onClick={() => handleClickTarget(enemy.name)}
            >
              → {enemy.name} ({enemy.integrity}%)
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
