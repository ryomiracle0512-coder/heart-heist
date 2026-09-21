import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  input,
  emit,
  tap,
  toggle,
  clearInput,
  setMove,
  type Action,
} from "../game/core/input";
import { useGame } from "../game/state/gameStore";
import { useShell, runtime } from "../game/state/store";
import { nearest, prompt } from "../game/content/interactables";
import { occluded } from "../game/systems/spatial";
import { pauseGame } from "../game/core/session";

function HoldButton({
  action,
  label,
  look = false,
}: {
  action: Action;
  label: string;
  look?: boolean;
}) {
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => () => emit(action, false, "touch:" + action), [action]);
  const end = (e: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current?.id !== e.pointerId) return;
    pointer.current = null;
    emit(action, false, "touch:" + action);
  };
  return (
    <button
      className="touch-button"
      data-action={action}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        if (pointer.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        emit(action, true, "touch:" + action);
      }}
      onPointerMove={(e) => {
        const p = pointer.current;
        if (!p || p.id !== e.pointerId || !look) return;
        input.lookX += e.clientX - p.x;
        input.lookY += e.clientY - p.y;
        p.x = e.clientX;
        p.y = e.clientY;
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      {label}
    </button>
  );
}
export function TouchControls() {
  const mission = useGame((s) => s.mission),
    settings = useShell((s) => s.settings);
  const stick = useRef<{ id: number; x: number; y: number } | null>(null),
    look = useRef<{ id: number; x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  useEffect(() => () => clearInput(), []);
  const flight = mission.alert === "ESCAPE";
  const item = nearest(mission, runtime.position);
  const visible =
    item && !occluded(runtime.position, item.position, mission, item.id)
      ? item
      : null;
  const label = flight
    ? "点火"
    : visible
      ? prompt(mission, visible.id).replace(" / T 牽引", "")
      : mission.heart.mode === "towed"
        ? "持ち上げる"
        : "調べる";
  const stopStick = (e: PointerEvent) => {
    if (stick.current?.id !== e.pointerId) return;
    stick.current = null;
    setMove(0, 0);
    setKnob({ x: 0, y: 0 });
  };
  const stopLook = (e: PointerEvent) => {
    if (look.current?.id === e.pointerId) look.current = null;
  };
  return (
    <div
      className={"touch-controls" + (settings.leftHanded ? " left-handed" : "")}
    >
      <div
        className="touch-look"
        data-testid="touch-look"
        aria-label="ドラッグして視点移動"
        onPointerDown={(e) => {
          if (look.current) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          look.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          const p = look.current;
          if (!p || p.id !== e.pointerId) return;
          input.lookX += e.clientX - p.x;
          input.lookY += e.clientY - p.y;
          p.x = e.clientX;
          p.y = e.clientY;
        }}
        onPointerUp={stopLook}
        onPointerCancel={stopLook}
        onLostPointerCapture={stopLook}
      />
      <div className="touch-left">
        <div
          className="touch-stick"
          data-testid="touch-stick"
          role="img"
          aria-label="移動スティック"
          onPointerDown={(e) => {
            if (stick.current) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            stick.current = {
              id: e.pointerId,
              x: r.x + r.width / 2,
              y: r.y + r.height / 2,
            };
          }}
          onPointerMove={(e) => {
            const p = stick.current;
            if (!p || p.id !== e.pointerId) return;
            const dx = e.clientX - p.x,
              dy = e.clientY - p.y;
            setMove(dx / 42, dy / 42);
            const k = Math.max(1, Math.hypot(dx, dy) / 42);
            setKnob({ x: dx / k, y: dy / k });
          }}
          onPointerUp={stopStick}
          onPointerCancel={stopStick}
          onLostPointerCapture={stopStick}
        >
          <span style={{ transform: `translate(${knob.x}px,${knob.y}px)` }}>
            移動
          </span>
        </div>
        <div className="touch-left-actions">
          <button
            className="touch-button"
            aria-pressed={input.held.has("sprint")}
            onClick={() => toggle("sprint")}
          >
            {flight ? "加速" : "走る"}
          </button>
          {flight ? (
            <button className="touch-button" onClick={() => tap("center")}>
              水平
            </button>
          ) : (
            <HoldButton action="jump" label="跳ぶ" />
          )}
        </div>
      </div>
      <div className="touch-right">
        {flight && mission.ship.ignited ? (
          <HoldButton key="lift" action="jump" label="上昇" look />
        ) : (
          <button
            className="touch-button touch-interact"
            data-action="interact"
            disabled={!flight && !visible && mission.heart.mode !== "towed"}
            onClick={() => tap("interact")}
          >
            {label}
          </button>
        )}
        <div className="touch-pair">
          {flight && mission.ship.ignited ? (
            <HoldButton action="descend" label="下降" />
          ) : mission.heart.mode === "carried" ? (
            <button
              className="touch-button"
              data-action="tow"
              onClick={() => tap("tow")}
            >
              牽引へ
            </button>
          ) : (
            <HoldButton action="primary" label="撃つ" look />
          )}
          {flight ? (
            <button
              className="touch-button"
              aria-pressed={input.held.has("sprint")}
              onClick={() => toggle("sprint")}
            >
              加速
            </button>
          ) : (
            <button
              className="touch-button"
              aria-pressed={input.held.has("crouch")}
              onClick={() => toggle("crouch")}
            >
              {input.held.has("crouch") ? "立つ" : "しゃがむ"}
            </button>
          )}
        </div>
        <button className="touch-button touch-more" onClick={pauseGame}>
          ほかの操作
        </button>
      </div>
    </div>
  );
}
