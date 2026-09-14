/** Single replacement boundary for the original hero assets. Gameplay uses IDs and sockets. */
export { HeartModel as HeartAsset, ShipModel as ShipAsset } from "./Models";
export const assetBudgets = {
  heart: 1500,
  ship: 3000,
  guard: 500,
  harbor: 45000,
} as const;
