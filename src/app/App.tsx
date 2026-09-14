import {
  Component,
  type ReactNode,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";
import { AudioSystem } from "../audio/AudioSystem";
import { sound } from "../audio/sound";
import { Results } from "../ui/Results";
import { MissionHUD } from "../ui/MissionHUD";
import { useGame, newRun, loadRun, checkpoint } from "../game/state/gameStore";
import { saves } from "../game/core/save";
import { Scene } from "../rendering/Scene";
import { attachKeyboard, clearInput } from "../game/core/input";
import { useShell } from "../game/state/store";
import "../ui/style.css";
const DebugPanel = import.meta.env.DEV
  ? lazy(() =>
      import("../ui/DebugPanel").then((m) => ({ default: m.DebugPanel })),
    )
  : null;
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  render() {
    return this.state.error ? (
      <main className="error">
        <h1>港を読み込めませんでした</h1>
        <p>{this.state.error}</p>
        <button onClick={() => location.reload()}>再読み込み</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  const shell = useShell();
  const mission = useGame((s) => s.mission);
  const save = saves.load();
  const [controls, setControls] = useState(false);
  const [, tick] = useState(0);
  const pause = () => {
    if (
      useShell.getState().screen === "play" &&
      !useGame.getState().mission.dialogue
    ) {
      checkpoint();
      useShell.getState().setScreen("pause");
      clearInput();
      document.exitPointerLock?.();
    }
  };
  useEffect(() => {
    const detach = attachKeyboard(pause, () => {
      if (import.meta.env.DEV) useShell.setState((s) => ({ debug: !s.debug }));
    });
    const hidden = () => {
      if (document.hidden) pause();
    };
    const lock = () => {
      if (!document.pointerLockElement) pause();
      else useShell.setState({ notice: "" });
    };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("pointerlockchange", lock);
    window.addEventListener("blur", pause);
    const timer = setInterval(() => tick((t) => t + 1), 500);
    return () => {
      detach();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("pointerlockchange", lock);
      window.removeEventListener("blur", pause);
    };
  }, []);
  useEffect(() => {
    if (mission.alert === "COMPLETE") {
      checkpoint();
      useShell.getState().setScreen("results");
      document.exitPointerLock?.();
    }
  }, [mission.alert]);
  useEffect(() => {
    if (mission.dialogue) {
      clearInput();
      document.exitPointerLock?.();
    }
  }, [mission.dialogue]);
  const start = () => {
    sound.start();
    shell.setScreen("play");
    setControls(false);
    document
      .querySelector("canvas")
      ?.requestPointerLock?.()
      ?.catch(() => {
        useShell.setState({
          notice: "画面をクリックして視点操作を開始してください。",
        });
      });
  };
  return (
    <ErrorBoundary>
      <div
        className="game"
        onClick={(e) => {
          if (
            e.target instanceof HTMLCanvasElement &&
            useShell.getState().screen === "play" &&
            !document.pointerLockElement &&
            !useGame.getState().mission.dialogue
          )
            void e.target.requestPointerLock?.()?.catch(() => {});
        }}
      >
        <Scene />
        <AudioSystem />
        {shell.notice && (
          <div className="audio-note" role="status">
            {shell.notice}
          </div>
        )}
        {!shell.ready && <div className="loading">港への航路を準備中…</div>}
        {shell.screen === "play" && <MissionHUD pause={pause} />}
        {shell.screen === "results" && <Results />}
        {(shell.screen === "title" || shell.screen === "pause") && (
          <div className="veil">
            <section className="menu">
              <div className="eyebrow">AN INDUSTRIAL FANTASY HEIST</div>
              <h1>
                HEART
                <br />
                <em>HEIST</em>
              </h1>
              <p className="tagline">世界の心臓を盗め。</p>
              <p className="intro">
                夜の港。眠る廃船。
                <br />
                あの光を奪えば、空はもう一度あなたのものになる。
              </p>
              <div className="menu-actions">
                <button
                  className="primary"
                  disabled={!shell.ready}
                  onClick={() => {
                    if (shell.screen === "title") newRun();
                    start();
                  }}
                >
                  {shell.screen === "pause" ? "港に戻る" : "潜入を開始"}{" "}
                  <span>↗</span>
                </button>
                {shell.screen === "title" && save.kind === "ok" && (
                  <button
                    onClick={() => {
                      if (loadRun()) start();
                    }}
                  >
                    続きから
                  </button>
                )}
                <button onClick={() => setControls(!controls)}>
                  操作と設定
                </button>
                {shell.screen === "pause" && (
                  <button
                    onClick={() => {
                      newRun();
                      start();
                    }}
                  >
                    最初からやり直す
                  </button>
                )}
              </div>
              <p className="pointer-note">
                開始するとマウスがゲームに固定されます。Escで解除できます。
              </p>
              {controls && (
                <div className="settings">
                  <p>
                    WASD 移動 / マウス 視点 / Shift 走る / C しゃがむ / Space
                    ジャンプ / E 調べる / T 牽引 / Q 降ろす / 左クリック 射撃 /
                    F 近接 / R 装填 / Esc 一時停止
                  </p>
                  <label>
                    音量
                    <input
                      aria-label="音量"
                      type="range"
                      min="0"
                      max="1"
                      step=".05"
                      value={shell.settings.volume}
                      onChange={(e) =>
                        shell.setSettings({ volume: +e.target.value })
                      }
                    />
                  </label>
                  <label>
                    マウス感度
                    <input
                      aria-label="マウス感度"
                      type="range"
                      min=".25"
                      max="2"
                      step=".05"
                      value={shell.settings.sensitivity}
                      onChange={(e) =>
                        shell.setSettings({ sensitivity: +e.target.value })
                      }
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={shell.settings.reducedMotion}
                      onChange={(e) =>
                        shell.setSettings({ reducedMotion: e.target.checked })
                      }
                    />
                    カメラの揺れを抑える
                  </label>
                  <label>
                    画質
                    <select
                      value={shell.settings.quality}
                      onChange={(e) =>
                        shell.setSettings({ quality: e.target.value as "high" })
                      }
                    >
                      <option value="high">高</option>
                      <option value="medium">標準</option>
                      <option value="low">軽量</option>
                    </select>
                  </label>
                </div>
              )}
              {save.kind === "invalid" && (
                <p className="save-note">
                  保存データを読み込めません。「潜入を開始」で新しく始められます。
                </p>
              )}
              <div className="menu-foot">
                PC VERTICAL SLICE <span>NO. 001 — THE NIGHT HARBOR</span>
              </div>
            </section>
          </div>
        )}
        {shell.debug && DebugPanel && (
          <Suspense fallback={null}>
            <DebugPanel />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}
