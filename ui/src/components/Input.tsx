import { ParentComponent, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";

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
        class={`${local.class ?? ""} input input-bordered border-1 rounded-sm ${
          others.type === "number" ? "w-14 text-center" : "w-full"
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
      onBlur={() => props.saveFunc(props.value)}
      onInput={(e) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = props.type === "number" ? Number(target.value) : target.value;

        props.onValueChange(value);
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
