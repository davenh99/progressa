import { Component, createEffect, createSignal } from "solid-js";
import Input from "./Input";

interface Props {
  label?: string;
  value: number;
  onValueChange: (v: number) => void;
  saveFunc: (v: number) => Promise<any>;
}

export const DataTime: Component<Props> = (props) => {
  const [seconds, setSeconds] = createSignal(0);
  const [minutes, setMinutes] = createSignal(0);

  createEffect(() => {
    const min = minutes() || 0;
    const sec = seconds() || 0;

    const newVal = min * 60 + sec;

    props.saveFunc(newVal).then(() => props.onValueChange(newVal));
  });

  // not onMount, should be reactive to external state changes...
  createEffect(() => {
    setMinutes(Math.floor(props.value / 60));
    setSeconds(Math.round(props.value % 60));
  });

  return (
    <div class="p-1 flex flex-row gap-2">
      <p>{props.label || ""}</p>
      <div class="flex items-center gap-2">
        <div class="flex flex-col items-center">
          <Input
            type="number"
            value={minutes()}
            onInput={(e) => {
              const raw = parseInt(e.currentTarget.value) || 0;
              const clamped = Math.max(0, raw);
              setMinutes(clamped);

              if (clamped !== raw) {
                e.currentTarget.value = clamped.toString();
              }
            }}
            min={0}
          />
          <span class="text-xs text-gray-500">min</span>
        </div>
        <div class="flex flex-col items-center">
          <Input
            type="number"
            value={seconds()}
            onInput={(e) => {
              const raw = parseInt(e.currentTarget.value) || 0;
              const clamped = Math.min(59, Math.max(0, raw));
              setSeconds(clamped);

              if (clamped !== raw) {
                e.currentTarget.value = clamped.toString();
              }
            }}
            min={0}
            max={59}
          />
          <span class="text-xs text-gray-500">sec</span>
        </div>
      </div>
    </div>
  );
};

export default DataTime;
