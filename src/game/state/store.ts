import { create } from "zustand";
export type Vec3 = [number, number, number];
export const runtime = {
  position: [-14, 1.1, 19] as Vec3,
  yaw: 0,
  pitch: 0,
  fps: 60,
  frameMs: 16.7,
  drawCalls: 0,
  triangles: 0,
  teleport: null as Vec3 | null,
};
export const qualityPresets = {
  high: {
    scale: 1,
    shadows: true,
    particles: 36,
    drawDistance: 140,
    post: false,
    foliage: 0,
    audioConcurrency: 10,
  },
  medium: {
    scale: 0.85,
    shadows: false,
    particles: 18,
    drawDistance: 110,
    post: false,
    foliage: 0,
    audioConcurrency: 6,
  },
  low: {
    scale: 0.65,
    shadows: false,
    particles: 6,
    drawDistance: 85,
    post: false,
    foliage: 0,
    audioConcurrency: 4,
  },
};
export type Settings = {
  volume: number;
  sensitivity: number;
  reducedMotion: boolean;
  quality: keyof typeof qualityPresets;
};
const defaultSettings: Settings = {
  volume: 0.45,
  sensitivity: 1,
  reducedMotion: true,
  quality: "medium",
};
function readSettings(): Settings {
  try {
    if (typeof localStorage === "undefined") return defaultSettings;
    const v = JSON.parse(
      localStorage.getItem("heart-heist.settings.v1") || "null",
    );
    if (
      v &&
      typeof v.volume === "number" &&
      v.volume >= 0 &&
      v.volume <= 1 &&
      typeof v.sensitivity === "number" &&
      v.sensitivity >= 0.25 &&
      v.sensitivity <= 2 &&
      typeof v.reducedMotion === "boolean" &&
      ["high", "medium", "low"].includes(v.quality)
    )
      return v;
  } catch {
    /* Invalid settings use readable defaults. */
  }
  return defaultSettings;
}
type Shell = {
  screen: "title" | "play" | "pause" | "results";
  settings: Settings;
  debug: boolean;
  ready: boolean;
  notice: string;
  setScreen: (s: Shell["screen"]) => void;
  setSettings: (s: Partial<Settings>) => void;
};
export const useShell = create<Shell>((set) => ({
  screen: "title",
  settings: readSettings(),
  debug: false,
  ready: false,
  notice: "",
  setScreen: (screen) => set({ screen }),
  setSettings: (settings) =>
    set((s) => {
      const next = { ...s.settings, ...settings };
      try {
        if (typeof localStorage !== "undefined")
          localStorage.setItem("heart-heist.settings.v1", JSON.stringify(next));
      } catch {
        /* Settings still apply in memory. */
      }
      return { settings: next };
    }),
}));
