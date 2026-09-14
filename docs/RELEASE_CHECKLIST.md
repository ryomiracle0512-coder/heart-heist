# PC release checklist

This checklist records evidence rather than treating implementation as verification.

- [x] Requested stack, versioned save repository, semantic input, authored validated content.
- [x] 19 deterministic tests: input/state, three heist approaches plus mixed, power/doors, inventory, save corruption, combat/perception, escape.
- [x] Build and ESLint pass.
- [x] All four integration routes complete with actual post-theft movement and ship controls.
- [x] Combat and trade have completed from spawn without repositioning.
- [x] Stealth and mixed clean-start regression after route adjustments.
- [x] Real guard defeat and sub-five-second recovery measurement.
- [x] Save reload before/after heart removal; corrupt-save new-start behavior.
- [x] PC pointer-lock exit, pause, resume and settings tests.
- [x] Final presentation 1440×900 and 1000×900 and 1920×1080 FPS capture.
- [x] Continuous 2–3 minute gameplay recording (silent browser capture).
- [x] Clean install / production-served smoke test / final regression run.
- [x] Setup, controls, credits, limitations and observer guide documented.

## Evidence not supplied by automation

Independent first-time human playtest feedback and 20–30 minute first-run duration remain unmeasured. Do not infer them from scripted route times. General laptop performance and physical mobile device measurements are not established by this host's browser.

## Prompt 08 boundary

`prompts/07_FINAL_QA.md` explicitly says “Do not begin the mobile port in this task.” No mobile UI or packaging has been added to this PC task. `docs/MOBILE_PORT.md` and Prompt 08 remain the next-stage specification. They require their own touch-only play evidence and physical-device matrix; desktop viewport emulation is not physical-device evidence.
