import { ParentComponent } from "solid-js";
import { Checkbox as KobalteCheckbox } from "@kobalte/core/checkbox";
import Check from "lucide-solid/icons/check";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
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
      <KobalteCheckbox.Label>Is it a warmup?</KobalteCheckbox.Label>
    </KobalteCheckbox>
  );
};

export default Checkbox;
