# HEART HEIST implementation status

## 00 — Plan
Product promise: discover the levitation heart, choose combat / stealth / trade, cause a readable outage, physically transport it, install it, and pilot the ship to the abyss.
Boundary: one authored harbor, single player, local saves, original procedural assets, no backend or paid services. Japanese player-facing copy.
Sequence: 01 foundation → 02 greybox → 03 heist → 04 AI/combat → 05 consequences/escape → 06 presentation → 07 PC audit. 08 is gated on a verified PC baseline.
Risks: first-person collision, transport through doors, AI occlusion, save consistency, browser WebGL performance, absence of physical mobile hardware and independent human playtest evidence.

Milestones are recorded below as implemented and verified. Unmeasured criteria will not be marked passed.

## 01 — Foundation verified
- Vite production build and 3 unit tests passed.
- Playwright Chrome: start, movement, Escape/pointer-lock exit, pause, settings, resume, reload at 1440×900 and 1000×900 passed (2 tests, 11.6s).
- Browser inspection: first-person test room renders, HUD legible, no uncaught errors. Rapier upstream initialization deprecation warning only.
- Evidence: `docs/evidence/01-foundation-{1440,1000}.png`.
- Initial JS: 3.33 MB raw / 1.14 MB gzip. Performance baseline is deferred until the actual harbor exists.
- Next: 02 authored harbor greybox.

## 02 — Harbor greybox verified
- Authored harbor, quay, yard, warehouse, raised control deck, heart chamber, maintenance and cargo openings, ship, cover and two stair routes.
- Zod validates level geometry. Stair collision was replaced by explicit smooth Rapier ramp colliders after a browser test caught a blocked step.
- Browser walking and landmark collision smoke passed (5.2s); screenshots of spawn, yard, chamber, control deck, quay and ship under `docs/evidence/02-*.png`.
- Entry locks and powered shutters are connected in 03, using the authored openings. Lighting remains greybox.

## 03 — Heist systems verified
- Shared main/maintenance/chamber/cargo doors, side/main power, control override, keycard, timed code, fixer choices (accept/refuse/deliver/betray), crate inventory, carry/tow/drop, socket and versioned local checkpoint repository implemented.
- 9 heist/save tests passed; 3 foundation tests remain green.
- Four browser integration routes reached installation with real post-theft movement/collision: combat 43.3s, stealth 43.7s, trade 44.4s, mixed 44.1s. Setup used developer-only positioning.
- Browser reload before/after heart removal and corrupt-save recovery passed. Evidence in `docs/evidence/03-*.png`.
- Next: 04 combat and perception integration, then 05 playable ship escape.

## 04 — Combat and AI verified
- Pistol hitscan, melee, finite ammunition, reload, carrying restrictions, damage, guard wind-up and a 1.8s checkpoint recovery path implemented.
- Explicit patrol/curious/investigate/suspicious/combat/search/return states; distance/FOV/occlusion/crouch perception; sound targets and evidence-based last known positions; obstacle-aware repositioning.
- 5 deterministic combat/perception tests passed. Browser aimed shooting, reload, persisted disabled guard passed (5.9s); stealth transport still passed (43.7s).
- Death-to-recovery timing is covered in final QA; this entry does not claim that browser measurement yet.

## 05 — Consequences and playable escape verified
- Six alert states carry explicit causes; objective/radio text, lamp colors and powered door behavior communicate changes. Towing emits sound; powered routes change together.
- Ship installation transfers control to a Rapier vehicle body: ignition, vertical lift, descent, steering, boost and an altitude-constrained extraction volume. The next destination is visible as illuminated abyss rings.
- Results list actual approach evidence instead of forcing a single route label; clean replay is available.
- Browser integration: combat, stealth, trade and mixed all reached COMPLETE via real ship input. Stealth 57.2s, trade 58.0s; combat/mixed about 1.1m with combat included.
- 19 unit tests passed. Pre-art local Chrome 1920×1080 / medium: 12 samples, mean/min 60 FPS (`performance-greybox.json`). Host class is not verified; no general hardware-performance claim.

## 06 — Presentation verified
- Original modular harbor ribs, crane, wet-ground material response and soft lamp reflections, warm work lights, cyan heart cables, original salvage hull, guard silhouettes, high-contrast Japanese HUD and local synthesized audio.
- Reversible hero-asset registry; original source/geometry/audio metadata under `src/assets/generated/`.
- Quality render scale, draw distance, key-light shadow mode, particle limit and audio concurrency are centralized. Reduced-motion camera setting and persisted controls/graphics settings are available.
- Presentation browser checks passed at 1440×900 and 1000×900. Local Chrome 1920×1080 / medium (0.85 render scale): average 60 FPS, minimum sampled window 58 FPS. See `performance-presentation.json`.
- Production assets total 4,628,707 bytes raw / approximately 2,098,568 bytes if gzip served, including audio. Under the 20 MB initial target. Actual wire compression depends on hosting configuration.

## 07 — PC implementation and verifiable QA complete
- Clean `npm ci` in a separate empty dependency directory succeeded; build and 19 tests passed there. Final working copy build, tests and ESLint pass.
- Clean-start browser traversals without repositioning completed for combat, stealth, trade and mixed. Combat/stealth/mixed use towing during escape; trade carries the heart. Stealth and trade fired zero shots. The mixed run combined a completed trade with the side-circuit outage.
- Early failed clean-start tests exposed an unsafe slow escape and a script aiming through cover. Final routes use a transport choice and walk around solid cover; no gameplay state was bypassed to make these tests pass.
- Final browser regression: save reload before/after disconnect, corrupt save, aimed shooting, reload and persisted kills, 1440/1000px start/pause/settings/resume all pass.
- Real guard damage caused defeat; the player recovered to the checkpoint and could move again within five seconds (test passed; recovery implementation delay 1.8 simulation seconds).
- Production-served browser opened the scene, accepted input, exited to pause and reported no console errors. Production JS does not contain `__HEIST_DEV__` or the route selector.
- A continuous ~145-second trade playthrough recording completed successfully, showing discovery, dialogue choice, outage, carry/tow transport, installation, ascent and extraction. `docs/evidence/07-gameplay.mp4` is the portable export; browser capture is silent.
- Final selected browser regression: 7/7 passed in 3.6 minutes. After the visual correction, abyss inspection, presentation/performance and continuous recording passed again (3/3, 2.6 minutes); pointer-lock notice regression also passed (2/2). The PC source commit is recorded in `docs/PC_BASELINE.json` after commit creation.

## Scope boundary and evidence gaps
Prompt 07 explicitly directs: “Do not begin the mobile port in this task.” Prompt 08 has been read and is left as the next task specification; touch UI/PWA/native packaging are not implemented here. No mobile compatibility is claimed.
Independent new-player feedback, the target 20–30 minute first attempt, and representative PC/mobile hardware testing remain unverified. Automated traversal times are not human play durations. Procedural art and simple guard navigation are deliberate vertical-slice limits.

- Final video inspection found an opaque ocean surface over the abyss. The ocean now has a real circular opening, visible inner walls and moving lights; decorative skyline was moved behind the shaft. `07-abyss.png` confirms visibility. Final performance remains average 60 / minimum sampled 58 FPS.
