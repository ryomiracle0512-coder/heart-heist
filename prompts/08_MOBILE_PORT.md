# Prompt 08 — Mobile Port After PC Completion

Run this prompt only after the PC release gate passes and its baseline is recorded.

```text
Port the completed HEART HEIST PC vertical slice to smartphones using docs/MOBILE_PORT.md. Preserve the PC game as the behavioral baseline and use the same mission content, state transitions, assets, and gameplay systems.

First inspect AGENTS.md, docs/TECH_SPEC.md, docs/ACCEPTANCE.md, docs/MOBILE_PORT.md, and the PC baseline in docs/STATUS.md. Audit the current code for direct keyboard/mouse dependencies, fixed viewport assumptions, render-cost hotspots, storage coupling, hover-only UI, and lifecycle problems. Record the findings and implementation plan in docs/STATUS.md before editing.

Implement a landscape mobile Web/PWA version with:
- a touch input adapter that emits the existing semantic gameplay actions;
- configurable dual-thumb controls and a left-handed preset;
- touch-friendly aiming, interaction selection, combat, crouch, sprint, jump, towing, connection, pause, and cancel;
- responsive HUD regions that respect safe-area insets and do not overlap critical controls;
- no active-play text entry or hover-only interaction;
- data-driven Mobile Medium and Mobile Low graphics presets;
- capped pixel ratio, reduced shadows and post-processing, particle budgets, draw-distance controls, asset compression where supported, and bounded audio concurrency;
- PWA metadata, versioned asset caching, install behavior, loading progress, update handling, offline return behavior after required assets are cached, and a safe fallback when caching fails;
- background, resume, audio-context, orientation, and checkpoint behavior appropriate to mobile browsers.

Add automated checks for touch-action mapping, responsive HUD bounds, save compatibility, background/resume state, and production build. Use browser device emulation for fast iteration, then clearly separate those results from physical-device evidence.

Do not introduce native app packaging yet. First make the mobile Web/PWA build pass all verifiable mobile release criteria. If physical devices are available, test the selected matrix and measure FPS, load time, memory where available, thermal or throttling behavior, touch accuracy, audio, safe areas, and two consecutive complete runs. Fix failures caused by the port.

After the PWA passes, assess Capacitor packaging. Add it only if the repository or task provides the required platform toolchains and the wrapper has a concrete distribution or device-feature benefit. Keep native code limited to packaging, lifecycle, haptics, storage, and measured platform needs. Do not begin a Unity or Unreal rewrite.

Play combat, stealth, trade, and one mixed route using touch only. Verify heart carrying and towing, ship controls, defeat/restart, checkpoint reload, pause/resume, settings, and the results screen. Rerun PC regression checks.

Update the README with mobile development, testing, PWA installation, supported orientation, control layout, quality presets, known device limits, and optional packaging instructions. Update docs/STATUS.md with the device matrix and evidence. Continue until every verifiable item in the mobile release gate passes; identify any criterion requiring unavailable physical hardware with its exact evidence gap.
```
