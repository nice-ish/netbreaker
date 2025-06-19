import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { useGameStore, exploitAction } from "../state/useGameStore"
import { calculateDamage } from "../state/useGameStore"
import { tutorialEncounter } from "../data/tutorialEncounter"

const POSSIBLE_COMMANDS = ["start", "status", "scan", "target", "exploit", "patch", "branch", "merge", "rebase", "who"]
const NON_TURN_COMMANDS = new Set(["start", "status", "scan", "target", "who"])


function LogLine({ line }: { line: string }): React.ReactElement {
  let className = ""
  let display: React.ReactNode = line

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
        // Highlight dice roll: bold the roll, color the modifier
        const diceMatch = message.match(/(\w+) rolls (\d+)\+([\d-]+) \((\d+)\) vs (\w+) (\d+)\+([\d-]+) \((\d+)\)/)
        if (diceMatch) {
          const [_, actor, roll, mod, total, defender, defRoll, defMod, defTotal] = diceMatch
          display = <span>
            <span className="font-bold text-nb-accent">{actor} rolls </span>
            <span className="font-bold text-white">{roll}</span>
            <span className="font-bold text-purple-400">+{mod}</span>
            <span className="text-nb-subtext"> ({total})</span>
            <span className="text-nb-subtext"> vs </span>
            <span className="font-bold text-nb-accent">{defender} </span>
            <span className="font-bold text-white">{defRoll}</span>
            <span className="font-bold text-purple-400">+{defMod}</span>
            <span className="text-nb-subtext"> ({defTotal})</span>
          </span>
          className = "text-yellow-300"
        } else {
          className = "text-yellow-300"
          display = message
        }
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
  const setScanned = useGameStore((s) => s.setScanned)
  const scanned = useGameStore((s) => s.scanned)
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const turnOrder = useGameStore((s) => s.turnOrder);
  const currentActor = turnOrder && currentTurnIndex >= 0 ? turnOrder[currentTurnIndex] : null;

  const allChars = [player, ...party, ...(encounter?.enemies || [])]

  // Add state for dice animation
  const [diceAnimating, setDiceAnimating] = useState<null | {
    logIndex: number;
    actor: string;
    roll: number;
    mod: number;
    total: number;
    defender: string;
    defRoll: number;
    defMod: number;
    defTotal: number;
  }>(null);

  // Typewriter animation effect for log
  const typingTimeout = useRef<number | null>(null)
  useEffect(() => {
    if (displayedLog.length === log.length) return
    setLogIsAnimating(true)
    // Animate only the latest entry
    const prev = log.slice(0, -1)
    const full = log[log.length - 1] || ""
    let i = 0

    // Dice roll animation detection
    const diceMatch = full.match(/^(.*?) rolls (\d+)\+([\d-]+) \((\d+)\) vs (.*?) (\d+)\+([\d-]+) \((\d+)\)/)
    if (diceMatch) {
      const [_, actor, roll, mod, total, defender, defRoll, defMod, defTotal] = diceMatch
      let animFrame = 0;
      let animRoll = 0;
      function animateDice() {
        animRoll = Math.floor(Math.random() * 20) + 1;
        setDisplayedLog([...prev, `${actor} rolls ${animRoll} +${mod} ...`]);
        animFrame++;
        if (animFrame < 18) {
          typingTimeout.current = window.setTimeout(animateDice, 40 + Math.random() * 30);
        } else {
          setDisplayedLog([...prev, full]);
          setLogIsAnimating(false);
        }
      }
      animateDice();
      return () => { if (typingTimeout.current) { clearTimeout(typingTimeout.current); } };
    }

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

    // Always refocus the input after submit
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    if (!command) return

    switch (command) {
      case "start":
        start(tutorialEncounter)
        setScanned(false)
        pushLog("dm:: You're connected. Recommended first step: scan for hostiles.")
        break
      case "status":
        pushLog(`integrity:: ${player.integrity}%`)
        break
      case "scan":
        setScanning(true)
        pushLog("dm:: Scanning...")
        setTimeout(() => {
          setScanning(false)
          setScanned(true)
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
  if (!encounter) {
    availableList = ["start"]
  } else if (cmd === "target") {
    availableList = allChars.map(c => c.name)
  } else {
    availableList = POSSIBLE_COMMANDS
  }

  // Handler for clicking available buttons
  const inputRef = useRef<HTMLInputElement | null>(null)
  const handleAvailableClick = (item: string) => {
    if (cmd === "target") {
      setInput(`target ${item.toLowerCase()}`)
    } else {
      setInput(item)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedLog]);

  // For mobile command overflow
  const [showDropdown, setShowDropdown] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const MAX_MOBILE_COMMANDS = 3;
  const visibleCommands = isMobile ? availableList.slice(0, MAX_MOBILE_COMMANDS) : availableList;
  const overflowCommands = isMobile ? availableList.slice(MAX_MOBILE_COMMANDS) : [];

  // Mobile overlays for party and targets
  const [showParty, setShowParty] = useState(false);
  const [showTargets, setShowTargets] = useState(false);

  return (
    <div className={`bg-nb-400 text-nb-text font-mono flex-1 flex flex-col h-full min-w-0 relative overflow-hidden ${scanning ? 'animate-pulse bg-green-950' : ''}`}>
      {encounter && (
      <div className="sticky top-0 bg-nb-500 z-20  p-4 animate-move-down transition-transform duration-800">
        
        
          <div className="flex space-x-2 text-xs text-nb-subtext font-mono uppercase items-center">
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse duration-200" />
            <div className="flex flex-wrap gap-1 items-center">{encounter?.name}</div>
            <div className="text-xs text-nb-subtext">|</div>
            <div className="flex flex-wrap gap-1 items-center">{encounter?.description}</div>
        </div>
      </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-1 p-4 border-t border-nb-border">

        <p>Welcome to Netbreaker. Type <code>start</code> to begin tutorial.</p>

        {encounter && (
          <>
            

            {displayedLog.map((line, i) => (
              <React.Fragment key={i}>
                <LogLine line={line} />
              </React.Fragment>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-nb-500 z-20 border-t border-nb-border p-4 ">
        {/* Mobile-only party/targets buttons and overlays */}
        <div className="flex gap-2 mb-2 md:hidden items-center">
          <button
            type="button"
            className="flex items-center text-xs px-3 py-1 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-100 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent"
            onClick={() => setShowParty(true)}
          >
            Party
            <span className="flex -space-x-2 ml-2">
              {[player, ...party].map(c => {
                const isCurrentTurn = currentActor?.id === c.id;
                const isTargeted = currentActor ? targets[currentActor.id]?.toLowerCase() === c.name.toLowerCase() : false;
                return (
                  <span 
                    key={c.id} 
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-nb-text text-xs font-bold
                      ${isCurrentTurn ? 'border-2 border-yellow-400 bg-nb-300' : 'border border-nb-border bg-nb-200'}
                      ${isTargeted ? 'border-2 border-dashed border-yellow-400' : ''}
                      transition-all duration-200
                    `}
                  >
                    {c.name.charAt(0)}
                  </span>
                );
              })}
            </span>
          </button>
          <button
            type="button"
            className="text-xs px-3 py-1 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-100 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent flex items-center gap-1"
            onClick={() => setShowTargets(true)}
          >
            Targets
            <span className="flex -space-x-2 ml-2 items-center">
              {(encounter?.enemies || []).map(e => {
                const isCurrentTurn = currentActor?.id === e.id;
                const isTargeted = currentActor ? targets[currentActor.id]?.toLowerCase() === e.name.toLowerCase() : false;
                return (
                  <span 
                    key={e.id} 
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-nb-text text-xs font-bold
                      ${isCurrentTurn ? 'border-2 border-yellow-400 bg-nb-300' : 'border border-nb-border bg-nb-200'}
                      ${isTargeted ? 'border-2 border-dashed border-yellow-400' : ''}
                      transition-all duration-200
                    `}
                  >
                    {e.name.charAt(0)}
                  </span>
                );
              })}
            </span>
          </button>
        </div>
        {/* Party overlay */}
        {showParty && (
          <div className="fixed inset-0 z-40 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowParty(false)} />
            <div className="relative w-full bg-nb-400 border-t border-nb-border rounded-t-lg p-4 max-h-2/3 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-nb-accent uppercase text-xs">Party</span>
                <button onClick={() => setShowParty(false)} className="text-nb-subtext text-lg font-bold">×</button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-mono text-nb-text text-xs mb-1">{player.name} (You) — {player.integrity}/{player.maxIntegrity}</div>
                {party.map((member) => (
                  <div key={member.id} className="font-mono text-nb-text text-xs">
                    {member.name} — {member.integrity}/{member.maxIntegrity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Targets overlay */}
        {showTargets && (
          <div className="fixed inset-0 z-40 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowTargets(false)} />
            <div className="relative w-full bg-nb-400 border-t border-nb-border rounded-t-lg p-4 max-h-2/3 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-nb-accent uppercase text-xs">Targets</span>
                <button onClick={() => setShowTargets(false)} className="text-nb-subtext text-lg font-bold">×</button>
              </div>
              <div className="flex flex-col gap-2">
                {encounter && encounter.enemies.length > 0 ? (
                  encounter.enemies.map((enemy) => (
                    <div key={enemy.id} className="font-mono text-nb-text text-xs">
                      {enemy.name} — {enemy.integrity}/{enemy.maxIntegrity}
                    </div>
                  ))
                ) : (
                  <div className="text-nb-subtext text-xs">No targets detected.</div>
                )}
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleInput} className="mb-2">
          <div className="relative w-full">
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="shadow-nb-accent w-full bg-nb-500 border border-nb-border text-nb-text p-2 pr-14 outline-none font-mono rounded-lg transition-colors hover:bg-nb-100 hover:text-nb-accent focus:ring-2 focus:ring-purple-400"
              placeholder=">"
              style={{ background: 'transparent' }}
            />
            <button
              type="submit"
              tabIndex={0}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-100 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent flex items-center z-20"
              style={{ height: '28px' }}
              aria-label="Submit command"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 rotate-270">
                <path fillRule="evenodd" d="M3.293 9.293a1 1 0 011.414 0L9 13.586V4a1 1 0 112 0v9.586l4.293-4.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {suggestion && input && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center px-2 pointer-events-none select-none z-0 whitespace-pre font-mono"
                
              >
                <span className="invisible">{input}</span>
                <span className="opacity-60">
                  {suggestion.slice(input.split(" ").slice(-1)[0].length)}
                  <span className="ml-2 text-xs text-nb-subtext">[⇥]</span>
                </span>
              </div>
            )}
          </div>
        </form>
        <div className="text-xs text-nb-text font-mono uppercase">
          {/* Dropdown for overflow commands (mobile only) */}
          {showDropdown && overflowCommands.length > 0 && (
            <div className="absolute bottom-14 left-0 w-full z-30 bg-nb-500 border border-nb-border rounded-lg shadow-lg p-2 flex flex-col gap-1 md:hidden">
              {overflowCommands.map((item, idx) => (
                <button
                  key={item + idx}
                  type="button"
                  tabIndex={0}
                  className="text-xs px-2 py-0.5 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-400 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent"
                  onClick={() => {
                    handleAvailableClick(item);
                    setShowDropdown(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-1 items-center flex-wrap md:flex-wrap pb-1 relative">available::{" "}
            {visibleCommands.map((item, idx) => (
              <button
                key={item + idx}
                type="button"
                tabIndex={0}
                className="text-xs px-2 py-0.5 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-400 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent"
                onClick={() => handleAvailableClick(item)}
              >
                {item}
              </button>
            ))}
            {overflowCommands.length > 0 && (
              <button
                type="button"
                tabIndex={0}
                className="text-xs px-2 py-0.5 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border transition-colors hover:bg-nb-400 hover:text-nb-accent focus:outline-none focus:ring-2 focus:ring-nb-accent flex items-center md:hidden"
                onClick={() => setShowDropdown((v) => !v)}
                aria-label="Show more commands"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

