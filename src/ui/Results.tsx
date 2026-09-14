import { useGame, newRun } from "../game/state/gameStore";
import { useShell } from "../game/state/store";
const labels: Record<string, string> = {
  "forced-entry": "正面を強行突破",
  "side-circuit": "側面回路を停止",
  keycard: "監督者のカードを入手",
  trade: "仲介人との取引成立",
  betrayal: "仲介人を裏切る",
  "control-override": "制御端末を掌握",
  "heart-disconnected": "主電源を切断",
  carrying: "心臓を抱えて運搬",
  towing: "牽引器を使用",
  combat: "警備員と交戦",
  installed: "廃船に心臓を接続",
  supplies: "補給物資を回収",
};
export function Results() {
  const s = useGame((x) => x.mission);
  return (
    <div className="results veil">
      <section>
        <div className="eyebrow">HEIST COMPLETE / A NEW CAPABILITY</div>
        <h1>
          空を、
          <br />
          <em>取り戻した。</em>
        </h1>
        <p>
          あの光は、いま船の心臓になった。
          <br />
          その先には、灯りが脈打つ巨大な深淵が口を開けている。
        </p>
        <div className="result-stats">
          <span>
            経過時間{" "}
            <strong>
              {Math.floor(s.elapsed / 60)}:
              {String(Math.floor(s.elapsed % 60)).padStart(2, "0")}
            </strong>
          </span>
          <span>
            射撃 <strong>{s.stats.shots}</strong>
          </span>
          <span>
            被発見 <strong>{s.stats.detections}</strong>
          </span>
        </div>
        <h2>あなたが残した痕跡</h2>
        <ul>
          {s.evidence
            .filter((e) => labels[e])
            .map((e) => (
              <li key={e}>{labels[e]}</li>
            ))}
        </ul>
        <button
          className="primary"
          onClick={() => {
            newRun();
            useShell.getState().setScreen("play");
            document
              .querySelector("canvas")
              ?.requestPointerLock?.()
              ?.catch(() => {});
          }}
        >
          別の方法でもう一度 ↗
        </button>
        <p className="next-destination">
          NEXT DESTINATION — THE LUMINOUS ABYSS
        </p>
      </section>
    </div>
  );
}
