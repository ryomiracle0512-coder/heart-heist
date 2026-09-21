import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  CapsuleCollider,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { Suspense, useEffect, useRef } from "react";
import { Euler, Vector3 } from "three";
import { useGame } from "../game/state/gameStore";
import { updateGame } from "../game/systems/update";
import { ViewModel } from "./Actors";
import { Harbor } from "./Harbor";
import { assistAim } from "../game/systems/aim";
import { spawn } from "../game/levels/harbor";
import { input, consume, movement, lookDelta } from "../game/core/input";
import { runtime, useShell, qualityPresets } from "../game/state/store";
const direction = new Vector3();
const up = new Vector3(0, 1, 0);
const rotation = new Euler(0, 0, 0, "YXZ");
function Player() {
  const body = useRef<RapierRigidBody>(null);
  const vehicle = useRef(false);
  const isVehicle = useGame(
    (s) => s.mission.alert === "ESCAPE" || s.mission.alert === "COMPLETE",
  );
  const { camera, gl } = useThree();
  const accumulator = useRef(0);
  const counter = useRef({ time: 0, frames: 0 });
  useEffect(() => {
    useShell.setState({ ready: true });
    return () => {
      useShell.setState({ ready: false });
    };
  }, []);
  useFrame((_, dt) => {
    const shell = useShell.getState();
    const b = body.current;
    if (!b) return;
    counter.current.time += dt;
    counter.current.frames++;
    if (counter.current.time > 0.5) {
      runtime.fps = Math.round(counter.current.frames / counter.current.time);
      runtime.frameMs = 1000 / runtime.fps;
      runtime.drawCalls = gl.info.render.calls;
      runtime.triangles = gl.info.render.triangles;
      counter.current = { time: 0, frames: 0 };
    }
    if (runtime.teleport) {
      b.setTranslation(
        {
          x: runtime.teleport[0],
          y: runtime.teleport[1],
          z: runtime.teleport[2],
        },
        true,
      );
      b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      runtime.teleport = null;
    }
    if (shell.screen === "title") {
      camera.position.set(18, 12, 42);
      camera.lookAt(-4, 3, 0);
      return;
    }
    if (shell.screen !== "play" || useGame.getState().mission.dialogue) return;
    accumulator.current += Math.min(dt, 0.1);
    if (accumulator.current >= 0.1) {
      updateGame(0.1);
      accumulator.current -= 0.1;
    }

    const look = lookDelta(dt, shell.settings.sensitivity);
    runtime.yaw += look.yaw;
    runtime.pitch = Math.max(-1.3, Math.min(1.3, runtime.pitch + look.pitch));
    if (consume("center")) runtime.pitch = 0;
    const aimRequested = consume("aim");
    if (
      shell.settings.aimAssist &&
      shell.settings.inputMode !== "mouse" &&
      (aimRequested || input.held.has("primary")) &&
      Math.abs(look.yaw) + Math.abs(look.pitch) < 0.001
    )
      assistAim(useGame.getState().mission, dt);
    const axes = movement();
    const mission = useGame.getState().mission;
    if (mission.alert === "ESCAPE") {
      if (!vehicle.current) {
        vehicle.current = true;
        b.setGravityScale(0, true);
        b.setTranslation(
          {
            x: mission.ship.position[0],
            y: mission.ship.position[1] + 3,
            z: mission.ship.position[2],
          },
          true,
        );
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
        runtime.yaw = 0;
        runtime.pitch = 0;
      }
      const p = b.translation();
      if (
        input.held.has("sprint") &&
        mission.ship.boost === 0 &&
        mission.ship.ignited
      ) {
        useGame.setState({
          mission: { ...mission, ship: { ...mission.ship, boost: 5 } },
        });
      }
      const boosted = useGame.getState().mission.ship.boost > 4;
      const speed = boosted ? 15 : 7;
      direction.set(axes.x, 0, axes.z).applyAxisAngle(up, runtime.yaw);
      const rise =
        Number(input.held.has("jump")) - Number(input.held.has("descend"));
      b.setLinvel(
        mission.ship.ignited
          ? { x: direction.x * speed, y: rise * 4, z: direction.z * speed }
          : { x: 0, y: 0, z: 0 },
        true,
      );
      if (p.x < -27 || p.x > 27 || p.y < 2 || p.y > 22 || p.z > 35)
        b.setTranslation(
          {
            x: Math.max(-27, Math.min(27, p.x)),
            y: Math.max(2, Math.min(22, p.y)),
            z: Math.min(35, p.z),
          },
          true,
        );
      runtime.position[0] = p.x;
      runtime.position[1] = p.y;
      runtime.position[2] = p.z;
      camera.position.set(
        p.x + Math.sin(runtime.yaw) * 10,
        p.y + 5,
        p.z + Math.cos(runtime.yaw) * 10,
      );
      camera.lookAt(
        p.x - Math.sin(runtime.yaw) * 7,
        p.y + 1,
        p.z - Math.cos(runtime.yaw) * 7,
      );
      return;
    } else if (vehicle.current) {
      vehicle.current = false;
      b.setGravityScale(1, true);
    }
    if (useGame.getState().mission.player.health <= 0) {
      b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    const x = axes.x,
      z = axes.z;
    direction.set(x, 0, z).applyAxisAngle(up, runtime.yaw);
    const burden = useGame.getState().mission.heart.mode;
    const speed =
      burden === "carried"
        ? 2.2
        : burden === "towed"
          ? 3.8
          : input.held.has("crouch")
            ? 2
            : input.held.has("sprint")
              ? 7
              : 4.2;
    const p = b.translation(),
      v = b.linvel();
    let vy = v.y;
    if (consume("jump") && Math.abs(v.y) < 0.05) vy = 6;
    b.setLinvel(
      { x: direction.x * speed, y: vy, z: direction.z * speed },
      true,
    );
    runtime.position[0] = p.x;
    runtime.position[1] = p.y;
    runtime.position[2] = p.z;
    camera.position.set(
      p.x,
      p.y +
        (input.held.has("crouch") ? 0.12 : 0.58) +
        (!shell.settings.reducedMotion && (x || z)
          ? Math.sin(mission.elapsed * 10) * 0.018
          : 0),
      p.z,
    );
    rotation.set(runtime.pitch, runtime.yaw, 0);
    camera.quaternion.setFromEuler(rotation);
    if (p.y < -8) runtime.teleport = [...spawn];
  });
  return (
    <RigidBody
      ref={body}
      position={spawn}
      colliders={false}
      enabledRotations={[false, false, false]}
      mass={1}
      friction={0}
      linearDamping={0.5}
    >
      {isVehicle ? (
        <CuboidCollider args={[2.6, 1, 3.8]} />
      ) : (
        <CapsuleCollider args={[0.5, 0.32]} />
      )}
    </RigidBody>
  );
}
export function Scene() {
  const quality = useShell((s) => s.settings.quality),
    screen = useShell((s) => s.screen),
    dialogue = useGame((s) => s.mission.dialogue);
  return (
    <Canvas
      shadows={qualityPresets[quality].shadows}
      dpr={qualityPresets[quality].scale}
      camera={{
        fov: 70,
        near: 0.08,
        far: 150,
        position: [18, 12, 42],
      }}
      gl={{ antialias: quality !== "low" }}
    >
      <color attach="background" args={["#122b35"]} />
      <fog
        attach="fog"
        args={["#102a33", 35, qualityPresets[quality].drawDistance]}
      />
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow={qualityPresets[quality].shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        position={[10, 25, 8]}
        intensity={2}
        color="#a8cee1"
      />
      <Suspense fallback={null}>
        <Physics paused={screen !== "play" || !!dialogue} timeStep={1 / 60}>
          <Harbor />
          <Player />
          <ViewModel />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
