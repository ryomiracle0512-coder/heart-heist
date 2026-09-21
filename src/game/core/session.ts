import { useShell } from "../state/store";
import { checkpoint } from "../state/gameStore";
import { clearInput } from "./input";
import { sound } from "../../audio/sound";
export function pauseGame() {
  clearInput();
  if (useShell.getState().screen === "play") {
    checkpoint();
    useShell.getState().setScreen("pause");
  }
  document.exitPointerLock?.();
}
export function resumeGame() {
  clearInput();
  if (
    useShell.getState().settings.inputMode === "touch" &&
    window.innerWidth < window.innerHeight
  ) {
    useShell.getState().setScreen("pause");
    return;
  }
  sound.start();
  useShell.getState().setScreen("play");
  if (useShell.getState().settings.inputMode === "mouse")
    document
      .querySelector("canvas")
      ?.requestPointerLock?.()
      ?.catch(() => {
        useShell.setState({
          notice: "画面をクリックして視点操作を開始してください。",
        });
      });
}
