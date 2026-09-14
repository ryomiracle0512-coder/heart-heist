# Asset Brief

## Visual direction

Industrial fantasy at night. Massive, repairable machines use contained biological energy. Forms are readable, worn, modular, and built for maintenance. The scene uses dark blue-black metal and wet stone, with warm practical lamps and cyan-white heart energy.

Avoid direct imitation of existing game franchises, recognizable characters, logos, UI, vehicles, and locations.

## Readability hierarchy

1. Interactive heart and powered cables
2. Player route, cover, doors, and control panels
3. Guards and threats
4. Ship and escape direction
5. Decorative harbor detail

## Asset list

| Asset | Initial form | Final target |
|---|---|---|
| Harbor structures | Procedural boxes | Modular walls, beams, stairs, crane pieces |
| Heart | Procedural emissive core | GLB core, containment frame, sockets, cables |
| Player ship | Low-poly greybox | Repairable salvage craft with open heart bay |
| Guard | Capsule/mannequin | Rigged low-poly original character |
| Weapon | Simple mesh | Original compact salvage pistol |
| Tow tool | Beam and hook | Mechanical handheld tether projector |
| Props | Reused primitives | Crates, lamps, barriers, terminals, pipes |

## Tripo or image-to-3D prompt template

```text
Create an original game-ready [ASSET] for HEART HEIST, an industrial-fantasy heist game.

Function: [WHAT THE PLAYER DOES WITH IT].
Silhouette: [THREE DISTINCTIVE SHAPE FEATURES].
Materials: worn dark metal, repair marks, restrained brass hardware, no readable logos.
Energy elements: cyan-white contained light only where the object is powered.
Scale: [DIMENSIONS] meters.
Geometry: clean quad-oriented topology, maximum [TRIANGLE BUDGET] triangles.
Parts: keep [NAMED MOVING OR INTERACTIVE PARTS] separate and clearly named.
Origin and orientation: origin at [LOCATION], forward is [DIRECTION], upright for game-engine import.
Deliver: textured GLB with PBR base color, normal, metallic, and roughness maps; no background or display stand.
The design must be original and must not reproduce recognizable copyrighted characters, vehicles, or branded designs.
```

## Blender cleanup prompt

```text
Inspect the imported [ASSET] from all sides. Prepare it for the runtime asset contract in docs/TECH_SPEC.md. Correct scale, origin, orientation, transforms, normals, UV problems, material assignments, and excessive geometry. Separate and name interactive parts. Create simple collision meshes with the UCX_ prefix. Produce one medium LOD and one low LOD if the asset exceeds its screen-space need. Export GLB and create the sidecar metadata record with source, generation method, license status, triangle count, texture sizes, dimensions, and validation results. Show inspection renders before replacing the placeholder.
```

## Audio list

- Harbor wind and distant machinery loop
- Calm, alert, and escape music layers
- Footsteps by surface
- Guard radio barks and detection cue
- Weapon shot, dry fire, hit, ricochet
- Heart hum, cable connect, circuit failure
- Tow tool start, strain, release
- Ship ignition, hover, boost
- UI confirm, warning, objective complete

Use synthesized or properly licensed sounds. Keep sources and licenses in metadata.

