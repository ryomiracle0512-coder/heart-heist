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
export type InputMode = "keyboard" | "mouse" | "touch";
export type Settings = {
  inputMode: InputMode;
  leftHanded: boolean;
  largeText: boolean;
  aimAssist: boolean;
  volume: number;
  sensitivity: number;
  reducedMotion: boolean;
  quality: keyof typeof qualityPresets;
};
const touchDefault =
  typeof window !== "undefined" &&
  (navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches);
export const defaultSettings: Settings = {
  inputMode: touchDefault ? "touch" : "keyboard",
  leftHanded: false,
  largeText: false,
  aimAssist: true,
  volume: 0.45,
  sensitivity: 1,
  reducedMotion: true,
  quality: touchDefault ? "low" : "medium",
};
function readSettings(): Settings {
  try {
    if (typeof localStorage === "undefined") return defaultSettings;
    const v = JSON.parse(
      localStorage.getItem("heart-heist.settings.v2") ||
        localStorage.getItem("heart-heist.settings.v1") ||
        "null",
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
      return {
        ...defaultSettings,
        volume: v.volume,
        sensitivity: v.sensitivity,
        reducedMotion: v.reducedMotion,
        quality: v.quality,
        inputMode: ["keyboard", "mouse", "touch"].includes(v.inputMode)
          ? v.inputMode
          : defaultSettings.inputMode,
        leftHanded: v.leftHanded === true,
        largeText: v.largeText === true,
        aimAssist: v.aimAssist !== false,
      };
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
          localStorage.setItem("heart-heist.settings.v2", JSON.stringify(next));
      } catch {
        /* Settings still apply in memory. */
      }
      return { settings: next };
    }),
}));
