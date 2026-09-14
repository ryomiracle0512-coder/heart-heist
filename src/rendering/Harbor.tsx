import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Line } from "@react-three/drei";
import { Guards } from "./Actors";
import { Details } from "./Details";
import { Atmosphere } from "./Atmosphere";
import { Sign } from "./Sign";
import { HeartAsset, ShipAsset } from "./assetRegistry";
import { worldSignals } from "../game/systems/escape";
import { useGame } from "../game/state/gameStore";
import { doorOpen } from "../game/state/mission";
import { doorGeometry } from "../game/systems/spatial";
import { boxes, landmarks, signs } from "../game/levels/harbor";
export function Harbor() {
  const s = useGame((state) => state.mission);
  return (
    <>
      <Atmosphere />
      <Details />
      <RigidBody type="fixed" colliders="cuboid">
        {boxes
          .filter((b) => b.solid && !b.id.includes("stair"))
          .map((b) => (
            <mesh key={b.id} position={b.position} receiveShadow castShadow>
              <boxGeometry args={b.size} />
              <meshStandardMaterial
                color={b.color}
                roughness={b.id === "harbor-floor" ? 0.28 : 0.72}
                metalness={b.id === "harbor-floor" ? 0.2 : 0.12}
              />
            </mesh>
          ))}
      </RigidBody>
      {boxes
        .filter((b) => b.id.includes("stair"))
        .map((b) => (
          <mesh key={b.id} position={b.position}>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} />
          </mesh>
        ))}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[2, 0.075, 3.75]}
          position={[-7, 0.97, -14.6]}
          rotation={[0.28, 0, 0]}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[1.5, 0.075, 2.5]}
          position={[-17, 0.98, -24.15]}
          rotation={[0.46, 0, 0]}
        />
      </RigidBody>
      {s.heart.mode !== "carried" && <HeartAsset position={s.heart.position} />}
      <Guards />
      <pointLight
        position={[0, 5, -5]}
        intensity={50}
        distance={24}
        color={worldSignals[s.alert].lamp}
      />
      <pointLight
        position={[-15, 3, -17]}
        intensity={s.power.side ? 15 : 0}
        color="#e9ba72"
        distance={12}
      />
      <pointLight
        position={[8, 3, -25]}
        intensity={s.power.heart ? 22 : 0}
        color="#81ffdb"
        distance={15}
      />
      <mesh position={[0, 14, -57]}>
        <torusGeometry args={[13, 0.13, 6, 60]} />
        <meshBasicMaterial color="#9eeacf" />
      </mesh>
      <Sign text="↑ EXTRACTION / 10m" position={[0, 18, -56]} />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[0, -i * 4, -84]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[21 - i * 0.7, 0.18, 5, 48]} />
          <meshBasicMaterial color={i % 2 ? "#498f9c" : "#cf9f65"} />
        </mesh>
      ))}
      {s.heart.mode === "towed" && (
        <Line
          points={[s.player.position, s.heart.position]}
          color="#9be0c5"
          lineWidth={2}
        />
      )}
      <group
        rotation={[0, s.alert === "ESCAPE" ? s.player.yaw : 0, 0]}
        position={s.ship.position}
      >
        <ShipAsset
          position={[0, 0, 0]}
          powered={s.heart.mode === "installed"}
        />
      </group>
      {doorGeometry
        .filter((d) => !doorOpen(s, d.id))
        .map((d) => (
          <RigidBody key={d.id} type="fixed">
            <mesh position={d.position}>
              <boxGeometry args={d.size} />
              <meshStandardMaterial
                color={d.id === "chamber" ? "#3e7d79" : "#526674"}
                metalness={0.4}
              />
            </mesh>
          </RigidBody>
        ))}
      {!s.inventory.includes("keycard") && (
        <mesh position={landmarks.keycard}>
          <boxGeometry args={[0.4, 0.12, 0.25]} />
          <meshStandardMaterial color="#a6ffe1" emissive="#52bca3" />
        </mesh>
      )}
      {signs.map(([text, position, rotation]) => (
        <Sign key={text} {...{ text, position, rotation }} />
      ))}
      <mesh position={landmarks.fixer}>
        <capsuleGeometry args={[0.38, 0.8, 4, 8]} />
        <meshStandardMaterial color="#ac956b" />
      </mesh>
      {!s.inventory.includes("crate") && s.deal !== "complete" && (
        <mesh position={landmarks.crate}>
          <boxGeometry args={[1.2, 1.1, 1.2]} />
          <meshStandardMaterial color="#b09358" />
        </mesh>
      )}
      <mesh position={landmarks.control}>
        <boxGeometry args={[1.4, 1, 0.4]} />
        <meshStandardMaterial color="#4e9d92" />
      </mesh>
      <mesh position={landmarks.side}>
        <boxGeometry args={[0.5, 1, 0.4]} />
        <meshStandardMaterial color="#cca04f" />
      </mesh>
      <mesh position={[8, 6, -25]}>
        <cylinderGeometry args={[0.02, 0.18, 9, 8]} />
        <meshBasicMaterial color="#64e4d2" transparent opacity={0.3} />
      </mesh>
    </>
  );
}
