import { ParentComponent, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";

interface Props {
  label?: string;
  type: "number" | "text" | "date";
  value?: number | string;
  onInput?: (e: InputEvent & { target: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void;
  placeholder?: string;
}

export const Input: ParentComponent<Props> = (props) => {
  return (
    <TextField>
      <Show when={props.label}>
        <TextField.Label>{props.label}</TextField.Label>
      </Show>
      <TextField.Input
        class="input input-bordered w-full"
        type={props.type}
        value={props.value}
        onInput={props.onInput}
        onKeyDown={props.onKeyDown}
        placeholder={props.placeholder}
      />
    </TextField>
  );
};

export default Input;
