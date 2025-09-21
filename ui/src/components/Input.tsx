import { ParentComponent, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
  variant?: "bordered" | "none";
  noPadding?: boolean;
}

type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, TextFieldInputProps<T>>;

export const Input: ParentComponent<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class", "variant", "noPadding"]);

  const style = local.variant === "bordered" ? "border-2 border-ash-gray-400" : "";
  const padding = local.noPadding ? "" : "px-2 py-1";

  return (
    <TextField class="flex flex-row space-x-1">
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.Input
        class={`${style} ${padding} input outline-none w-full rounded-sm ${local.class ?? ""}`}
        {...others}
      />
    </TextField>
  );
};

interface DataProps extends InputProps {
  onValueChange: (v: number | string) => void;
  saveFunc: (v: number | string) => Promise<any>;
}

export const DataInput: ParentComponent<DataProps> = (props) => {
  return (
    <Input
      onInput={(e) => {
        props.onValueChange(e.currentTarget.value);
        debounce(props.saveFunc)(e.currentTarget.value);
      }}
      {...props}
    />
  );
};

export default Input;
