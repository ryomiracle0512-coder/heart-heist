# PC First, Mobile Second

## Product sequence

1. Complete and playtest the PC browser vertical slice.
2. Record the PC version as the behavioral baseline.
3. Adapt the same codebase to mobile Web/PWA in landscape orientation.
4. Test on physical iOS and Android devices.
5. Consider a Capacitor wrapper for app-store distribution only after touch play, loading, heat, memory, and resume behavior pass.

The mobile version is a port of the completed PC game. It does not start as a second implementation or a separate game-design branch.

## Decisions required during PC development

The following choices are made during the PC build because delaying them would create expensive rework:

- Gameplay reads semantic actions rather than keyboard or mouse events.
- Camera and aiming parameters are data-driven.
- HUD uses responsive layout regions and safe-area variables.
- Quality settings are centralized.
- Save storage sits behind a replaceable adapter.
- Interaction distances, timings, and button holds are configurable.
- Assets have measurable triangle, texture, animation, and audio budgets.
- Mission logic does not depend on desktop viewport size or hover behavior.

These choices preserve portability. They do not require showing touch buttons in the PC release.

## Recommended mobile target

- Orientation: landscape
- First distribution: mobile Web/PWA for rapid testing
- Possible store packaging: Capacitor after validation
- Minimum play target: recent mid-range iPhone and Android device classes selected before Milestone 8
- Performance target: 30 FPS minimum under combat and escape load
- Session length: the complete 20–30 minute vertical slice without forced reload

Do not claim broad device support from desktop responsive emulation. Real-device testing is required.

## Touch control layout

Use two thumb zones with context-sensitive actions:

- Left thumb: virtual movement stick; outer ring may trigger sprint after configurable deflection and duration.
- Right thumb: camera look; aim/fire button near the thumb zone.
- Right action cluster: interact/use, primary attack, melee.
- Secondary actions: crouch, jump, tow/connect, pause.
- Context actions may replace the interact label, but their location must remain stable.

Avoid more than three equally prominent buttons in the main right-hand cluster. Do not require multi-finger chords for mission-critical actions. Prevent browser scrolling, zooming, text selection, and accidental edge gestures inside the game surface where platform rules permit.

Provide standard and left-handed layout presets. Allow control scale, opacity, and look sensitivity. Add modest, configurable aim assistance for touch; do not alter enemy health or mission logic solely to hide poor controls.

## Mobile-specific interaction changes

- Increase interaction target tolerance through ray or cone selection while preserving visible intent.
- Prefer tap and short hold over precise dragging.
- Towing uses a stable attach/detach button and steering assistance rather than pixel-precise cable selection.
- Replace hover tooltips with focus or tap states.
- Keep active-play text entry out of the mission.
- Make subtitles readable without covering targets or controls.

## Rendering strategy

Create data-driven presets:

| Setting | PC High | Mobile Medium | Mobile Low |
|---|---:|---:|---:|
| Render scale | 1.0 | 0.75–0.9 | 0.6–0.75 |
| Dynamic shadows | Key lights | One main light | Minimal or baked |
| Post-processing | Selected effects | Reduced | Essential only |
| Particles | Full budget | Reduced | Strongly reduced |
| Draw distance | Full slice | Reduced decoration | Gameplay minimum |
| Texture resolution | Asset-dependent | Reduced variants | Reduced variants |

Exact values must be measured on chosen devices. Use object pooling, instancing, compressed GLB, compressed textures where supported, capped device pixel ratio, and limited simultaneous audio. Avoid allocating objects in update loops.

## Loading and lifecycle

- Show progress for gameplay-critical assets.
- Load optional decorative content after play can begin.
- Cache versioned assets for PWA use and invalidate them safely on release.
- Pause input and simulation on backgrounding.
- Save at safe mission transitions and when the app is backgrounded where the platform permits.
- Restore to a stable checkpoint after interruption rather than an unsafe mid-physics frame.
- Handle audio context suspension and resume explicitly.

## Packaging strategy

Phase 1 uses the responsive web build and optional PWA manifest/service worker. This gives the fastest test loop and one deployed code path.

Phase 2 may add Capacitor for iOS and Android. Keep native code limited to packaging, lifecycle, haptics, storage, and platform services that have a measured benefit. App-store signing, screenshots, privacy disclosures, and review requirements are separate release work.

If WebGL performance, input latency, memory, or platform restrictions make the wrapper unacceptable, decide whether to keep the title as mobile Web/PWA or fund an engine migration. Do not silently start a second Unity or Unreal implementation.

## Device matrix

Before mobile work begins, choose at least:

- one recent iPhone with a display cutout;
- one older supported iPhone;
- one recent mid-range Android phone;
- one lower-memory Android phone intended to remain supported;
- Chrome and Safari responsive emulation for fast iteration.

Record OS, browser/app version, resolution, device pixel ratio, average and worst observed FPS, peak memory when available, load time, heat or throttling observation, audio behavior, and defects.

## Mobile completion evidence

For every tested device, keep:

- one clean-start recording;
- one combat or alert recording;
- one heart transport and ship escape recording;
- control-layout screenshot;
- performance measurement;
- resume-from-background result;
- known limitation and severity.

