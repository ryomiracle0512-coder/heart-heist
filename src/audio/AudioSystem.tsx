import { useEffect, useRef } from "react";
import { useGame } from "../game/state/gameStore";
import { useShell, qualityPresets } from "../game/state/store";
import { sound } from "./sound";
export function AudioSystem() {
  const s = useGame((x) => x.mission);
  const { screen, settings } = useShell();
  const previous = useRef(s);
  useEffect(() => {
    sound.volume(
      settings.volume,
      qualityPresets[settings.quality].audioConcurrency,
    );
  }, [settings.volume, settings.quality]);
  useEffect(() => {
    if (screen === "play") {
      sound.start();
      sound.state(s.alert);
    } else if (screen === "results") {
      sound.pause();
      sound.cue("complete");
    } else sound.pause();
    return () => sound.pause();
  }, [screen, s.alert]);
  useEffect(() => {
    const p = previous.current;
    if (screen === "play") {
      if (p.alert !== s.alert)
        sound.cue(
          s.alert === "COMPLETE"
            ? "complete"
            : s.alert === "ESCAPE"
              ? "connect"
              : "detect",
        );
      if (p.stats.shots !== s.stats.shots) sound.cue("shot");
      if (p.stats.hits !== s.stats.hits) sound.cue("hit");
      if (s.player.health < p.player.health) sound.cue("damage");
      if (p.power.heart !== s.power.heart || p.power.side !== s.power.side)
        sound.cue("power");
      if (p.heart.mode !== s.heart.mode)
        sound.cue(s.heart.mode === "towed" ? "tow" : "confirm");
      if (p.ship.ignited !== s.ship.ignited && s.ship.ignited)
        sound.cue("ignite");
      if (s.ship.boost > p.ship.boost) sound.cue("boost");
      if (p.message !== s.message && s.message.includes("弾切れ"))
        sound.cue("dry");
      if (
        Math.floor(s.elapsed * 2) !== Math.floor(p.elapsed * 2) &&
        s.alert !== "ESCAPE" &&
        Math.hypot(
          s.player.position[0] - p.player.position[0],
          s.player.position[2] - p.player.position[2],
        ) > 0.1
      )
        sound.cue("step");
    }
    previous.current = s;
  }, [s, screen]);
  return sound.failed ? (
    <div className="audio-note">音声を読み込めません。字幕で続行できます。</div>
  ) : null;
}
