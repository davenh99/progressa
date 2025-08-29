import { createEffect, createSignal, ParentComponent, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";

interface ExtraProps {
  label?: string;
}

export type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, TextFieldInputProps<T>>;

export const Input: ParentComponent<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label"]);

  return (
    <TextField class="flex flex-row space-x-1">
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.Input class="input input-bordered w-14 text-center" {...others} />
    </TextField>
  );
};

interface DataProps extends InputProps {
  initial: number | string;
  saveFunc: (v: number | string) => Promise<any>;
}

export const DataInput: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  createEffect(() => {
    setVal(props.initial);
  });

  return (
    <Input
      value={val()}
      onBlur={() => props.saveFunc(val())}
      onInput={(e) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = props.type === "number" ? Number(target.value) : target.value;

        setVal(value);
        if (props.type === "number") {
          props.saveFunc(value);
        }
      }}
      label={props.label}
      type={props.type}
    />
  );
};

export default Input;
