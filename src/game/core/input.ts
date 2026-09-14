export type Action =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "sprint"
  | "crouch"
  | "jump"
  | "primary"
  | "melee"
  | "interact"
  | "tow"
  | "reload"
  | "pause"
  | "cancel"
  | "lift"
  | "descend"
  | "boost";
export const bindings: Record<string, Action> = {
  KeyW: "forward",
  KeyS: "back",
  KeyA: "left",
  KeyD: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  KeyC: "crouch",
  Space: "jump",
  KeyE: "interact",
  KeyF: "melee",
  KeyT: "tow",
  KeyR: "reload",
  Escape: "pause",
  KeyQ: "cancel",
  KeyX: "descend",
};
export const input = {
  held: new Set<Action>(),
  pressed: new Set<Action>(),
  lookX: 0,
  lookY: 0,
};
export function emit(action: Action, down: boolean) {
  if (down) {
    if (!input.held.has(action)) input.pressed.add(action);
    input.held.add(action);
  } else input.held.delete(action);
}
export function consume(action: Action) {
  const value = input.pressed.has(action);
  input.pressed.delete(action);
  return value;
}
export function clearInput() {
  input.held.clear();
  input.pressed.clear();
  input.lookX = 0;
  input.lookY = 0;
}
export function attachKeyboard(onPause: () => void, onDebug: () => void) {
  const down = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    const action = bindings[e.code];
    if (action) {
      e.preventDefault();
      if (action === "pause" && !e.repeat) onPause();
      else emit(action, true);
    }
    if (e.code === "F3") {
      e.preventDefault();
      onDebug();
    }
  };
  const up = (e: KeyboardEvent) => {
    const a = bindings[e.code];
    if (a) emit(a, false);
  };
  const move = (e: MouseEvent) => {
    if (document.pointerLockElement) {
      input.lookX += e.movementX;
      input.lookY += e.movementY;
    }
  };
  const md = (e: MouseEvent) => {
    if (document.pointerLockElement && e.button === 0) emit("primary", true);
  };
  const mu = () => emit("primary", false);
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("mousemove", move);
  window.addEventListener("mousedown", md);
  window.addEventListener("mouseup", mu);
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mousedown", md);
    window.removeEventListener("mouseup", mu);
    clearInput();
  };
}
