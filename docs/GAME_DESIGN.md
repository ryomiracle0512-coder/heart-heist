# Game Design

## Active design revision — 2026-09-21

The next version must be playable entirely with a keyboard and on landscape smartphone touch controls, with readable responsive HUD. See [Accessible play design v2](ACCESSIBLE_PLAY_DESIGN.md) for the authoritative input, camera, UI, interaction and acceptance changes. This is a design revision; the recorded PC executable is not yet ported. Preserve the first-person harbor, three approaches, shared mission rules and controllable ship payoff.

## Product promise

The player discovers a valuable power source, chooses how to steal it, causes a chain reaction, and uses the stolen power to unlock a visibly larger possibility.

## Vertical slice

The player arrives at a night harbor beside a grounded salvage ship. A warehouse across the yard contains a levitation heart. The player must acquire it, carry or tow it back to the ship, connect it, survive the consequences, and lift off.

Target play time is 20–30 minutes on a first attempt and 8–15 minutes on a replay.

## Core loop

1. Notice a desirable object or inaccessible place.
2. Gather enough information to form a plan.
3. Use combat, stealth, trade, or a combination.
4. Trigger a readable systemic consequence.
5. Acquire a capability that changes what the player can do.
6. See a new destination or problem created by that capability.

## Player verbs

- Walk, sprint, crouch, jump
- Aim, shoot, melee strike
- Inspect, talk, pick up, use
- Carry or tow a heavy object
- Connect and disconnect power cables
- Open, unlock, disable, restore
- Hide behind solid cover and break line of sight

## The heart

The levitation heart is a fist-sized bright core held inside a larger containment frame. It powers the warehouse crane and security shutters. Disconnecting it cuts selected power circuits. When installed in the ship, it enables hover and a short forward boost.

The heart must create at least three decisions:

- Removing it opens one route and closes or complicates another.
- Carrying it occupies the player’s hands; towing it is noisy but faster.
- Installing it immediately starts the escape, while delaying lets the player search the warehouse.

## Three complete approaches

### Combat

The player enters through the main yard, defeats or suppresses guards, reaches the control room, unlocks the heart chamber, removes the heart, and escapes during reinforcements.

### Stealth

The player uses cover, cuts a side-circuit, enters through a maintenance opening, steals a supervisor keycard, disconnects the heart, and exits through a cargo route while guards investigate the outage.

### Trade

The player retrieves a missing contraband crate from the quay for a dock fixer. The fixer supplies a temporary access code and arranges a distraction. The agreement reduces initial resistance but the theft still triggers pursuit.

No route should bypass the heart removal and ship installation sequence.

## World reaction

Use a small explicit state machine:

- CALM
- SUSPICIOUS
- ALERT
- LOCKDOWN
- ESCAPE
- COMPLETE

State changes must be signaled by at least two channels: lighting, siren, radio speech, HUD objective, door behavior, NPC movement, or music.

## Combat feel

Combat supports the heist rather than becoming the entire game.

- Short time to understand, moderate time to defeat
- Clear hit feedback and readable enemy wind-up
- Limited ammunition encourages movement and environmental use
- Melee creates space but is risky
- Enemies seek cover, investigate sound, and lose certainty when line of sight breaks
- Player failure restarts from a recent checkpoint within five seconds

## Progression payoff

Installing the heart changes the ship from scenery into a controllable vehicle. The player lifts above the harbor walls and sees a distant vertical abyss with lights moving inside it. The slice ends after a short playable hover escape, not at a static cutscene.

## Design invariants

- Every objective has a visible subject in the world.
- Every major state change has a clear cause.
- The player can recover from imperfect execution.
- The three approaches share systems and geography.
- Rewards add a new verb or route.
- The first five minutes contain movement, choice, danger, and one meaningful consequence.

