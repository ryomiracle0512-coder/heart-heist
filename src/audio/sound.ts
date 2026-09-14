import { Howl, Howler } from "howler";
import sprites from "../assets/generated/audio-sprites.json";
import cuesUrl from "../assets/generated/cues.wav";
import ambientUrl from "../assets/generated/ambient.wav";
import alertUrl from "../assets/generated/alert.wav";
import escapeUrl from "../assets/generated/escape.wav";
import type { Alert } from "../game/state/mission";
let failed = false;
const onloaderror = () => {
  failed = true;
};
const cues = new Howl({
  src: [cuesUrl],
  sprite: Object.fromEntries(
    Object.entries(sprites).map(([name, v]) => [
      name,
      [v[0], v[1]] as [number, number],
    ]),
  ),
  volume: 0.6,
  onloaderror,
});
const ambient = new Howl({
  src: [ambientUrl],
  loop: true,
  volume: 0.5,
  onloaderror,
});
const alert = new Howl({
  src: [alertUrl],
  loop: true,
  volume: 0.35,
  onloaderror,
});
const escape = new Howl({
  src: [escapeUrl],
  loop: true,
  volume: 0.4,
  onloaderror,
});
let active: number[] = [];
let limit = 6;
export const sound = {
  get failed() {
    return failed;
  },
  start() {
    if (Howler.ctx?.state === "suspended")
      void Howler.ctx.resume().catch(() => {});
    if (!ambient.playing()) ambient.play();
  },
  volume(value: number, concurrency = 6) {
    Howler.volume(value);
    limit = concurrency;
  },
  cue(name: keyof typeof sprites) {
    active = active.filter((id) => cues.playing(id));
    if (active.length >= limit) return;
    active.push(cues.play(name));
  },
  state(state: Alert) {
    if (["ALERT", "LOCKDOWN"].includes(state)) {
      if (!alert.playing()) alert.play();
      escape.pause();
    } else if (state === "ESCAPE") {
      alert.pause();
      if (!escape.playing()) escape.play();
    } else {
      alert.pause();
      escape.pause();
    }
  },
  pause() {
    ambient.pause();
    alert.pause();
    escape.pause();
    cues.stop();
    active = [];
  },
};
