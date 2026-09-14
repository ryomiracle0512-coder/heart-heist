# Prompt 01 — Foundation

```text
Implement Milestone 1 in docs/ACCEPTANCE.md.

Create a Vite React TypeScript application using React Three Fiber, drei, Rapier, Zustand, Howler, Vitest, Playwright, ESLint, and Prettier. Use the architecture in docs/TECH_SPEC.md. Add only dependencies required now.

Create a reliable full-screen game shell with:
- loading and error states;
- a simple title screen with Start and Controls;
- keyboard and mouse first-person movement;
- collision, gravity, sprint, crouch, and jump;
- a stable first-person camera;
- pointer-lock instructions and Escape behavior;
- pause, restart, audio volume, mouse sensitivity, and reduced camera-motion settings;
- a minimal HUD and interaction reticle;
- centralized input bindings;
- an FPS/debug overlay toggled by a development-only key.

Use a tiny test room made from primitives. Do not build the harbor yet.

Add unit tests for pure state and input mapping. Add a Playwright smoke test that opens the app, starts the game, pauses and resumes, and fails on uncaught page errors. Run build and tests, open the app, inspect it, fix failures, and update docs/STATUS.md. Stop only when Milestone 1 passes.
```

