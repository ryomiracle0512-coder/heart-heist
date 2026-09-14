# Decisions

- Keep the previously uploaded LP handson archive unchanged under `Codex_LP_Handson/`; the game lives at repository root.
- Use the requested React / R3F / Rapier / Zustand / Howler stack, framework-independent deterministic mission and AI functions, semantic input, and a replaceable versioned save repository.
- Build an authored compact harbor with meters as units, +Y up, forward -Z. Original procedural meshes and synthesized audio need no external asset credentials.
- Japanese UI with short English environmental labels. No external fonts or runtime network dependencies.
- A milestone's automated evidence is distinct from human playtesting and real-device performance. Do not infer either from emulation.
- Stair visuals use explicit smooth Rapier ramp colliders, because individual box steps caught the dynamic capsule in browser testing.
- The M3 browser route tests use development-only repositioning for setup; heart transport itself uses real movement and collision. These are integration tests, not substitutes for a complete clean-start traversal in M7.
