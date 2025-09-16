import { createSignal, createEffect, ParentComponent, For } from "solid-js";
import { SleepQuality } from "../../Types";
import { debounce } from "../methods/debounce";

interface EmojiOption {
  emoji: string;
  label: string;
  value: SleepQuality;
}

const sleepValueLabels: { [key in SleepQuality]: string } = {
  terrible: "Very Poor",
  poor: "Poor",
  fair: "Fair",
  good: "Good",
  great: "Excellent",
};

const sleepOptions: EmojiOption[] = [
  { emoji: "😞", label: "Very Poor", value: "terrible" },
  { emoji: "😕", label: "Poor", value: "poor" },
  { emoji: "😐", label: "Fair", value: "fair" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "😴", label: "Excellent", value: "great" },
];

interface Props {
  value?: SleepQuality;
  onChange: (v: string) => void;
}

export const SleepQualitySelector: ParentComponent<Props> = (props) => {
  return (
    <div class="flex gap-3 flex-row items-center">
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
      <p class="ml-2 font-bold">{props.value ? sleepValueLabels[props.value] : ""}</p>
    </div>
  );
};

interface DataProps {
  value?: SleepQuality;
  onValueChange: (v: string) => void;
  saveFunc: (v: string) => Promise<any>;
  label?: string;
}

export const DataSleepQualitySelector: ParentComponent<DataProps> = (props) => {
  return (
    <div class="flex flex-col gap-2">
      {props.label && <label class="text-sm">{props.label}</label>}
      <SleepQualitySelector
        value={props.value}
        onChange={(v) => {
          props.onValueChange(v);
          debounce(props.saveFunc)(v);
        }}
      />
    </div>
  );
};
