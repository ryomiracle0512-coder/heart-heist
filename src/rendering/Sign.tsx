import { useMemo, useEffect } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { Vec3 } from "../game/levels/harbor";
export function Sign({
  text,
  position,
  rotation = 0,
  color = "#a9cec7",
}: {
  text: string;
  position: Vec3;
  rotation?: number;
  color?: string;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#102b32";
    ctx.fillRect(0, 0, 768, 128);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 760, 120);
    ctx.fillStyle = color;
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 384, 64, 730);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[5.5, 0.92]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
