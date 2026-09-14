# Prompt 05 — World Reaction and Escape

```text
Implement Milestone 5 in docs/ACCEPTANCE.md.

Connect the mission to an explicit alert state machine: CALM, SUSPICIOUS, ALERT, LOCKDOWN, ESCAPE, COMPLETE. Each transition must have a cause stored in the event log and at least two player-facing signals.

Make consequences systemic and readable:
- cutting the side circuit disables selected lights and one camera or sensor but changes a door or patrol condition;
- removing the heart stops the crane and security shutter power while triggering emergency behavior;
- the chosen route changes which NPCs, exits, or pursuit pressures are active;
- the game shows concise consequence messages tied to observed causes;
- guards use radio lines and movement to communicate state.

After the heart is installed, convert the ship into a controllable hover vehicle. Implement ignition, vertical lift, steering, and one boost. Use a constrained harbor escape corridor. Reveal a distant illuminated abyss as the next destination and end the slice after the player reaches a clear extraction volume.

Add a results screen showing route evidence and notable consequences, then allow immediate replay from a clean state. Do not assign a single route label when the player mixed methods; report the evidence instead.

Play through at least combat, stealth, trade, and one mixed path. Confirm that causes and results are understandable without debug UI. Update docs/STATUS.md and stop when Milestone 5 passes.
```

