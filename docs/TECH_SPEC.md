# Technical Specification

## Architecture

Use React for shell and HUD, React Three Fiber for the 3D scene, Rapier for collision and physics, Zustand for application and mission state, and Howler for audio. Keep simulation logic in framework-independent TypeScript modules where practical.

```text
src/
├── app/             # loading, menus, routes, error boundary
├── game/
│   ├── core/        # clock, event bus, ids, save/load
│   ├── state/       # mission, player, inventory, alert
│   ├── systems/     # interaction, detection, combat, power, objective
│   ├── entities/    # player, guard, doors, heart, ship
│   ├── levels/      # harbor scene and authored level data
│   └── content/     # dialogue, items, objective definitions
├── rendering/       # R3F components, materials, effects, camera
├── ui/              # HUD, prompts, subtitles, pause/settings
├── audio/
├── assets/
├── tests/
└── main.tsx
```

## State ownership

- Mission state owns objectives, flags, approach evidence, and checkpoint data.
- Physics owns position and collision during play.
- Rendering reads state but does not decide mission outcomes.
- AI perception reads player position, visibility, and emitted sound events.
- Power circuits own enabled/disabled devices; devices subscribe to circuit changes.
- Dialogue choices emit domain events instead of directly modifying unrelated systems.

## Data definitions

Define Zod schemas or equivalent runtime validation for level objects, interactables, objectives, dialogue, checkpoints, and imported asset metadata. Invalid content should fail during development with a useful error.

## Performance budgets

- 60 FPS target and 30 FPS minimum on an ordinary recent laptop at 1920×1080
- Initial download target under 20 MB before optional high-quality assets
- No unbounded allocations in the frame loop
- Reuse geometry and materials where sensible
- Use compressed GLB and texture sizes appropriate to screen space
- Pause simulation when the document is hidden
- Centralize quality settings for render scale, shadows, post-processing, particle count, draw distance, foliage density, and audio concurrency so the mobile port can reduce cost without branching gameplay.

## Input

- Keyboard and mouse are required
- Gamepad support is a later enhancement unless completed without delaying PC acceptance
- Pointer lock must have visible instructions and a reliable Escape path
- Key bindings must be centralized
- Gameplay consumes semantic actions such as `move`, `look`, `sprint`, `crouch`, `jump`, `primary`, `melee`, `interact`, `tow`, `pause`, and `cancel`.
- Device adapters convert keyboard, mouse, gamepad, or touch input into the same action state. Gameplay systems must not bind directly to browser events.
- Input prompts resolve from the active device and may switch at runtime.

## Viewport and interface portability

- Keep HUD layout independent from the 3D canvas dimensions.
- Use safe-area CSS environment variables where supported.
- Avoid positioning critical controls with fixed desktop pixel offsets.
- Critical text and interaction targets must remain readable after later mobile scaling.
- PC layout is the release target for Milestones 1–7; mobile presentation is implemented in Milestone 8.

## Save and checkpoints

Use a versioned save repository behind an interface. The PC web implementation may use local storage, while a later native wrapper may replace the storage adapter. A checkpoint contains mission state, player transform, inventory, powered circuits, door state, disabled enemies, and selected dialogue outcomes. Handle corrupt or old saves by offering a clean restart.

## Test strategy

Use unit tests for deterministic state transitions, power routing, damage, inventory, and checkpoint serialization. Use Playwright for boot, pause, restart, a scripted completion path, and absence of uncaught console errors. Use human browser play for game feel, camera, spatial readability, audio, and alternate approaches.

## Asset contract

Use GLB/GLTF. Imported gameplay assets require:

- meters as scale
- Y-up after import into the runtime
- clear origin and forward direction
- named nodes
- simple collider or documented collider generation
- triangle and texture budget
- license/source metadata

Generated files belong under `src/assets/generated/` with a sidecar metadata file. Placeholder geometry stays replaceable through a single entity or asset registry.

## Error handling

Show a readable loading error if an asset fails. Gameplay-critical interactables must have a placeholder fallback. Do not leave the player on a blank canvas.
