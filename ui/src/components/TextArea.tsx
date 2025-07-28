import { ParentComponent, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";

interface Props {
  label?: string;
  value: number | string;
  onInput: (e: InputEvent & { target: HTMLInputElement }) => void;
}

export const TextArea: ParentComponent<Props> = (props) => {
  return (
    <TextField>
      <Show when={props.label}>
        <TextField.Label>{props.label}</TextField.Label>
      </Show>
      <TextField.TextArea type="text" value={props.value} onInput={props.onInput} />
    </TextField>
  );
};

export default TextArea;
