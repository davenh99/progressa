import { createSignal, createEffect, ParentComponent, For } from "solid-js";
import { SleepQuality } from "../../Types";

interface EmojiOption {
  emoji: string;
  label: string;
  value: SleepQuality;
}

const sleepOptions: EmojiOption[] = [
  { emoji: "😞", label: "Very Poor", value: "terrible" },
  { emoji: "😕", label: "Poor", value: "poor" },
  { emoji: "😐", label: "Fair", value: "fair" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "😴", label: "Excellent", value: "great" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export const SleepQualitySelector: ParentComponent<Props> = (props) => {
  return (
    <div class="flex gap-3">
      <For each={sleepOptions}>
        {(opt) => (
          <button
            type="button"
            onClick={() => props.onChange(opt.value)}
            class={`text-2xl transition-transform ${
              props.value === opt.value ? "scale-125" : "opacity-50 hover:opacity-100"
            }`}
            title={opt.label}
          >
            {opt.emoji}
          </button>
        )}
      </For>
    </div>
  );
};

interface DataProps {
  initial: string;
  saveFunc: (v: string) => Promise<any>;
  label?: string;
}

export const DataSleepQualitySelector: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  createEffect(() => {
    setVal(props.initial);
  });

  return (
    <div class="flex flex-col gap-2">
      {props.label && <label class="text-sm">{props.label}</label>}
      <SleepQualitySelector
        value={val()}
        onChange={(v) => {
          props.saveFunc(v);
          setVal(v);
        }}
      />
    </div>
  );
};
