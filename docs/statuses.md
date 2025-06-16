# 🩻 Status Effects Overview

Status effects in the system affect combat, movement, or logic outcomes. Some persist over time; others expire after a set number of turns or upon a triggering event.

---

## 📍 Major Statuses

### `Flagged`
- **Effect**: The target is exposed to `Hijack` and logic-based moves. Logic defenses are weakened.
- **Duration**: 2 turns (default)
- **How to Apply**:
  - **Via Damage**: Some high-Logic attacks have a chance to apply `Flagged` on hit (e.g. `Exploit`).
  - **Via Move**: The universal utility move `Ping` applies `Flagged` directly.
    - `Ping` is available to all classes.
    - Success scales with `Logic`.
    - **Cypherpunk** and **Promptweaver** gain increased success rates due to Logic affinity.
- **Synergy**: Enables `Hijack`, improves success for other subsystem targeting.

---

### `Overloaded`
- **Effect**: Caused by exceeding your class’s **Stack Depth** threshold.
- **Consequences** (Class-specific penalties):
  - **Brute**: Forced skip next turn.
  - **Devout**: Random move cast from known abilities.
  - **Cypherpunk**: Stack wipes clean, but you take 10 true damage.
  - **Promptweaver**: Input scrambled (cannot use multi-turn or combo moves for 2 turns).
- **Cleared By**: Rest, support effects, or encounter shift.

---

### `Fragmented`
- **Effect**: Reduces Integrity restoration, disables Patch.
- **Applied By**: `Crash`, `Hijack`, some environmental traps.
- **Cured By**: `Patch`, sanctified zones, or system reboot.

---

### `Bugged`
- **Effect**: Reduces Logic-based defense and move success rate.
- **Applied By**: `Bug Injection` (Dark Hat), or `Exploit` on weak enemies.
- **Synergy**: `Exploit` deals bonus damage; increases `Flagged` chance.

---

### `Encrypted`
- **Effect**: Prevents `Hijack` and `Exploit` while active.
- **Applied By**: `Encrypt` move.
- **Duration**: 1–2 turns or until broken by Force-type moves.
- **Synergy**: Good defensive buffer when expecting logic-targeting abilities.

---

### `Traced`
- **Effect**: Prevents stealth or hidden actions; vulnerability to targeted attacks.
- **Applied By**: Security scans, some Brute zone-control effects.
- **Resisted By**: `Traceproof` (Devout Passive)

---

### `Looped`
- **Effect**: Forces repeat of previous action; limits adaptability.
- **Applied By**: Malicious zones or cursed nodes.
- **Immune With**: `Soft Loop` (Passive Subsystem)

---

