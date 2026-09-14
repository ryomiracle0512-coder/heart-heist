# Prompt 07 — Final QA and Delivery

```text
Take the HEART HEIST vertical slice through the PC release gate in docs/ACCEPTANCE.md.

Audit the implementation against AGENTS.md and every acceptance criterion. Do not expand product scope. Fix progress blockers, broken routes, misleading feedback, save corruption, collision traps, major performance problems, uncaught errors, and high-impact accessibility issues.

Run and document:
- clean install and production build;
- unit tests and Playwright tests;
- combat completion from a clean save;
- stealth completion from a clean save;
- trade completion from a clean save;
- one mixed completion;
- checkpoint reload before and after heart removal;
- pause, restart, settings, pointer-lock exit, and corrupt-save recovery;
- 1440×900 and a narrower desktop viewport;
- performance and initial download measurements.

Update the project README with setup, commands, controls, goal, approaches, settings, asset credits, known limitations, and build instructions. Produce a release checklist and a concise playtest guide for an observer who must not explain the solutions.

Capture representative screenshots and, if the environment permits, a short gameplay recording covering discovery, choice, consequence, transport, installation, and escape. Report any release criterion that could not be verified and the exact reason. Continue fixing until all verifiable criteria pass.

After the PC gate passes, record the release commit or tag, PC performance measurements, reference screenshots, and save-schema version in docs/STATUS.md. This is the comparison baseline for Prompt 08. Do not begin the mobile port in this task.
```
