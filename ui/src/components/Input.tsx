import { createSignal, ParentComponent, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";

interface Props {
  label?: string;
  type: "number" | "text" | "date";
  value?: number | string;
  onInput?: (e: InputEvent & { target: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) => void;
  placeholder?: string;
  onBlur?: () => void;
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
        onBlur={props.onBlur}
      />
    </TextField>
  );
};

interface DataProps extends Props {
  initial: number | string;
  saveFunc: (v: number | string) => Promise<void>;
}

export const DataInput: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  return (
    <Input
      value={val()}
      onBlur={() => props.saveFunc(val())}
      onInput={(e: InputEvent & { target: HTMLInputElement }) => {
        if (props.type == "number") {
          setVal(e.target.value);
          props.saveFunc(e.target.value);
        }
      }}
      type={props.type}
    />
  );
};

export default Input;
