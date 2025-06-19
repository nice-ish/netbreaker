import React, { useState, useEffect } from "react"
import { useGameStore, exploitAction } from "../state/useGameStore"
import { calculateDamage } from "../state/useGameStore"
import { tutorialEncounter } from "../data/tutorialEncounter"

const POSSIBLE_COMMANDS = ["start", "status", "scan", "target", "exploit", "patch", "branch", "merge", "rebase", "who"]
const NON_TURN_COMMANDS = new Set(["start", "status", "scan", "target", "who"])


function LogLine({ line }: { line: string }) {
  let className = ""
  let display = line

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
  } else if (line.startsWith(">") || line.includes("set::") || line.includes("usage::") || line.includes("error::")) {
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
  const advanceTurn = useGameStore((s) => s.nextTurn)
  const addPartyMember = useGameStore((s) => s.addPartyMember)

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
        useGameStore.getState().performAction(player, foe, exploitAction)
        useGameStore.getState().nextTurn()
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
        break
      }
      case "branch":
        pushLog("branch:: timeline checkpoint created")
        advanceTurn()
        break
      case "merge":
        pushLog("merge:: committed timeline")
        advanceTurn()
        break
      case "rebase":
        pushLog("rebase:: reverted to previous checkpoint")
        advanceTurn()
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
        if (!NON_TURN_COMMANDS.has(command)) {
          advanceTurn()
        }
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
    <div className="bg-black text-green-400 font-mono flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 p-4">
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

      <div className="sticky bottom-0 bg-black z-20 border-t border-green-900 p-4">
        <form onSubmit={handleInput} className="mb-2">
          <div className="relative">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-black border border-green-700 text-green-400 p-2 outline-none relative z-10 font-mono"
              placeholder=">"
              style={{ position: 'relative', background: 'transparent' }}
            />
            {suggestion && input && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center px-2 pointer-events-none select-none z-0 whitespace-pre font-mono"
                style={{ color: 'rgba(34,197,94,0.6)' }}
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
