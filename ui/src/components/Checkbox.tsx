import { createSignal, ParentComponent, Show } from "solid-js";
import { Checkbox as KobalteCheckbox } from "@kobalte/core/checkbox";
import Check from "lucide-solid/icons/check";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export const Checkbox: ParentComponent<Props> = (props) => {
  return (
    <KobalteCheckbox checked={props.checked} onChange={props.onChange}>
      <KobalteCheckbox.Input />
      <KobalteCheckbox.Control class="h-5 w-5 bg-ash-gray-500 rounded-sm">
        <KobalteCheckbox.Indicator>
          <Check />
        </KobalteCheckbox.Indicator>
      </KobalteCheckbox.Control>
      <Show when={props.label}>
        <KobalteCheckbox.Label>{props.label}</KobalteCheckbox.Label>
      </Show>
    </KobalteCheckbox>
  );
};

interface DataProps {
  initial: boolean;
  saveFunc: (v: boolean) => Promise<void>;
}

export const DataCheckbox: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  return <Checkbox checked={val()} onChange={(v: boolean) => props.saveFunc(v).then(() => setVal(v))} />;
};

export default Checkbox;
