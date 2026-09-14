# Prompt 00 — Master Brief

Copy everything below into Codex while the repository root is open.

```text
Build the HEART HEIST vertical slice described by this repository.

First inspect AGENTS.md and the files in docs/. Summarize the product promise, the vertical-slice boundary, the milestone order, and the main technical risks in docs/STATUS.md. Create docs/DECISIONS.md for material decisions.

Use the repository documents as the source of truth. Preserve the core loop: discover a valuable heart, choose an approach, trigger readable consequences, install the stolen power in the ship, and gain a new playable capability.

Work milestone by milestone using the prompts in prompts/. Complete Prompts 01–07 as the PC release before starting Prompt 08. Do not attempt final-quality world art before the greybox and three heist routes are playable. Prefer original procedural geometry and generated placeholder materials until the asset phase.

For each milestone:
1. inspect only the files needed for that work;
2. implement the complete milestone;
3. run the application and affected tests;
4. inspect the result in the browser at 1440×900 and at a narrower desktop size;
5. fix errors and obvious gameplay or layout failures;
6. update docs/STATUS.md with completed acceptance criteria, measured performance, known defects, and the next task.

Continue without stopping for routine implementation choices. Ask only when a decision would materially change the game promise, remove one of the three complete approaches, require paid external credentials, or replace the selected stack.

Do not add backend services, accounts, payments, multiplayer, runtime LLM calls, or a procedural open world. Do not copy recognizable assets or interfaces from existing franchises. Preserve mobile portability through semantic input actions, responsive HUD regions, replaceable storage, data-driven quality settings, and measured asset budgets, but do not begin the mobile presentation before the PC release gate passes.

Completion means the current milestone satisfies its corresponding section in docs/ACCEPTANCE.md, the build passes, affected tests pass, the browser has no uncaught errors, and the implemented path was played through.

Begin with Prompt 01 after creating the status and decision files.
```
