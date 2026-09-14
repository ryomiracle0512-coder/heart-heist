import { useMemo } from "react";
import { Shape } from "three";
import { landmarks, type Vec3 } from "../game/levels/harbor";
import { Sign } from "./Sign";
export function HeartModel({
  position = landmarks.heart,
}: {
  position?: Vec3;
}) {
  return (
    <group position={position}>
      <mesh>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color="#bcfff1"
          emissive="#57eddd"
          emissiveIntensity={3}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.68, 0.075, 8, 24]} />
        <meshStandardMaterial
          color="#aebc9d"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.68, 0.075, 8, 24]} />
        <meshStandardMaterial color="#92a599" metalness={0.7} />
      </mesh>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 0.65, 0, 0]}>
          <boxGeometry args={[0.13, 1.25, 0.16]} />
          <meshStandardMaterial color="#6b827d" />
        </mesh>
      ))}
      <pointLight color="#6fffe4" intensity={14} distance={13} />
    </group>
  );
}
export function ShipModel({
  position = landmarks.ship,
  powered = false,
}: {
  position?: Vec3;
  powered?: boolean;
}) {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-2.6, 3.6);
    s.lineTo(2.6, 3.6);
    s.lineTo(3.1, 0);
    s.lineTo(1.8, -4);
    s.lineTo(0, -5);
    s.lineTo(-1.8, -4);
    s.lineTo(-3.1, 0);
    s.closePath();
    return s;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 1.2,
              bevelEnabled: true,
              bevelSegments: 1,
              steps: 1,
              bevelSize: 0.18,
              bevelThickness: 0.16,
            },
          ]}
        />
        <meshStandardMaterial
          color="#63797a"
          metalness={0.3}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0, 2.4, 1.5]}>
        <boxGeometry args={[3.6, 1.4, 3]} />
        <meshStandardMaterial color="#718682" />
      </mesh>
      <mesh position={[0, 2.6, -0.1]}>
        <boxGeometry args={[3, 0.65, 0.1]} />
        <meshStandardMaterial color="#729b9d" />
      </mesh>
      {[-1, 1].map((x) => (
        <group key={x} position={[x * 3.4, 1.4, 0.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.85, 6, 8]} />
            <meshStandardMaterial color="#324b54" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 3.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 12]} />
            <meshStandardMaterial
              color="#69ccc1"
              emissive={powered ? "#78ffe0" : "#183536"}
              emissiveIntensity={powered ? 3 : 0.1}
            />
          </mesh>
          {powered && (
            <mesh position={[0, 0, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.5, 2, 12]} />
              <meshBasicMaterial color="#90ffdf" transparent opacity={0.55} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[0, 1.1, -4.15]}>
        <boxGeometry args={[1.9, 1.5, 0.2]} />
        <meshStandardMaterial color="#182e34" />
      </mesh>
      {[-1, 1].map((x) => (
        <group key={x}>
          <mesh position={[x * 2.2, 1.65, 0]}>
            <boxGeometry args={[0.18, 0.15, 7]} />
            <meshStandardMaterial color="#baa075" metalness={0.35} />
          </mesh>
          {[-2, 0, 2].map((z) => (
            <mesh key={z} position={[x * 2.2, 1.77, z]}>
              <sphereGeometry args={[0.1, 6, 4]} />
              <meshStandardMaterial color="#ccbd96" />
            </mesh>
          ))}
        </group>
      ))}
      <Sign text="HEART SOCKET" position={[0, 2.1, -4.3]} rotation={Math.PI} />
    </group>
  );
}
