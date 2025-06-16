# 🧠 Stack Depth Constraint System

Each action adds to a character’s **Stack Depth** — a measure of cognitive or system strain. When Stack exceeds a class-specific threshold (typically 10), the character becomes **Overloaded**, triggering penalties and limiting their combat options.

## Overflow State
When a character enters **Overloaded**:
- They lose access to advanced subsystems
- Some commands fail or backfire
- They take bonus damage from Logic-based attacks
- Stack cannot be reduced for 1 full turn unless mitigated

## Recovery Paths & Overflow Penalties by Class

### 🛠️ Brute
- **Primary Stack Mitigation**: Success-based. Moves like `Crash` and `System Slam` reduce stack **only if they hit**.
- **Penalty on Overflow**:
  - Loses access to `Force` and `Crash`
  - Chance to self-stagger when attacking
- **Playstyle**: Momentum-dependent. Misses punish hard.

### 🧘 Devout
- **Primary Stack Mitigation**: `Loop Lock` and `Invoke Commandment` reduce stack passively when triggered.
- **Bonus**: `Sanctified Loop` heals and partially clears stack when below 30% Integrity.
- **Penalty on Overflow**:
  - Cannot trigger passive effects
  - `Patch` heals are halved
- **Playstyle**: Sustain/control. Stack needs regular offloading.

### 🧠 Cypherpunk
- **Primary Stack Mitigation**: `Decrypt` and `Fork Bomb` split or delay stack buildup.
- **Bonus**: `Hidden Process` nullifies the **first** overflow penalty per encounter.
- **Penalty on Overflow**:
  - Logic-based actions (like `Exploit`, `Hijack`) become unstable (50% chance of failure)
  - Loses stealth-based buffs
- **Playstyle**: Risk-aware, burst-heavy with backdoor safety.

### 🧑‍💻 Promptweaver
- **Primary Stack Mitigation**: `Simulate` previews stack cost; `Prompt Braid` reduces stack cost by combining actions.
- **Bonus**: `Multi-thread` increases stack threshold by +3 for 2 turns.
- **Penalty on Overflow**:
  - Cannot use `Multi-thread` or `Prompt Braid`
  - Action previews become unavailable
- **Playstyle**: High-precision. Careful sequencing is essential.

