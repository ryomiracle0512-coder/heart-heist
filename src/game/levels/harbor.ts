import { z } from "zod";
export const vectorSchema = z.tuple([
  z.number().finite(),
  z.number().finite(),
  z.number().finite(),
]);
export type Vec3 = z.infer<typeof vectorSchema>;
const boxSchema = z.object({
  id: z.string(),
  position: vectorSchema,
  size: vectorSchema,
  color: z.string(),
  solid: z.boolean().default(true),
});
export type LevelBox = z.infer<typeof boxSchema>;
const box = (
  id: string,
  position: Vec3,
  size: Vec3,
  color = "#30434b",
  solid = true,
) => ({ id, position, size, color, solid });
export const spawn: Vec3 = [-14, 1.1, 19];
export const boxes: LevelBox[] = z
  .array(boxSchema)
  .parse([
    box("harbor-floor", [0, -0.6, 0], [64, 1.2, 80], "#253c43"),
    box("north-wall", [0, 3, -40], [64, 6, 1]),
    box("east-wall", [32, 2, 0], [1, 4, 80]),
    box("west-rail", [-32, 1, 0], [1, 2, 80]),
    box("south-wall", [14, 2, 40], [36, 4, 1]),
    box("warehouse-west-front", [-12, 3, -10], [0.8, 6, 12]),
    box("warehouse-west-back", [-12, 3, -26], [0.8, 6, 8]),
    box("warehouse-east-front", [16, 3, -9], [0.8, 6, 10]),
    box("warehouse-east-back", [16, 3, -25], [0.8, 6, 6]),
    box("warehouse-front-left", [-7.5, 3, -4], [9, 6, 0.8]),
    box("warehouse-front-right", [10.5, 3, -4], [11, 6, 0.8]),
    box("warehouse-lintel", [1, 5.25, -4], [8, 1.5, 0.8]),
    box("warehouse-back", [2, 3, -30], [28, 6, 0.8]),
    box("chamber-west", [-1.5, 2, -25], [0.5, 4, 10]),
    box("heart-partition-left", [2, 2, -20], [7, 4, 0.5]),
    box("heart-partition-right", [13.5, 2, -20], [5, 4, 0.5]),
    box("heart-lintel", [8.25, 3.5, -20], [5.5, 1, 0.5]),
    box("control-deck", [-7, 1.8, -23], [8, 0.5, 10]),
    box("control-back", [-7, 3.3, -28], [8, 3, 0.3]),
    box("yard-cover-a", [-4, 0.9, 5], [5, 1.8, 2], "#526168"),
    box("yard-cover-b", [8, 1, 7], [4, 2, 4], "#44575b"),
    box("yard-cover-c", [-20, 0.8, -3], [3, 1.6, 5], "#485b5b"),
    box("warehouse-cover", [1, 0.8, -13], [4, 1.6, 2], "#5a696c"),
    box("cargo-cover", [23, 0.8, -17], [3, 1.6, 4], "#617074"),
    box("quay-edge", [-26, -0.02, 3], [9, 0.04, 28], "#3c4d55"),
    box("quay-step", [-19, 0.15, 7], [3, 0.3, 4]),
    ...Array.from({ length: 8 }, (_, i) =>
      box(
        `control-stair-${i}`,
        [-7, 0.125 * (i + 1), -12 - i * 0.75],
        [4, 0.25 * (i + 1), 0.8],
        "#50616a",
      ),
    ),
    ...Array.from({ length: 5 }, (_, i) =>
      box(
        `west-stair-${i}`,
        [-17, 0.2 * (i + 1), -23 - i * 0.7],
        [3, 0.4 * (i + 1), 0.8],
        "#536468",
      ),
    ),
    box("west-catwalk", [-13, 1.9, -27], [8, 0.3, 3], "#586c71"),
  ]);
export const landmarks = {
  ship: [-14, 0, 26] as Vec3,
  heart: [8, 1.5, -25] as Vec3,
  fixer: [-25, 1, 12] as Vec3,
  crate: [-26, 1, -10] as Vec3,
  control: [-7, 2.6, -24] as Vec3,
  side: [-15, 1.2, -17] as Vec3,
  keycard: [-8, 2.6, -21] as Vec3,
};
export function solidAt(x: number, z: number, r = 0.4, excludeFloor = true) {
  return boxes.some(
    (b) =>
      b.solid &&
      (!excludeFloor || b.position[1] > 0) &&
      Math.abs(x - b.position[0]) < b.size[0] / 2 + r &&
      Math.abs(z - b.position[2]) < b.size[2] / 2 + r,
  );
}
export const signs: [string, Vec3, number][] = [
  ["HEART STORAGE  /  01", [1, 4.5, -3.48], 0],
  ["CONTROL", [-7, 4.4, -27.75], 0],
  ["CARGO EXIT  →", [15.5, 3, -17], -Math.PI / 2],
  ["MAINTENANCE", [-12.5, 3, -18], -Math.PI / 2],
  ["QUAY  /  TRADES", [-25, 3, 15], 0],
  ["SALVAGE  /  09", [-14, 4, 29], 0],
];
