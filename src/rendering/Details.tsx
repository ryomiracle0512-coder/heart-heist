import { useGame } from "../game/state/gameStore";
import { Sign } from "./Sign";
const steel = "#50666b",
  brass = "#b09063";
export function Details() {
  const powered = useGame((s) => s.mission.power.heart);
  return (
    <>
      {/* Structural ribs stay within the existing warehouse wall colliders. */}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i}>
          <mesh position={[-11.48, 3, -5 - i * 3]}>
            <boxGeometry args={[0.15, 5.8, 0.13]} />
            <meshStandardMaterial color={steel} metalness={0.3} />
          </mesh>
          <mesh position={[15.48, 3, -5 - i * 3]}>
            <boxGeometry args={[0.15, 5.8, 0.13]} />
            <meshStandardMaterial color={steel} metalness={0.3} />
          </mesh>
          <mesh position={[2, 6.2, -5 - i * 3]}>
            <boxGeometry args={[28, 0.2, 0.2]} />
            <meshStandardMaterial color={steel} />
          </mesh>
        </group>
      ))}
      {[-10, -5, 6, 11, 15].map((x) => (
        <group key={x}>
          <mesh position={[x, 3, -3.5]}>
            <boxGeometry args={[0.15, 5.8, 0.14]} />
            <meshStandardMaterial color={brass} />
          </mesh>
          <mesh position={[x, 5.35, -3.45]}>
            <boxGeometry args={[2.6, 0.45, 0.08]} />
            <meshStandardMaterial
              color="#88afb1"
              emissive="#43615c"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
      {/* Original dock crane, anchored behind the existing perimeter. */}
      <group position={[24, 0, -32]}>
        {[-2, 2].map((x) => (
          <mesh key={x} position={[x, 8, 0]}>
            <boxGeometry args={[0.6, 16, 0.7]} />
            <meshStandardMaterial color={steel} metalness={0.35} />
          </mesh>
        ))}
        <mesh position={[-7, 16, 0]}>
          <boxGeometry args={[24, 0.8, 1.2]} />
          <meshStandardMaterial color={brass} metalness={0.2} />
        </mesh>
        <mesh position={[-7, 17, 0]}>
          <boxGeometry args={[24, 0.13, 1.3]} />
          <meshStandardMaterial color={steel} />
        </mesh>
        <mesh position={[-9, 11.5, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 8, 5]} />
          <meshStandardMaterial color="#88958a" />
        </mesh>
        <mesh position={[-9, 7.2, 0]}>
          <torusGeometry args={[0.35, 0.09, 6, 12, Math.PI * 1.7]} />
          <meshStandardMaterial color={brass} />
        </mesh>
        <mesh position={[0, 14, 0]}>
          <boxGeometry args={[3, 2.3, 2.5]} />
          <meshStandardMaterial color="#2f515d" metalness={0.35} />
        </mesh>
        <mesh position={[0, 14, -1.3]}>
          <boxGeometry args={[2.2, 1.25, 0.05]} />
          <meshStandardMaterial
            color="#85a9a0"
            emissive="#6c9d88"
            emissiveIntensity={powered ? 0.5 : 0}
          />
        </mesh>
      </group>
      {/* Ground guides and restrained scuffs do not add collision. */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[18, 0.017, 18 - i * 2.4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.18, 1.1]} />
          <meshBasicMaterial color="#b19d76" transparent opacity={0.65} />
        </mesh>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh
          key={i}
          position={[1, 0.018, 14 - i * 3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.08, 1.5]} />
          <meshBasicMaterial color="#65867f" />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[-31, 0.018, -30 + i * 6]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.4, 3]} />
          <meshBasicMaterial color="#a89066" />
        </mesh>
      ))}
      <mesh position={[8, 0.03, -22]}>
        <boxGeometry args={[0.08, 0.04, 6]} />
        <meshStandardMaterial
          color="#69cdbb"
          emissive="#36c4aa"
          emissiveIntensity={powered ? 2 : 0}
        />
      </mesh>
      <mesh position={[4, 0.03, -18.5]}>
        <boxGeometry args={[8, 0.04, 0.08]} />
        <meshStandardMaterial
          color="#69cdbb"
          emissive="#36c4aa"
          emissiveIntensity={powered ? 2 : 0}
        />
      </mesh>
      <Sign text="01 / THE LEVITATION HEART" position={[8, 3.1, -29.5]} />
      <Sign text="← CONTROL / ACCESS" position={[-7, 3.6, -19]} />
      <Sign text="NAGI / DOCK FIXER" position={[-25, 2.7, 11.5]} />
      <Sign text="↓ CONTRABAND" position={[-26, 2.4, -11]} />
      {/* Existing cover silhouettes are detailed without changing their footprint. */}
      {[
        [-4, 5],
        [8, 7],
        [-20, -3],
        [23, -17],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[-1, 1].map((t) => (
            <mesh key={t} position={[t * 1.2, 0.85, 1.02]}>
              <boxGeometry args={[0.1, 1.6, 0.035]} />
              <meshStandardMaterial color={brass} />
            </mesh>
          ))}
          <mesh position={[0, 0.9, 1.04]}>
            <boxGeometry args={[0.75, 0.5, 0.04]} />
            <meshStandardMaterial color="#223a42" />
          </mesh>
        </group>
      ))}
    </>
  );
}
