import { Component, createMemo, Show, splitProps, ValidComponent } from "solid-js";
import { NumberField, type NumberFieldRootProps } from "@kobalte/core/number-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
  width?: string;
  class?: string;
  containerClass?: string;
}

type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, NumberFieldRootProps<T>>;

export const NumberInput: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class", "width", "containerClass"]);

  const classes = `input outline-none text-right my-0 ${local.class ?? ""}`;

  return (
    <NumberField class={`flex flex-row space-x-1 ${local.containerClass ?? ""}`} {...others}>
      <Show when={local.label}>
        <NumberField.Label>{local.label}</NumberField.Label>
      </Show>
      <NumberField.Input class={classes} style={{ width: local.width ?? "2.5rem" }} />
    </NumberField>
  );
};

interface DataProps extends InputProps {
  saveFunc: (v: number) => Promise<any>;
}

export const DataNumberInput: Component<DataProps> = (props) => {
  const [local, others] = splitProps(props, ["onRawValueChange", "saveFunc"]);
  const debouncedSave = createMemo(() => debounce(local.saveFunc));

  return (
    <NumberInput
      onRawValueChange={(v) => {
        local.onRawValueChange?.(v);
        debouncedSave()(v);
      }}
      {...others}
    />
  );
};

export default NumberInput;
