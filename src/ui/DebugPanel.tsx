import { useGame, newRun } from "../game/state/gameStore";
import { runtime } from "../game/state/store";
export function DebugPanel() {
  return (
    <div className="debug interactive-debug">
      {runtime.fps} FPS · {runtime.drawCalls} draws · {runtime.triangles} tris
      <br />
      {runtime.position.map((v) => v.toFixed(1)).join(", ")}
      <label>
        Test route{" "}
        <select
          defaultValue=""
          onChange={(e) => {
            newRun();
            useGame.setState((s) => ({
              mission: {
                ...s.mission,
                message: (
                  {
                    combat: "正面を強行し、制御室の端末へ。",
                    stealth: "西側の回路を切り、監督者のカードへ。",
                    trade: "岸壁の仲介人に会い、北の密輸箱を回収。",
                  } as Record<string, string>
                )[e.target.value],
              },
            }));
          }}
        >
          <option value="" disabled>
            Choose clean start
          </option>
          <option value="combat">Combat</option>
          <option value="stealth">Stealth</option>
          <option value="trade">Trade</option>
        </select>
      </label>
    </div>
  );
}
