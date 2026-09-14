import { attack, reload } from "./combat";
import {
  type Mission,
  evidence,
  transition,
  emitNoise,
} from "../state/mission";
import { distance, interactables } from "../content/interactables";
import type { Vec3 } from "../levels/harbor";
export type GameEvent =
  | { type: "interact"; id: string; position: Vec3 }
  | {
      type: "choice";
      choice: "accept" | "refuse" | "deliver" | "betray" | "leave";
    }
  | { type: "tow" | "drop" | "reload" | "ignite" }
  | { type: "primary" | "melee"; direction: Vec3 };
export function applyEvent(previous: Mission, event: GameEvent): Mission {
  const s = structuredClone(previous);
  if (s.player.health <= 0 || s.alert === "COMPLETE") return s;
  if (event.type === "primary" || event.type === "melee") {
    attack(s, event.type, event.direction);
    return s;
  }
  if (event.type === "reload") {
    reload(s);
    return s;
  }
  if (event.type === "choice") {
    if (!s.dialogue) return s;
    if (event.choice === "accept") {
      s.deal = "accepted";
      s.message = "ナギ「岸壁の北の箱を持ってきて。コードと陽動を用意する」";
    }
    if (event.choice === "refuse") {
      s.deal = "refused";
      s.message = "ナギ「分かった。正面は警備が厚い。整備口も見ておきな」";
    }
    if (event.choice === "deliver" && s.inventory.includes("crate")) {
      s.inventory = s.inventory.filter((i) => i !== "crate");
      s.inventory.push("code");
      s.deal = "complete";
      s.codeExpires = s.elapsed + 180;
      s.distractionUntil = s.elapsed + 120;
      evidence(s, "trade");
      s.message = "ナギ「コードは3分間有効。2分だけ見張りを岸壁へ引きつける」";
    }
    if (event.choice === "betray") {
      s.deal = "betrayed";
      evidence(s, "betrayal");
      transition(
        s,
        "ALERT",
        "ナギが裏切りを無線で通報。正面の警備がこちらを捜している。",
      );
      emitNoise(s, [-25, 1, 12], 35);
    }
    s.dialogue = null;
    return s;
  }
  if (event.type === "drop") {
    if (s.heart.mode === "carried" || s.heart.mode === "towed") {
      s.heart.mode = "free";
      s.message = "心臓を降ろした。Eで持ち直す / Tで牽引。";
    }
    return s;
  }
  if (event.type === "tow") {
    if (s.heart.mode === "towed") {
      s.heart.mode = "free";
      s.message = "牽引ケーブルを外した。";
    } else if (
      (s.heart.mode === "free" || s.heart.mode === "carried") &&
      distance(s.player.position, s.heart.position) < 4
    ) {
      s.heart.mode = "towed";
      evidence(s, "towing");
      s.message = "牽引開始。速く運べるが、金属音で位置が知られる。";
      emitNoise(s, s.player.position, 20);
    }
    return s;
  }
  if (event.type === "ignite" && s.alert === "ESCAPE") {
    s.ship.ignited = true;
    s.message = "船が浮力を得た。Space 上昇 / WASD 操縦 / Shift ブースト。";
    return s;
  }
  if (event.type !== "interact") return s;
  const item = interactables.find((i) => i.id === event.id);
  if (!item) return s;
  const itemPos = event.id === "heart" ? s.heart.position : item.position;
  if (distance(event.position, itemPos) > item.radius) return s;
  switch (event.id) {
    case "main":
      if (!s.power.heart) {
        s.message = "停電で正面シャッターが落ちた。東の貨物出口へ。";
        break;
      }
      if (s.inventory.includes("code") && s.elapsed < s.codeExpires) {
        s.doors.main = true;
        s.message = "臨時コードを承認。心臓室にも同じコードが使える。";
      } else {
        s.doors.main = true;
        evidence(s, "forced-entry");
        transition(
          s,
          "ALERT",
          "正面シャッターを強行突破。警備員に音を聞かれた。",
        );
        emitNoise(s, event.position, 32);
      }
      break;
    case "side":
      s.power.side = !s.power.side;
      if (!s.power.side) {
        evidence(s, "side-circuit");
        transition(
          s,
          s.alert === "CALM" ? "SUSPICIOUS" : s.alert,
          "側面回路を切断。センサー停止、整備扉が開いた。見張りが停電を調べに来る。",
        );
        emitNoise(s, event.position, 17);
      } else {
        s.message = "側面回路を復旧。整備扉が閉じ、センサーが再起動した。";
      }
      break;
    case "keycard":
      if (!s.inventory.includes("keycard")) s.inventory.push("keycard");
      evidence(s, "keycard");
      s.message = "監督者のカードを入手。心臓室の扉を開けられる。";
      break;
    case "control":
      s.doors.chamber = true;
      evidence(s, "control-override");
      s.message = "制御端末から心臓室を解錠。青いケーブルをたどろう。";
      break;
    case "chamber":
      if (
        s.inventory.includes("keycard") ||
        (s.inventory.includes("code") && s.elapsed < s.codeExpires) ||
        s.doors.chamber
      ) {
        s.doors.chamber = true;
        s.message = "心臓室を解錠。心臓はクレーンとシャッターの主電源だ。";
      } else {
        s.message =
          "要認証。制御室の端末、監督者のカード、または仲介人のコードが必要。";
      }
      break;
    case "crate":
      if (!s.inventory.includes("crate") && s.deal !== "complete") {
        s.inventory.push("crate");
        s.message = "密輸箱を回収。岸壁の仲介人に届けられる。";
      }
      break;
    case "fixer":
      s.dialogue = s.inventory.includes("crate")
        ? "return"
        : s.deal === "complete"
          ? "thanks"
          : "offer";
      break;
    case "heart":
      if (!s.doors.chamber) {
        s.message = "先に心臓室のロックを解除する。";
        break;
      }
      if (s.heart.mode === "mounted") {
        s.heart.mode = "free";
        s.power.heart = false;
        evidence(s, "heart-disconnected");
        transition(
          s,
          "LOCKDOWN",
          "心臓を切断。クレーン停止、貨物出口が開放。正面シャッターは落下、増援が接近。",
        );
        emitNoise(s, event.position, 60);
      } else if (s.heart.mode === "free") {
        s.heart.mode = "carried";
        evidence(s, "carrying");
        s.message =
          "心臓を抱えた。両手が塞がり、攻撃できない。Tで牽引 / Qで降ろす。";
      }
      break;
    case "socket":
      if (s.heart.mode === "installed") {
        s.ship.ignited = true;
        s.message = "点火。Spaceで上昇し、北の光のゲートへ。";
      } else if (
        (s.heart.mode === "carried" ||
          s.heart.mode === "towed" ||
          s.heart.mode === "free") &&
        distance(s.heart.position, item.position) < 6
      ) {
        s.heart.mode = "installed";
        s.heart.position = [-14, 1.3, 24];
        evidence(s, "installed");
        transition(
          s,
          "ESCAPE",
          "心臓を接続。廃船の浮遊機構が復活した。Eで点火し、操縦して脱出しよう。",
        );
      } else {
        s.message = "心臓をこのソケットまで運んでくる。";
      }
      break;
    case "cargo":
      s.message = s.power.heart
        ? "主電源に連動した貨物シャッター。心臓を外すと開く。"
        : "貨物出口が開いている。廃船は港の南西。";
      break;
    case "supplies":
      if (!s.evidence.includes("supplies")) {
        s.player.health = 100;
        s.player.reserve = Math.min(80, s.player.reserve + 24);
        evidence(s, "supplies");
        s.message = "救急パックと予備弾を回収。体力を回復した。";
      }
      break;
  }
  return s;
}
