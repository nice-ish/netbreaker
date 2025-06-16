
# 🧩 Subsystems Index

## 🔧 Active Subsystems
Each active subsystem represents a tactical or offensive move.

- **Exploit** – Damage scaled by Logic; bonus vs Bugged/low-level enemies
- **Force** – Break defenses; may apply Overloaded; causes fatigue
- **Patch** – Restore Integrity and clear Fragmented
- **Hijack** – Seize control of enemy subsystems (if Flagged)
- **Crash** – AoE or single-target damage; may apply Fragmented
- **Decrypt** – Unlock terminals, dialog trees, or loot caches
- **Encrypt** – Grants Encrypted; protects from Exploit/Hijack
- **Simulate** – Preview chance of success for next move
- **Rebase** – Roll back to previous turn (requires branch)

## 🌀 Passive Subsystems
Bonuses, status resistances, or unlockables.

- **Soft Loop** – Immune to Looped
- **Ghost Thread** – Unlocks invisible traversal tiles
- **Overflow Buffer** – Survive once when Integrity hits 0
- **Commandment Invocation** – Change rules of node/zone

## Combat & Utility Moves

- **Exploit** – [Rogue, Cypherpunk] Deals bonus damage to lower-level enemies or those with `Bugged`.
- **Force** – [Brute, Devout] Heavy strike; risk of Overload or lock-in on one target.
- **Hijack** – [Dark Hat] Take control of an enemy under `Flagged`. Success scales with Logic.
- **Crash** – [Brute] Area damage; may cause `Fragmented`.
- **Patch** – [White Hat, Devout] Restore Integrity and cure negative effects.
- **Decrypt** – [Cypherpunk, White Hat] Unlock encrypted nodes or hidden dialog.
- **Encrypt** – [White Hat] Apply Encrypted; defensive buff.
- **Rebase** – [All] Roll back turn if branch exists.
- **Simulate** – [All] Preview chance of move success.

## Advanced/Environmental Moves

- **Clone Thread** – [Brute] Temporarily creates decoy or twin
- **Invoke Commandment** – [Devout] Changes encounter or ruleset
- **Bug Injection** – [Dark Hat] Applies `Bugged`, weakens logic structure

# 🧪 Progression-Unlocked Moves by Class

## 🧑‍💻 Promptweaver
- **Multi-thread** – Take two actions per turn (requires `Logic ≥ 6`)
- **Prompt Braid** – Combine two subsystem actions into one
- **Ghost Path** – Unlocks phase traversal for bypassing obstacles

---

## 🛠️ Brute
- **System Slam** – Chance to stun enemies on hit (requires `Force ≥ 6`)
- **Break Trace** – Move and attack in the same turn
- **Passive: Reinforced Kernel** – Flat damage reduction on all hits

---

## 🧘 Devout
- **Loop Lock** – Temporarily freeze enemy actions
- **Passive: Sanctified Loop** – Auto-heal when dropping below 30% health (once per encounter)
- **Traceproof** – Immune to `Traced` effect (requires `Stability ≥ 6`)

---

## 🧠 Cypherpunk
- **Fork Bomb** – Summon clone that absorbs the next hit
- **Signal Jam** – Silence an area, disabling enemy subsystem use
- **Passive: Hidden Process** – First hit taken per encounter deals 0 damage


---

# 🧹 Subsystems Index

## 🔧 Active Subsystems

Each active subsystem represents a tactical or offensive move.

* **Exploit** – Damage scaled by Logic; bonus vs Bugged/low-level enemies
* **Force** – Break defenses; may apply Overloaded; causes fatigue
* **Patch** – Restore Integrity and clear Fragmented (White Hat, Devout only)
* **Hijack** – Seize control of enemy subsystems (if Flagged)
* **Crash** – AoE or single-target damage; may apply Fragmented
* **Decrypt** – Unlock terminals, dialog trees, or loot caches
* **Encrypt** – Grants Encrypted; protects from Exploit/Hijack
* **Simulate** – Preview chance of success for next move
* **Rebase** – Roll back to previous turn (requires branch)
* **Branch** – Save the current game state for reversion
* **Merge** – Lock in changes made since last Branch

## 🌀 Passive Subsystems

Bonuses, status resistances, or unlockables.

