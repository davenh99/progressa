import { createEffect, createSignal, ParentComponent } from "solid-js";
import { Slider as KobalteSlider } from "@kobalte/core/slider";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export const Slider: ParentComponent<Props> = (props) => {
  return (
    <KobalteSlider
      class="w-30"
      onChange={(val) => props.onChange(val[0])}
      value={[props.value]}
      step={10}
      getValueLabel={(params) => `${params.values[0]}%`}
    >
      <div>
        <KobalteSlider.Label>{props.label}</KobalteSlider.Label>
        <KobalteSlider.ValueLabel />
      </div>
      <KobalteSlider.Track class="h-2 w-[100%] rounded-4xl relative bg-ash-gray-100">
        <KobalteSlider.Fill />
        <KobalteSlider.Thumb class="block bg-ash-gray-300 w-3 h-3 top-[-2px] rounded-4xl">
          <KobalteSlider.Input />
        </KobalteSlider.Thumb>
      </KobalteSlider.Track>
    </KobalteSlider>
  );
};

interface DataProps {
  initial: number;
  saveFunc: (v: number) => Promise<void>;
  label?: string;
}

export const DataSlider: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  createEffect(() => {
    setVal(props.initial);
  });

  return (
    <Slider
      label={props.label || ""}
      value={val()}
      onChange={(v: number) => {
        props.saveFunc(v);
        setVal(v);
      }}
    />
  );
};

export default Slider;
