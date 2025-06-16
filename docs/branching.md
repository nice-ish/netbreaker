🧬 Branch
Saves the current game state (player, enemies, logs, integrity).

You can only maintain one branch at a time.

Command: branch

🔀 Rebase
Discards the current timeline and reverts the game to the previously branched state.

Useful for undoing mistakes or testing strategies.

Command: rebase

🧩 Merge
Applies any beneficial changes from the branched state to the current timeline (e.g., if a test scenario worked well).

Only possible under certain conditions (e.g., successful encounter or agent validation).

Command: merge