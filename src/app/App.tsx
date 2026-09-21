import {
  Component,
  type ReactNode,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";
import { AudioSystem } from "../audio/AudioSystem";
import { Results } from "../ui/Results";
import { MissionHUD } from "../ui/MissionHUD";
import { useGame, newRun, loadRun, checkpoint } from "../game/state/gameStore";
import { saves } from "../game/core/save";
import { Scene } from "../rendering/Scene";
import {
  attachKeyboard,
  clearInput,
  tap,
  type Action,
} from "../game/core/input";
import { TouchControls } from "../ui/TouchControls";
import { pauseGame, resumeGame } from "../game/core/session";
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
  const shell = useShell(),
    mission = useGame((s) => s.mission),
    save = saves.load();
  const [controls, setControls] = useState(false),
    [portrait, setPortrait] = useState(window.innerWidth < window.innerHeight);
  const [, tick] = useState(0);
  useEffect(() => {
    const detach = attachKeyboard(
      pauseGame,
      () => {
        if (import.meta.env.DEV)
          useShell.setState((s) => ({ debug: !s.debug }));
      },
      () =>
        useShell.getState().screen === "play" &&
        !useGame.getState().mission.dialogue,
      () => useShell.getState().settings.inputMode === "mouse",
    );
    const hidden = () => {
      if (document.hidden) pauseGame();
    };
    const lock = () => {
      if (useShell.getState().settings.inputMode === "mouse") {
        if (
          !document.pointerLockElement &&
          !useGame.getState().mission.dialogue
        )
          pauseGame();
        else useShell.setState({ notice: "" });
      }
    };
    const resize = () => {
      const vertical = window.innerWidth < window.innerHeight;
      setPortrait(vertical);
      if (vertical && useShell.getState().settings.inputMode === "touch")
        pauseGame();
    };
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("pointerlockchange", lock);
    window.addEventListener("blur", pauseGame);
    window.addEventListener("pagehide", pauseGame);
    window.addEventListener("resize", resize);
    const timer = setInterval(() => tick((x) => x + 1), 250);
    return () => {
      detach();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("pointerlockchange", lock);
      window.removeEventListener("blur", pauseGame);
      window.removeEventListener("pagehide", pauseGame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (mission.alert === "COMPLETE") {
      checkpoint();
      shell.setScreen("results");
      clearInput();
      document.exitPointerLock?.();
    }
  }, [mission.alert]);
  useEffect(() => {
    if (mission.dialogue) {
      clearInput();
      document.exitPointerLock?.();
    }
  }, [mission.dialogue]);
  useEffect(() => {
    clearInput();
    if (shell.settings.inputMode !== "mouse") document.exitPointerLock?.();
  }, [shell.settings.inputMode]);
  useEffect(() => {
    const selector = mission.dialogue
      ? ".dialogue button"
      : shell.screen === "results"
        ? ".results button"
        : ".menu-actions button:not(:disabled)";
    document.querySelector<HTMLButtonElement>(selector)?.focus();
  }, [shell.screen, mission.dialogue]);
  const touch = shell.settings.inputMode === "touch",
    blocked = touch && portrait;
  const start = () => {
    if (blocked) return;
    resumeGame();
    setControls(false);
  };
  const extra = (action: Action) => {
    start();
    tap(action);
  };
  return (
    <ErrorBoundary>
      <div
        className={`game mode-${shell.settings.inputMode}${shell.settings.largeText ? " large-text" : ""}`}
        onClick={(e) => {
          if (
            shell.settings.inputMode === "mouse" &&
            e.target instanceof HTMLCanvasElement &&
            shell.screen === "play" &&
            !document.pointerLockElement &&
            !mission.dialogue
          )
            void e.target.requestPointerLock?.()?.catch(() => {});
        }}
      >
        <Scene />
        <AudioSystem />
        {!shell.ready && (
          <div className="loading" role="status">
            港への航路を準備中…
          </div>
        )}
        {shell.notice && shell.settings.inputMode === "mouse" && (
          <div className="audio-note">{shell.notice}</div>
        )}
        {shell.screen === "play" && (
          <>
            <MissionHUD pause={pauseGame} />
            {touch && !mission.dialogue && !blocked && <TouchControls />}
          </>
        )}
        {shell.screen === "results" && <Results />}
        {(shell.screen === "title" || shell.screen === "pause") && (
          <div className="veil">
            <section className="menu">
              <div className="eyebrow">HEART HEIST / THE NIGHT HARBOR</div>
              <h1>
                HEART
                <br />
                <em>HEIST</em>
              </h1>
              <p className="tagline">世界の心臓を盗め。</p>
              <p className="intro">
                心臓を奪い、船に接続して空へ脱出。
                <br />
                戦闘・潜入・取引、方法はあなた次第。
              </p>
              <label className="mode-select">
                操作方法
                <select
                  aria-label="操作方法"
                  value={shell.settings.inputMode}
                  onChange={(e) =>
                    shell.setSettings({
                      inputMode: e.target.value as
                        "touch" | "mouse" | "keyboard",
                    })
                  }
                >
                  <option value="touch">タッチ（スマホ）</option>
                  <option value="keyboard">キーボードだけ</option>
                  <option value="mouse">マウス＋キーボード</option>
                </select>
              </label>
              {blocked && (
                <p className="orientation-note">
                  スマホを横向きにしてください。横向きで再開できます。
                </p>
              )}
              <div className="menu-actions">
                <button
                  className="primary"
                  disabled={!shell.ready || blocked}
                  onClick={() => {
                    if (shell.screen === "title") newRun();
                    start();
                  }}
                >
                  {shell.screen === "pause" ? "港に戻る" : "潜入を開始"} ↗
                </button>
                {shell.screen === "title" && save.kind === "ok" && (
                  <button
                    disabled={blocked}
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
                <a
                  className="help-link"
                  href="./help.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  遊び方・攻略
                </a>
                {shell.screen === "pause" && (
                  <button
                    disabled={blocked}
                    onClick={() => {
                      newRun();
                      start();
                    }}
                  >
                    最初からやり直す
                  </button>
                )}
              </div>
              {shell.screen === "pause" && !mission.dialogue && (
                <div className="extra-actions" aria-label="補助操作">
                  <p>操作を選ぶとゲームへ戻ります</p>
                  {(
                    [
                      ["reload", "装填"],
                      ["melee", "近接攻撃"],
                      ["tow", "牽引／解除"],
                      ["cancel", "心臓を降ろす"],
                    ] as [Action, string][]
                  ).map(([a, label]) => (
                    <button key={a} disabled={blocked} onClick={() => extra(a)}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <p className="pointer-note">
                {touch
                  ? "左のスティックで移動。右側をなぞって見回す。ボタンをタップして調べる。"
                  : shell.settings.inputMode === "keyboard"
                    ? "WASDで移動、矢印で視点、Jで射撃、Eで調べる。Escで一時停止。"
                    : "マウスで視点、WASDで移動。Escでマウス固定を解除できます。"}
              </p>
              {controls && (
                <div className="settings">
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
                    視点感度
                    <input
                      aria-label="視点感度"
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
                      checked={shell.settings.leftHanded}
                      onChange={(e) =>
                        shell.setSettings({ leftHanded: e.target.checked })
                      }
                    />
                    左利きのタッチ配置
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={shell.settings.largeText}
                      onChange={(e) =>
                        shell.setSettings({ largeText: e.target.checked })
                      }
                    />
                    文字を大きく
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={shell.settings.aimAssist}
                      onChange={(e) =>
                        shell.setSettings({ aimAssist: e.target.checked })
                      }
                    />
                    照準の補助（タッチ・キーボード）
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
                      aria-label="画質"
                      value={shell.settings.quality}
                      onChange={(e) =>
                        shell.setSettings({ quality: e.target.value as "high" })
                      }
                    >
                      <option value="high">高</option>
                      <option value="medium">標準</option>
                      <option value="low">軽量（スマホ推奨）</option>
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
                BROWSER EDITION <span>NO. 001 — THE NIGHT HARBOR</span>
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
