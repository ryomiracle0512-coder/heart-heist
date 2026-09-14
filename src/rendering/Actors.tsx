import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group } from "three";
import { useGame } from "../game/state/gameStore";
import { useShell } from "../game/state/store";
import { type Guard } from "../game/state/mission";
import { HeartAsset } from "./assetRegistry";
function GuardModel({ guard: g }: { guard: Guard }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.position.x +=
        (g.position[0] - ref.current.position.x) * Math.min(1, dt * 15);
      ref.current.position.z +=
        (g.position[2] - ref.current.position.z) * Math.min(1, dt * 15);
      ref.current.rotation.y = g.yaw;
    }
  });
  return (
    <group
      ref={ref}
      position={g.position}
      rotation={[0, g.yaw, g.health <= 0 ? Math.PI / 2 : 0]}
    >
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.65, 0.8, 0.42]} />
        <meshStandardMaterial
          color={g.health <= 0 ? "#445255" : "#897859"}
          metalness={0.5}
        />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <boxGeometry args={[0.43, 0.43, 0.42]} />
        <meshStandardMaterial color="#536870" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.68, -0.221]}>
        <boxGeometry args={[0.32, 0.085, 0.03]} />
        <meshStandardMaterial
          color={g.windup > 0 ? "#ff604b" : "#ffd991"}
          emissive={g.windup > 0 ? "#ff4025" : "#927440"}
          emissiveIntensity={g.windup > 0 ? 4 : 1}
        />
      </mesh>
      {[-1, 1].map((x) => (
        <group key={x}>
          <mesh position={[x * 0.2, -0.58, 0]}>
            <boxGeometry args={[0.23, 0.5, 0.28]} />
            <meshStandardMaterial color="#354b53" />
          </mesh>
          <mesh position={[x * 0.45, 0.02, -0.1]} rotation={[0.3, 0, x * 0.15]}>
            <boxGeometry args={[0.2, 0.65, 0.23]} />
            <meshStandardMaterial color="#4b6267" />
          </mesh>
        </group>
      ))}
      <mesh position={[0.42, 0.12, -0.5]}>
        <boxGeometry args={[0.14, 0.14, 0.65]} />
        <meshStandardMaterial color="#273b43" metalness={0.6} />
      </mesh>
      {g.suspicion > 0 && g.health > 0 && (
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.7 * g.suspicion, 0.055, 0.055]} />
          <meshBasicMaterial
            color={g.mode === "combat" ? "#ff7054" : "#e8c27a"}
          />
        </mesh>
      )}
    </group>
  );
}
export function Guards() {
  const guards = useGame((s) => s.mission.guards),
    debug = useShell((s) => s.debug);
  return (
    <>
      {guards.map((g) => (
        <group key={g.id}>
          <GuardModel guard={g} />
          {debug && g.health > 0 && (
            <Line
              points={[g.position, g.lastKnown]}
              color="#f1c666"
              lineWidth={1}
            />
          )}
        </group>
      ))}
    </>
  );
}
export function ViewModel() {
  const ref = useRef<Group>(null);
  const { camera } = useThree();
  const s = useGame((x) => x.mission),
    screen = useShell((x) => x.screen);
  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(camera.position);
      ref.current.quaternion.copy(camera.quaternion);
    }
  });
  if (screen !== "play" || s.alert === "ESCAPE" || s.alert === "COMPLETE")
    return null;
  return (
    <group ref={ref}>
      {s.heart.mode === "carried" ? (
        <group position={[0.25, -0.43, -1]} scale={0.5}>
          <HeartAsset position={[0, 0, 0]} />
        </group>
      ) : (
        <group position={[0.32, -0.32, -0.6]} rotation={[0, 0, -0.05]}>
          <mesh>
            <boxGeometry args={[0.12, 0.15, 0.46]} />
            <meshStandardMaterial
              color="#486269"
              metalness={0.7}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, -0.12, 0.13]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.12]} />
            <meshStandardMaterial color="#9b805d" />
          </mesh>
          <mesh position={[0, 0.09, -0.06]}>
            <boxGeometry args={[0.02, 0.04, 0.08]} />
            <meshBasicMaterial color="#8cedd2" />
          </mesh>
          {s.cooldown > 0.32 && s.message.includes("射撃") && (
            <mesh position={[0, 0, -0.28]}>
              <sphereGeometry args={[0.09, 6, 4]} />
              <meshBasicMaterial color="#ffc182" />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}
