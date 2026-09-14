# Prompt 03 — Heist Systems

```text
Implement Milestone 3 in docs/ACCEPTANCE.md.

Create composable gameplay systems for interactables, inventory, keycards, keypad codes, doors, power circuits, objectives, dialogue choices, carrying, towing, sockets, checkpoint save/load, and mission events. Validate authored content at development time.

Implement all three start-to-finish routes from docs/GAME_DESIGN.md:

Combat route:
- the main route can be forced;
- the control room unlocks the chamber;
- taking the heart causes reinforcement pressure.

Stealth route:
- a side circuit controls the maintenance entrance;
- the supervisor keycard can be acquired without mandatory combat;
- the outage changes guard investigation behavior.

Trade route:
- the dock fixer requests a contraband crate;
- returning it produces a temporary code and a timed distraction;
- the player can refuse or betray the deal, with a readable consequence.

Heart interaction:
- disconnecting changes selected circuits;
- carrying occupies combat interaction and slows movement;
- towing is faster, audible, and can snag or collide predictably;
- the heart can be dropped and recovered;
- the ship socket accepts it and advances the mission.

Add deterministic unit tests for state transitions, circuits, inventory, approach completion evidence, and save serialization. Add a developer route selector for testing, excluded from production UI. Play all three paths from clean state and reload from at least two checkpoints. Fix progression blockers and update docs/STATUS.md. Stop when Milestone 3 passes.
```

