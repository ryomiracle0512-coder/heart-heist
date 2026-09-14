# HEART HEIST repository instructions

Build a playable vertical slice described in `docs/GAME_DESIGN.md`.

- Use `docs/TECH_SPEC.md` when changing architecture or dependencies.
- Use `docs/ACCEPTANCE.md` to decide whether a milestone is complete.
- Use `docs/ASSET_BRIEF.md` when creating or importing visual or audio assets.
- Use `docs/MOBILE_PORT.md` for cross-device architecture and only begin the mobile port after the PC release gate passes.
- Keep gameplay state deterministic and separate from rendering.
- Express player intent through device-independent gameplay actions. Keyboard, mouse, gamepad, and touch adapters may emit those actions; gameplay systems must not read DOM key or touch events directly.
- Prefer simple, editable geometry until the game loop is proven.
- Preserve three complete approaches: combat, stealth, and trade.
- Do not add accounts, payments, multiplayer, procedural open worlds, or runtime LLM calls in this vertical slice.
- During PC milestones, preserve mobile portability without adding unfinished touch UI to the PC release.
- Run the app, exercise affected gameplay, and fix regressions caused by the requested work.
- Continue through implementation, browser inspection, and affected tests until the milestone acceptance criteria pass.
- Record material design decisions in `docs/DECISIONS.md` and update `docs/STATUS.md` after each milestone.
