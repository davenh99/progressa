import { Component, createEffect, createSignal } from "solid-js";
import NumberInput from "./NumberInput";

interface Props {
  value: number;
  onValueChange: (v: number) => void;
  saveFunc: (v: number) => Promise<any>;
}

export const DataTime: Component<Props> = (props) => {
  const [minutes, setMinutes] = createSignal(Math.floor(props.value / 60));
  const [seconds, setSeconds] = createSignal(Math.round(props.value % 60));

  createEffect(() => {
    const min = minutes() || 0;
    const sec = seconds() || 0;

    const newVal = min * 60 + sec;

    props.saveFunc(newVal).then(() => props.onValueChange(newVal));
  });

  // TODO this was making a loop, do I need the code and how to avoid the loop?
  // not onMount, should be reactive to external state changes...
  // createEffect(() => {
  //   setMinutes(Math.floor(props.value / 60));
  //   setSeconds(Math.round(props.value % 60));
  // });

  return (
    <div class="px-1 flex items-center">
      <NumberInput
        width="1.2rem"
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
      <p>:</p>
      <NumberInput
        width="1.2rem"
        value={seconds().toString().padStart(2, "0")}
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
    </div>
  );
};

export default DataTime;
