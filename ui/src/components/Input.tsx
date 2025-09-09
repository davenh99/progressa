import { ParentComponent, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
}

export type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, TextFieldInputProps<T>>;

export const Input: ParentComponent<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class"]);

  return (
    <TextField class="flex flex-row space-x-1">
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.Input
        class={`${local.class ?? ""} input outline-none ${
          others.type === "number" ? "w-16 text-center focus:border-b-1" : "w-full"
        }`}
        {...others}
      />
    </TextField>
  );
};

interface DataProps extends InputProps {
  value: number | string;
  onValueChange: (v: number | string) => void;
  saveFunc: (v: number | string) => Promise<any>;
}

export const DataInput: ParentComponent<DataProps> = (props) => {
  return (
    <Input
      value={props.value}
      onInput={(e) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = props.type === "number" ? Number(target.value) : target.value;

        props.onValueChange(value);
        debounce(props.saveFunc)(value);
      }}
      label={props.label}
      type={props.type}
    />
  );
};

export default Input;
