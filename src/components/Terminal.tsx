import React, { useState, useEffect, useRef } from "react"
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
      if (message.includes("rolls") && message.includes("vs")) {
        className = "text-yellow-300"
        display = message
      } else if (message.toLowerCase().includes("success!")) {
        className = "text-green-400 font-bold"
        display = message
      } else if (message.toLowerCase().includes("failed!")) {
        className = "text-red-400 font-bold"
        display = message
      } else {
        className = "text-purple-400"
        display = message
      }
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
  const [scanning, setScanning] = useState(false)
  const [displayedLog, setDisplayedLog] = useState<string[]>([])
  const [logIsAnimating, setLogIsAnimating] = useState(false)
  const [turnQueue, setTurnQueue] = useState<(() => void)[]>([])
  const party = useGameStore((s) => s.party)
  const encounter = useGameStore((s) => s.encounter)
  const log = useGameStore((s) => s.log)
  const player = useGameStore((s) => s.player)
  const start = useGameStore((s) => s.startEncounter)
  const pushLog = useGameStore((s) => s.pushLog)
  const setTarget = useGameStore((s) => s.setTarget)
  const updatePlayer = useGameStore((s) => s.updatePlayer)
  const nextTurn = useGameStore((s) => s.nextTurn)
  const addPartyMember = useGameStore((s) => s.addPartyMember)
  const targets = useGameStore((s) => s.targets)

  const allChars = [player, ...party, ...(encounter?.enemies || [])]

  // Typewriter animation effect for log
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (displayedLog.length === log.length) return
    setLogIsAnimating(true)
    // Animate only the latest entry
    const prev = log.slice(0, -1)
    const full = log[log.length - 1] || ""
    let i = 0
    function typeNext() {
      setDisplayedLog([...prev, full.slice(0, i)])
      if (i < full.length) {
        typingTimeout.current = setTimeout(typeNext, 4 + Math.random() * 16)
        i++
      } else {
        setDisplayedLog([...prev, full])
        setLogIsAnimating(false)
      }
    }
    typeNext()
    return () => { if (typingTimeout.current) { clearTimeout(typingTimeout.current); } };
  }, [log])

  // When log animation finishes, process the next turn in the queue
  useEffect(() => {
    if (!logIsAnimating && turnQueue.length > 0) {
      const [next, ...rest] = turnQueue;
      if (typeof next === 'function') {
        next();
        setTurnQueue(rest);
      }
    }
  }, [logIsAnimating, turnQueue]);

  // Expose a function for the store to request the next turn
  (window as any).requestNextTurn = (fn: () => void) => {
    setTurnQueue(q => [...q, fn])
  }

  useEffect(() => {
    pushLog("dm:: Netspace interface initialised. Awaiting protocol engagement.")
  }, [])

  const handleInput = (e: React.FormEvent) => {
    e.preventDefault()

    const raw = input.trim()
    const [cmd, ...argParts] = raw.split(" ")
    const command = cmd.toLowerCase()
    const argument = argParts.join(" ").toLowerCase()

    // Echo user input to the log
    pushLog(`> ${raw}`)

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
        setScanning(true)
        pushLog("dm:: Scanning...")
        setTimeout(() => {
          setScanning(false)
          if (encounter) {
            const foes = encounter.enemies?.map(f => `${f.name} (${f.integrity}%)`).join(", ")
            pushLog(foes ? `foes:: ${foes}` : "no foes detected")
          } else {
            pushLog("no encounter active")
          }
        }, 2500)
        break
      case "target":
        if (argument) {
          const validTarget = allChars.find(f => f.name.toLowerCase() === argument)
          if (validTarget && validTarget.integrity > 0) {
            setTarget(player.id, validTarget.name)
            pushLog(`target set:: ${validTarget.name}`)
          } else {
            pushLog("target not found or already destroyed")
          }
        } else {
          pushLog("usage:: target <character>")
        }
        break
      case "who":
        if (targets[player.id]) {
          const char = allChars.find(f => f.name.toLowerCase() === targets[player.id].toLowerCase())
          const integrity = char ? ` (${char.integrity}%)` : ""
          pushLog(`target:: ${targets[player.id]}${integrity}`)
        } else {
          pushLog("target:: none")
        }
        break
      case "exploit": {
        if (!targets[player.id]) return pushLog("error:: no target selected")
        const foe = encounter?.enemies.find(f => f.name.toLowerCase() === targets[player.id].toLowerCase())
        if (!foe || foe.integrity <= 0) return pushLog("error:: target already destroyed")
        useGameStore.getState().performAction(player, foe, exploitAction, nextTurn)
        break
      }
      case "patch": {
        if (!targets[player.id]) return pushLog("error:: no target selected")
        const char = allChars.find(f => f.name.toLowerCase() === targets[player.id].toLowerCase())
        if (!char) return pushLog("error:: can only patch yourself or party members")
        if (char.integrity >= char.maxIntegrity) {
          pushLog("patch:: integrity already full")
        } else {
          const heal = 20
          const newIntegrity = Math.min(char.maxIntegrity, char.integrity + heal)
          if (char.id === player.id) {
            updatePlayer({ integrity: newIntegrity })
          } else {
            const updatedParty = party.map(p =>
              p.id === char.id ? { ...p, integrity: newIntegrity } : p
            )
            useGameStore.setState({ party: updatedParty })
          }
          pushLog(`${char.name}::patch:: +20 integrity`)
        }
        nextTurn()
        break
      }
      case "branch":
        pushLog("branch:: timeline checkpoint created")
        nextTurn()
        break
      case "merge":
        pushLog("merge:: committed timeline")
        nextTurn()
        break
      case "rebase":
        pushLog("rebase:: reverted to previous checkpoint")
        nextTurn()
        break
      default:
        if (POSSIBLE_COMMANDS.includes(command) && argument) {
          pushLog(`${command}:: targeting ${argument}`)
        } else if (POSSIBLE_COMMANDS.includes(command)) {
          if (targets[player.id]) {
            pushLog(`${command}:: using stored target ${targets[player.id]}`)
          } else {
            pushLog("error:: no target specified")
          }
        } else {
          pushLog("unknown:: command not recognized")
        }
        if (!NON_TURN_COMMANDS.has(command)) {
          nextTurn()
        }
    }
  }

  // Suggestion logic for autocomplete (no dropdown)
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

    if (cmd === "target") {
      const matches = allChars
        .filter(char => char.name.toLowerCase().startsWith(arg) && char.name.toLowerCase() !== arg)
        .map(char => char.name.toLowerCase())
      setSuggestion(matches[0] || "")
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
  }, [input, party, player, encounter])

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

      if (cmd === "target" && suggestion) {
        setInput(`target ${suggestion}`)
        setSuggestion("")
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

  // Dynamic available:: section
  let availableList: string[] = []
  const raw = input.toLowerCase()
  const [cmd] = raw.split(" ")
  if (cmd === "target") {
    availableList = allChars.map(c => c.name)
  } else {
    availableList = POSSIBLE_COMMANDS
  }

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedLog]);

  return (
    <div className={`bg-black text-green-400 font-mono flex-1 flex flex-col h-full min-w-0 relative overflow-hidden ${scanning ? 'animate-pulse bg-green-950' : ''}`}>
      <div className="flex-1 overflow-y-auto space-y-1 p-4">
        {!encounter && <p>Welcome to Netbreaker. Type <code>start</code> to begin tutorial.</p>}

        {encounter && (
          <>
            <p><strong>{encounter.name}</strong></p>
            <p>{encounter.description}</p>
            <p>turn::{encounter.turn}</p>
            <hr className="border-green-700 my-2" />
            {displayedLog.map((line, i) => (
              <LogLine key={i} line={line} />
            ))}
            <div ref={logEndRef} />
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
          <p>available:: {availableList.join(" | ")}</p>
        </div>
      </div>
    </div>
  )
}

