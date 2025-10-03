import { Component, createMemo, Show, splitProps, ValidComponent } from "solid-js";
import {
  NumberField,
  type NumberFieldInputProps,
  type NumberFieldRootProps,
} from "@kobalte/core/number-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

type InputProps<T extends ValidComponent = "input"> = PolymorphicProps<T, NumberFieldInputProps<T>>;

interface ExtraProps {
  label?: string;
  width?: string;
  inputProps?: InputProps;
}

type InputRootProps<T extends ValidComponent = "div"> = ExtraProps &
  PolymorphicProps<T, NumberFieldRootProps<T>>;

export const NumberInput: Component<InputRootProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class", "width", "inputProps"]);

  const inputClasses = `input outline-none text-right my-0 ${local.inputProps?.class ?? ""}`;

  return (
    <NumberField class={`flex flex-row space-x-1 ${local.class ?? ""}`} {...others}>
      <Show when={local.label}>
        <NumberField.Label>{local.label}</NumberField.Label>
      </Show>
      <NumberField.Input
        class={inputClasses}
        style={{ width: local.width ?? "2.5rem" }}
        {...local.inputProps}
      />
    </NumberField>
  );
};

interface DataProps extends InputRootProps {
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
