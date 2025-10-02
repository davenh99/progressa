import { Component, Show, splitProps, ValidComponent } from "solid-js";
import { NumberField, type NumberFieldInputProps } from "@kobalte/core/number-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
  width?: string;
  class?: string;
  containerClass?: string;
}

type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, NumberFieldInputProps<T>>;

export const NumberInput: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class", "width", "containerClass"]);

  const classes = `input outline-none text-right my-0 ${local.class ?? ""}`;

  return (
    <NumberField class={`flex flex-row space-x-1 ${local.containerClass ?? ""}`}>
      <Show when={local.label}>
        <NumberField.Label>{local.label}</NumberField.Label>
      </Show>
      <NumberField.Input class={classes} style={{ width: local.width ?? "2.5rem" }} {...others} />
    </NumberField>
  );
};

interface DataProps extends InputProps {
  value: number | string;
  onValueChange: (v: number | string) => void;
  saveFunc: (v: number | string) => Promise<any>;
}

export const DataNumberInput: Component<DataProps> = (props) => {
  const [local, others] = splitProps(props, ["value", "onValueChange", "saveFunc"]);

  return (
    <NumberInput
      value={local.value}
      onInput={(e) => {
        local.onValueChange(Number(e.currentTarget.value));
        debounce(local.saveFunc)(Number(e.currentTarget.value));
      }}
      {...others}
    />
  );
};

export default NumberInput;
