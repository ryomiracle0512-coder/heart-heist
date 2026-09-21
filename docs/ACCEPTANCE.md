# Acceptance Criteria

## Milestone 1 — Foundation

- `npm install`, `npm run dev`, `npm run build`, and tests succeed.
- The game renders a scene and the player can move, look, pause, and resume.
- Pointer lock can be exited.
- Reloading does not produce uncaught console errors.

## Milestone 2 — Greybox

- The harbor, warehouse, control room, heart chamber, quay, and ship are distinct.
- The player can reach each space without getting stuck.
- Critical routes are wide enough for the heart transport mechanic.
- The heart and ship are visible or foreshadowed within the first minute.
- A new tester can state the immediate goal after playing for two minutes.

## Milestone 3 — Heist systems

- Combat, stealth, and trade each form a complete start-to-finish route.
- Doors, keycards, access codes, circuits, dialogue, carrying, and towing interact consistently.
- Disconnecting the heart changes powered devices and alerts the facility.
- Installing it in the ship starts the escape sequence.
- Save and reload preserve the heist state.

## Milestone 4 — Combat and AI

- Guards patrol, hear loud events, investigate, detect the player, fight, search, and return or escalate.
- Crouching and solid cover affect detection.
- Shooting and melee have clear hit and miss feedback.
- The player can survive through movement and cover without exploiting broken navigation.
- Defeat restarts within five seconds at a usable checkpoint.

## Milestone 5 — Consequences

- Calm, suspicious, alert, lockdown, escape, and complete states are distinguishable.
- Removing the heart creates both an advantage and a complication.
- The UI explains observed consequences without exposing hidden implementation values.
- The final ship hover is controllable and reveals the next destination.

## Milestone 6 — Presentation

- Original visual direction is coherent across level, heart, ship, guards, and HUD.
- Required gameplay information remains legible in dark lighting.
- Audio communicates detection, power changes, damage, and objective completion.
- Performance remains above the minimum budget.
- Third-party and generated assets have recorded source and license metadata.

## PC release gate

- Three approaches are completed from a clean save.
- At least one mixed approach is completed.
- No progress-blocking defect remains.
- Build and automated tests pass.
- Browser console contains no uncaught errors during a full run.
- The README contains installation, controls, known limitations, and credits.
- A 2–3 minute gameplay capture shows discovery, choice, consequence, heart transport, installation, and escape.

After this gate passes, tag or otherwise record the PC baseline before starting `prompts/08_MOBILE_PORT.md`.

## Mobile release gate

- The same mission content and rules are used by PC and mobile builds.
- Combat, stealth, trade, and one mixed approach are completed on touch without keyboard or mouse.
- Touch controls support movement, camera, aim/fire, melee, interact, crouch, sprint, jump, towing, pause, and cancel without critical overlap.
- Control position, size, look sensitivity, aim assistance, and handedness can be adjusted or have usable presets.
- HUD respects display cutouts and safe areas at the tested aspect ratios.
- Text entry is not required during active play.
- Orientation changes, backgrounding, interruption, and resume do not corrupt progress.
- The game pauses or behaves safely when the app loses focus.
- A representative mid-range device maintains 30 FPS during combat and escape using its default quality preset.
- Thermal load and memory use remain stable through two consecutive complete runs on a representative device.
- Initial loading, asset failure, offline return after caching, and low-memory recovery have understandable behavior.
- PC controls, appearance, and save compatibility have no regression from the recorded baseline.
- Mobile installation and packaging instructions are documented for the selected distribution route.

## Human playtest questions

Ask without explaining the intended systems:

1. What did you want to try that the game did not allow?
2. Which consequence surprised you, and did you understand its cause?
3. Did you see another possible approach?
4. Did installing the heart feel like gaining a new capability?
5. Would you replay immediately? Why?

## Accessible play revision gate — 2026-09-21 (not yet passed)

The concrete scenarios and measurements in [Accessible play design v2, section 8](ACCESSIBLE_PLAY_DESIGN.md#8-実装順と合格条件) supplement the gates above.

- Keyboard-only start, look, combat, all four routes, menus, defeat recovery, replay; no mouse events or developer look helper.
- Touch-only four routes with at most two simultaneous contacts; no keyboard or state shortcuts.
- Readable 16px body/actions, 14px secondary text; targets at least 48px, primary 56px; safe areas, handedness and larger text validated.
- Same displayed and executed interaction target; visible, occlusion-safe optional aim assistance.
- Pointer-lock refusal, pointer cancellation, orientation, backgrounding and audio resume recover safely.
- PC baseline/save-schema regression and settings migration pass.
- Physical-device performance, repeated play and first-time usability evidence are required for a mobile release claim.

Design previews and desktop emulation cannot mark the touch-gameplay or hardware gates passed.
