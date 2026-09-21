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
  | "boost"
  | "lookLeft"
  | "lookRight"
  | "lookUp"
  | "lookDown"
  | "center"
  | "aim";
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
  KeyJ: "primary",
  KeyK: "aim",
  KeyL: "center",
  ArrowLeft: "lookLeft",
  ArrowRight: "lookRight",
  ArrowUp: "lookUp",
  ArrowDown: "lookDown",
};
const sources = new Map<string, Set<Action>>();
export const input = {
  held: new Set<Action>(),
  pressed: new Set<Action>(),
  lookX: 0,
  lookY: 0,
  moveX: 0,
  moveZ: 0,
};
export function emit(action: Action, down: boolean, source = "legacy") {
  const owned = sources.get(source) ?? new Set<Action>();
  if (down) {
    owned.add(action);
    if (!input.held.has(action)) input.pressed.add(action);
    input.held.add(action);
    sources.set(source, owned);
  } else {
    owned.delete(action);
    if (!owned.size) sources.delete(source);
    if (![...sources.values()].some((s) => s.has(action)))
      input.held.delete(action);
  }
}
export function tap(action: Action) {
  emit(action, true, "tap");
  emit(action, false, "tap");
}
export function toggle(action: Action, source = "toggle") {
  emit(action, !sources.get(source)?.has(action), source);
}
export function consume(action: Action) {
  const value = input.pressed.has(action);
  input.pressed.delete(action);
  return value;
}
export function clearInput() {
  sources.clear();
  input.held.clear();
  input.pressed.clear();
  input.lookX = 0;
  input.lookY = 0;
  input.moveX = 0;
  input.moveZ = 0;
}
export function setMove(x: number, z: number) {
  const length = Math.max(1, Math.hypot(x, z));
  input.moveX = x / length;
  input.moveZ = z / length;
}
export function movement() {
  let x =
    input.moveX ||
    Number(input.held.has("right")) - Number(input.held.has("left"));
  let z =
    input.moveZ ||
    Number(input.held.has("back")) - Number(input.held.has("forward"));
  const length = Math.max(1, Math.hypot(x, z));
  x /= length;
  z /= length;
  return { x, z };
}
export function lookDelta(dt: number, sensitivity: number) {
  const yaw =
    -input.lookX * 0.002 * sensitivity +
    (((Number(input.held.has("lookLeft")) -
      Number(input.held.has("lookRight"))) *
      Math.min(dt, 0.1) *
      Math.PI) /
      180) *
      100 *
      sensitivity;
  const pitch =
    -input.lookY * 0.002 * sensitivity +
    (((Number(input.held.has("lookUp")) - Number(input.held.has("lookDown"))) *
      Math.min(dt, 0.1) *
      Math.PI) /
      180) *
      70 *
      sensitivity;
  input.lookX = input.lookY = 0;
  return { yaw, pitch };
}
export function attachKeyboard(
  onPause: () => void,
  onDebug: () => void,
  active = () => true,
  mouse = () => true,
) {
  const down = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement;
    if (el?.matches?.("input,select,textarea,[contenteditable=true]")) return;
    if (e.code === "Escape") {
      e.preventDefault();
      if (!e.repeat) onPause();
      return;
    }
    if (
      !active() ||
      (el?.closest?.("button,a") && ["Space", "Enter"].includes(e.code))
    )
      return;
    if (e.code === "F3") {
      e.preventDefault();
      if (!e.repeat) onDebug();
      return;
    }
    const action = bindings[e.code];
    if (!action) return;
    e.preventDefault();
    if (!mouse() && (action === "crouch" || action === "sprint")) {
      if (!e.repeat) toggle(action, "key:" + e.code);
    } else emit(action, true, "key:" + e.code);
  };
  const up = (e: KeyboardEvent) => {
    const a = bindings[e.code];
    if (a && !(!mouse() && (a === "crouch" || a === "sprint")))
      emit(a, false, "key:" + e.code);
  };
  const move = (e: MouseEvent) => {
    if (active() && mouse() && document.pointerLockElement) {
      input.lookX += e.movementX;
      input.lookY += e.movementY;
    }
  };
  const md = (e: MouseEvent) => {
    if (active() && mouse() && document.pointerLockElement && e.button === 0)
      emit("primary", true, "mouse");
  };
  const mu = () => emit("primary", false, "mouse");
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
