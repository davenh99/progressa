import { Component, createMemo, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps, type TextFieldRootProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

type InputProps<T extends ValidComponent = "input"> = PolymorphicProps<T, TextFieldInputProps<T>>;

interface ExtraProps {
  label?: string;
  variant?: "bordered" | "none";
  noPadding?: boolean;
  noBackground?: boolean;
  inputProps?: InputProps;
}

type InputRootProps<T extends ValidComponent = "div"> = ExtraProps &
  PolymorphicProps<T, TextFieldRootProps<T>>;

export const Input: Component<InputRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "class",
    "variant",
    "noPadding",
    "noBackground",
    "inputProps",
  ]);

  const style = local.variant === "bordered" ? "border-2 border-ash-gray-400" : "";
  const padding = local.noPadding ? "" : "px-2 py-1";
  const bg = local.noBackground ? "" : "bg-charcoal-600";

  return (
    <TextField class={`flex flex-row space-x-1 items-center ${local.class ?? ""}`} {...others}>
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.Input
        class={`${style} ${padding} ${bg} input outline-none w-full rounded-sm ${
          local.inputProps?.class ?? ""
        }`}
        {...local.inputProps}
      />
    </TextField>
  );
};

interface DataProps extends InputRootProps {
  saveFunc: (v: string) => Promise<any>;
}

export const DataInput: Component<DataProps> = (props) => {
  const [local, others] = splitProps(props, ["onChange", "saveFunc"]);
  const debouncedSave = createMemo(() => debounce(local.saveFunc));

  return (
    <Input
      onChange={(v) => {
        props.onChange?.(v);
        debouncedSave()(v);
      }}
      {...others}
    />
  );
};

export default Input;
