# Prompt 04 — Combat and Guard AI

```text
Implement Milestone 4 in docs/ACCEPTANCE.md while preserving stealth and trade.

Add one compact salvage pistol, a short-range melee strike, player health, ammunition, reload, damage feedback, and fast checkpoint restart. Use hitscan or another simple deterministic method suitable for the vertical slice.

Create guard AI with explicit states: patrol, curious, investigate, suspicious, combat, search, and return/escalate. Perception must combine distance, field of view, line of sight, visibility modifiers, and sound events. Do not let guards know the player's position without evidence. Visualize perception and navigation only in a development debug mode.

Combat requirements:
- readable detection build-up;
- visible attack wind-up and hit feedback;
- guards use cover or reposition without complex squad simulation;
- the player can break line of sight and create uncertainty;
- loud actions influence nearby guards;
- disabled or defeated guards persist in checkpoints;
- the difficulty supports a short heist rather than repeated arena combat.

Verify that combat can complete the game, stealth can avoid mandatory fighting, and the trade route is still valid. Test damage and AI state transitions where deterministic. Perform browser play for camera shake, aim readability, time-to-defeat, cover, and recovery. Update docs/STATUS.md and stop when Milestone 4 passes.
```

