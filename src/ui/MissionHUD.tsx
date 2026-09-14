import { useGame, dispatch } from "../game/state/gameStore";
import { runtime } from "../game/state/store";
import { worldSignals } from "../game/systems/escape";
import { objective } from "../game/state/mission";
import { nearest, prompt } from "../game/content/interactables";
import { occluded } from "../game/systems/spatial";
export function MissionHUD({ pause }: { pause: () => void }) {
  const { mission: s, saveStatus } = useGame();
  const active = nearest(s, runtime.position);
  const item =
    active && !occluded(runtime.position, active.position, s, active.id)
      ? active
      : null;
  const choose = (
    choice: "accept" | "refuse" | "deliver" | "betray" | "leave",
  ) => {
    dispatch({ type: "choice", choice });
    document
      .querySelector("canvas")
      ?.requestPointerLock?.()
      ?.catch(() => {});
  };
  return (
    <>
      <div className="hud">
        <span className="brand">HH / 01</span>
        <div>
          <small>現在の目的</small>
          <p>{objective(s)}</p>
          <span className={`alert alert-${s.alert}`}>
            {worldSignals[s.alert].label}
          </span>
        </div>
        <button onClick={pause} aria-label="一時停止">
          Ⅱ
        </button>
      </div>
      <div className="reticle">{item ? "◇" : "·"}</div>
      {item && !s.dialogue && s.alert !== "ESCAPE" && (
        <div className="interaction">
          <kbd>E</kbd> {prompt(s, item.id)}
        </div>
      )}
      <div className="radio" role="status">
        <small>港湾通信 / FIELD NOTES</small>
        <p>{s.message}</p>
      </div>
      {s.alert === "ESCAPE" && (
        <div className="interaction">
          {s.ship.ignited
            ? "WASD 操縦 · Space 上昇 · X 下降 · Shift 加速"
            : "E エンジン点火"}{" "}
          / 高度 {Math.max(0, Math.round(s.ship.position[1]))} m
        </div>
      )}
      <div className="bottom">
        <div className="vitals">
          <span>
            体力 <b>{Math.ceil(s.player.health)}</b>
          </span>
          <span>
            短銃 <b>{s.player.ammo}</b> / {s.player.reserve}
          </span>
          <span>
            {s.heart.mode === "carried"
              ? "心臓：運搬中 · Q 降ろす"
              : s.heart.mode === "towed"
                ? "心臓：牽引中 · T 解除"
                : "E 調べる · T 牽引 · F 近接"}
          </span>
        </div>
        <div>
          {saveStatus}
          <br />
          ESC 一時停止
        </div>
      </div>
      {s.dialogue && (
        <div className="dialogue">
          <small>DOCK FIXER / ナギ</small>
          <h2>
            {s.dialogue === "return"
              ? "箱は、持ってきた？"
              : s.dialogue === "thanks"
                ? "約束は果たしたよ。"
                : "その船を飛ばしたいんだね。"}
          </h2>
          <p>
            {s.dialogue === "return"
              ? "箱と引き換えに臨時コードを渡す。見張りは私が引きつける。"
              : s.dialogue === "thanks"
                ? "コードは3分、陽動は2分。心臓を外せば警報は避けられない。貨物出口を使って。"
                : "岸壁の北に置き去りの密輸箱がある。回収してくれれば、倉庫のコードと少しの時間を用意する。"}
          </p>
          <div>
            {s.dialogue === "offer" ? (
              <>
                <button className="primary" onClick={() => choose("accept")}>
                  箱を探してくる
                </button>
                <button onClick={() => choose("refuse")}>
                  自分の方法で入る
                </button>
              </>
            ) : s.dialogue === "return" ? (
              <>
                <button className="primary" onClick={() => choose("deliver")}>
                  箱を渡す
                </button>
                <button onClick={() => choose("betray")}>箱を渡さず脅す</button>
              </>
            ) : (
              <button onClick={() => choose("leave")}>取引を終える</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
