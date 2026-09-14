import { missionSchema, type Mission } from "../state/mission";
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export type LoadResult =
  | { kind: "ok"; mission: Mission }
  | { kind: "empty" | "invalid" | "unavailable" };
export class SaveRepository {
  constructor(
    private storage: StorageAdapter,
    private key = "heart-heist.checkpoint.v1",
  ) {}
  load(): LoadResult {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return { kind: "empty" };
      const result = missionSchema.safeParse(JSON.parse(raw));
      return result.success
        ? { kind: "ok", mission: result.data }
        : { kind: "invalid" };
    } catch {
      return { kind: "invalid" };
    }
  }
  save(mission: Mission) {
    try {
      this.storage.setItem(
        this.key,
        JSON.stringify(missionSchema.parse(mission)),
      );
      return true;
    } catch {
      return false;
    }
  }
  clear() {
    try {
      this.storage.removeItem(this.key);
    } catch {
      /* Storage failure does not prevent a new local run. */
    }
  }
}
export const saves = new SaveRepository({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
});