| Name                  | Effect                                                               |
| --------------------- | -------------------------------------------------------------------- |
| **Soft Loop**         | Grants immunity to the `Looped` status (prevents repeat-locks)       |
| **Ghost Thread**      | Allows traversal across invisible tiles or hidden pathways           |
| **Overflow Buffer**   | Auto-survive once when Integrity would hit 0 (one use per encounter) |
| **Sanctified Loop**   | (Devout only) Auto-heal when dropping below 30% Integrity            |
| **Reinforced Kernel** | (Brute only) Reduces all incoming damage by a flat amount            |
| **Hidden Process**    | (Cypherpunk only) Negates damage from the first hit each encounter   |
| **Traceproof**        | (Devout only, requires Stability ≥ 6) Immune to `Traced` effect      |

## Combat & Utility Moves

* **Exploit** – \[Rogue, Cypherpunk] Deals bonus damage to lower-level enemies or those with `Bugged`.
* **Force** – \[Brute, Devout] Heavy strike; risk of Overload or lock-in on one target.
* **Hijack** – \[Dark Hat] Take control of an enemy under `Flagged`. Success scales with Logic.
* **Crash** – \[Brute] Area damage; may cause `Fragmented`.
* **Patch** – \[White Hat, Devout only] Restore Integrity and cure negative effects.
* **Decrypt** – \[Cypherpunk, White Hat] Unlock encrypted nodes or hidden dialog.
* **Encrypt** – \[White Hat] Apply Encrypted; defensive buff.
* **Rebase** – \[All] Roll back turn if branch exists.
* **Simulate** – \[All] Preview chance of move success.
* **Branch** – \[All] Save state to allow future reversion
* **Merge** – \[All] Finalize post-branch progress
* **Ping** - \[All]\ Flags a target, exposing them to Hijack and weakening their logic defenses. Applies the `Flagged` status for 2 turns. Scales with logic.

## Advanced/Environmental Moves

* **Clone Thread** – \[Brute] Temporarily creates decoy or twin
* **Invoke Commandment** – \[Devout] Changes encounter or ruleset
* **Bug Injection** – \[Dark Hat] Applies `Bugged`, weakens logic structure

# 🧪 Progression-Unlocked Moves by Class

## 🧑‍💻 Promptweaver

* **Multi-thread** – Take two actions per turn (requires `Logic ≥ 6`)
* **Prompt Braid** – Combine two subsystem actions into one
* **Ghost Path** – Unlocks phase traversal for bypassing obstacles
* **Recursive Prompt** *(planned)* – Gain low Integrity regen per turn if Logic ≥ 5

---

## 💪 Brute

* **System Slam** – Chance to stun enemies on hit (requires `Force ≥ 6`)
* **Break Trace** – Move and attack in the same turn
* **Passive: Reinforced Kernel** – Flat damage reduction on all hits
* **Clone Thread** – Temporarily creates a decoy or twin
* **Rage Regen** *(planned)* – Heals after using Force-based attacks

---

## 🧘 Devout

* **Loop Lock** – Temporarily freeze enemy actions
* **Passive: Sanctified Loop** – Auto-heal when dropping below 30% health (once per encounter)
* **Traceproof** – Immune to `Traced` effect (requires `Stability ≥ 6`)
* **Invoke Commandment** – Changes encounter or ruleset
* **Patch Party** *(planned)* – Heal all allies for moderate Integrity

---

## 🧠 Cypherpunk

* **Fork Bomb** – Summon clone that absorbs the next hit
* **Signal Jam** – Silence an area, disabling enemy subsystem use
* **Passive: Hidden Process** – First hit taken per encounter deals 0 damage
* **Backtrace Feed** *(planned)* – Heal small amount after using Decrypt

---

## Shared by All

* **Rebase** – Roll back to previous turn (if `Branch` exists)
* **Branch** – Save the current game state for reversion
* **Merge** – Lock in changes made since last `Branch`
* **Simulate** – Preview move outcomes
* **Ping**

## Alternate Healing Access

* **Loot-Based Healing** – All classes can use rare consumables or data fragments to restore Integrity.
* **Environmental Nodes** – Some zones offer Integrity restore nodes accessible to any class.
* **Subsystem Unlocks** – Classes may unlock themed healing subsystems via progression (see above).
