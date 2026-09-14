import { useMemo, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Shape,
  Path,
  BackSide,
  type Group,
  CubeTexture,
  SRGBColorSpace,
  type Points,
} from "three";
import { useGame } from "../game/state/gameStore";
import { useShell, qualityPresets } from "../game/state/store";
function LightPool({
  x,
  z,
  cyan = false,
}: {
  x: number;
  z: number;
  cyan?: boolean;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,.4)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[x, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial
        map={texture}
        color={cyan ? "#6fddcd" : "#ddb879"}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
    </mesh>
  );
}
function EnvironmentLight() {
  const { scene } = useThree();
  const env = useMemo(() => {
    const faces = Array.from({ length: 6 }, (_, i) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d")!;
      const g = x.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, i === 2 ? "#8dadaf" : "#476879");
      g.addColorStop(0.55, "#264959");
      g.addColorStop(1, "#172d38");
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      return c;
    });
    const cube = new CubeTexture(faces);
    cube.colorSpace = SRGBColorSpace;
    cube.needsUpdate = true;
    return cube;
  }, []);
  useEffect(() => {
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [scene, env]);
  return null;
}
export function Atmosphere() {
  const s = useGame((x) => x.mission),
    quality = useShell((x) => x.settings.quality),
    points = useRef<Points>(null);
  const abyssLights = useRef<Group>(null);
  const oceanShape = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-170, -150);
    shape.lineTo(170, -150);
    shape.lineTo(170, 150);
    shape.lineTo(-170, 150);
    shape.closePath();
    const hole = new Path();
    hole.absarc(0, 84, 22, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return shape;
  }, []);
  const particles = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 36 * 3 }, (_, i) =>
          i % 3 === 1 ? ((i * 7) % 41) / 10 : Math.sin(i * 13) * 2.1,
        ),
      ),
    [],
  );
  useFrame((_, dt) => {
    if (abyssLights.current && useShell.getState().screen === "play")
      abyssLights.current.rotation.y += dt * 0.06;
    if (points.current && useShell.getState().screen === "play")
      points.current.rotation.y += dt * 0.12;
  });
  return (
    <>
      <EnvironmentLight />
      <hemisphereLight args={["#a3becb", "#2f4145", 1.5]} />
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[oceanShape, 48]} />
        <meshStandardMaterial
          color="#153846"
          roughness={0.23}
          metalness={0.45}
        />
      </mesh>
      <mesh position={[0, -16, -84]}>
        <cylinderGeometry args={[21.5, 18, 32, 64, 1, true]} />
        <meshStandardMaterial color="#101d28" side={BackSide} roughness={0.9} />
      </mesh>
      <group position={[0, 0, -84]}>
        <group ref={abyssLights}>
          {Array.from({ length: 18 }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 2.4) * (20 - i * 0.13),
                -2 - i * 1.6,
                Math.sin(i * 2.4) * (20 - i * 0.13),
              ]}
            >
              <sphereGeometry args={[0.22, 6, 4]} />
              <meshBasicMaterial color={i % 3 === 0 ? "#ffd28f" : "#7ef0d8"} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh position={[-65, 60, -110]}>
        <sphereGeometry args={[5, 20, 12]} />
        <meshBasicMaterial color="#c3d6c9" />
      </mesh>
      <points ref={points} position={s.heart.position}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
            count={qualityPresets[quality].particles}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a5ffe1"
          size={0.035}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </points>
      {[
        [-24, 12],
        [0, 0],
        [12, -14],
        [-7, -23],
        [25, 12],
        [-14, 21],
      ].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 2.5, z]}>
            <cylinderGeometry args={[0.07, 0.12, 5, 6]} />
            <meshStandardMaterial color="#69736b" />
          </mesh>
          <mesh position={[x, 5, z]}>
            <boxGeometry args={[0.8, 0.16, 0.6]} />
            <meshStandardMaterial
              color="#ffe1a5"
              emissive="#ffcf81"
              emissiveIntensity={s.power.side || x > -12 ? 1.8 : 0.1}
            />
          </mesh>
          <pointLight
            position={[x, 4.5, z]}
            intensity={s.power.side || x > -12 ? 55 : 5}
            color="#f1bd79"
            distance={16}
          />
          <LightPool {...{ x, z }} />
        </group>
      ))}
      <LightPool x={8} z={-25} cyan />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[-65 + i * 12, 2 + (i % 4) * 3, -133 - (i % 3) * 7]}
        >
          <boxGeometry args={[8, 12 + (i % 4) * 6, 9]} />
          <meshStandardMaterial color="#203c47" />
        </mesh>
      ))}
    </>
  );
}
