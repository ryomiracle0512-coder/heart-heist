# Decisions

- Keep the previously uploaded LP handson archive unchanged under `Codex_LP_Handson/`; the game lives at repository root.
- Use the requested React / R3F / Rapier / Zustand / Howler stack, framework-independent deterministic mission and AI functions, semantic input, and a replaceable versioned save repository.
- Build an authored compact harbor with meters as units, +Y up, forward -Z. Original procedural meshes and synthesized audio need no external asset credentials.
- Japanese UI with short English environmental labels. No external fonts or runtime network dependencies.
- A milestone's automated evidence is distinct from human playtesting and real-device performance. Do not infer either from emulation.
- Stair visuals use explicit smooth Rapier ramp colliders, because individual box steps caught the dynamic capsule in browser testing.
- The M3 browser route tests use development-only repositioning for setup; heart transport itself uses real movement and collision. These are integration tests, not substitutes for a complete clean-start traversal in M7.

## 2026-09-21 — Accessible play design v2

- Treat the supplied AI Game Development Playbook as a process reference, not blanket authorization for its example prompts, paid assets or engine changes.
- Keep first-person exploration and shared mission rules; add keyboard-only and two-thumb input profiles with optional mouse mode.
- Use fixed context actions, optional visible-target aim assistance and a shared paused auxiliary-action menu to avoid three-finger requirements.
- Preserve save schema 1; migrate control/display settings separately.
- Specify readable text and hit targets before adding new art. Separate world view distance from decorative culling.
- This request produces an updated design and review prototype. Implementation, actual input-only route evidence and physical-device measurements remain pending. See `ACCESSIBLE_PLAY_DESIGN.md`.

## 2026-09-22 — Playable online touch edition

- Ship online browser play and an in-game static guide before PWA/offline or native packaging. Preserve owner-only hosting access.
- Touch interaction taps share the existing nearest+occlusion resolver and mission rules. Aim assist only rotates toward a visible nearby guard; no automatic fire or hit-rule bypass.
- Keep keyboard/mouse baseline behavior available; settings v2 and mission schema v1 are separate.
- Use independent source ownership for held actions and release all inputs on interruption.
- Emulator touch-only route completion is separate from physical-device compatibility/performance.
