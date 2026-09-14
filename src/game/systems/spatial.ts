import { boxes, type Vec3 } from "../levels/harbor";
import { doorOpen, type Mission } from "../state/mission";
export const doorGeometry = [
  { id: "main", position: [1, 1.5, -4] as Vec3, size: [7.5, 3, 0.6] as Vec3 },
  {
    id: "side",
    position: [-12, 1.6, -19] as Vec3,
    size: [0.6, 3.2, 6] as Vec3,
  },
  {
    id: "chamber",
    position: [8.25, 1.5, -20] as Vec3,
    size: [5.5, 3, 0.5] as Vec3,
  },
  {
    id: "cargo",
    position: [16, 1.6, -17] as Vec3,
    size: [0.6, 3.2, 6] as Vec3,
  },
];
export function segmentBox(
  a: Vec3,
  b: Vec3,
  position: Vec3,
  size: Vec3,
  padding = 0,
) {
  let low = 0,
    high = 1;
  for (let axis = 0; axis < 3; axis++) {
    const min = position[axis] - size[axis] / 2 - padding,
      max = position[axis] + size[axis] / 2 + padding,
      d = b[axis] - a[axis];
    if (Math.abs(d) < 1e-8) {
      if (a[axis] < min || a[axis] > max) return false;
    } else {
      let t1 = (min - a[axis]) / d,
        t2 = (max - a[axis]) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      low = Math.max(low, t1);
      high = Math.min(high, t2);
      if (low > high) return false;
    }
  }
  return high > 0.01 && low < 0.99;
}
export function occluded(
  a: Vec3,
  b: Vec3,
  s: Mission,
  ignoreDoor = "",
  padding = 0,
) {
  return (
    boxes.some(
      (o) =>
        o.solid &&
        !o.id.includes("stair") &&
        segmentBox(a, b, o.position, o.size, padding),
    ) ||
    doorGeometry.some(
      (o) =>
        o.id !== ignoreDoor &&
        !doorOpen(s, o.id) &&
        segmentBox(a, b, o.position, o.size, padding),
    )
  );
}
export function transportStep(s: Mission, position: Vec3, yaw: number) {
  if (s.heart.mode !== "carried" && s.heart.mode !== "towed") return;
  const target: Vec3 =
    s.heart.mode === "carried"
      ? [position[0], position[1] + 0.4, position[2]]
      : [
          position[0] + Math.sin(yaw) * 2.2,
          0.75,
          position[2] + Math.cos(yaw) * 2.2,
        ];
  if (!occluded(s.heart.position, target, s, "", 0.2))
    s.heart.position = target;
  else if (s.heart.mode === "towed") {
    s.message = "牽引フレームが障害物に当たった。少し戻るか、Eで持ち上げよう。";
    if (
      Math.hypot(
        position[0] - s.heart.position[0],
        position[2] - s.heart.position[2],
      ) > 6
    ) {
      s.heart.mode = "free";
      s.message = "牽引ケーブルが外れた。心臓の光へ戻って回収する。";
    }
  }
}
