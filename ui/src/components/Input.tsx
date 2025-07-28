import { ParentComponent } from "solid-js";
import { TextField } from "@kobalte/core/text-field";

interface Props {
  label: string;
  type: "number" | "text" | "date";
  value?: number | string;
  onInput?: (e: InputEvent & { target: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void;
  placeholder?: string;
}

export const Input: ParentComponent<Props> = (props) => {
  return (
    <TextField>
      <TextField.Label>{props.label}</TextField.Label>
      <TextField.Input
        class="input input-bordered w-full"
        type={props.type}
        value={props.value}
        onInput={props.onInput}
      />
    </TextField>
  );
};

export default Input;
