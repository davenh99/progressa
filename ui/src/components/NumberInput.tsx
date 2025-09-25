import { ParentComponent, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
  width?: string;
}

type InputProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, TextFieldInputProps<T>>;

export const NumberInput: ParentComponent<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class", "width"]);

  const classes = `input outline-none text-right ${local.class ?? ""}`;

  return (
    <TextField class="flex flex-row space-x-1">
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.Input type="number" class={classes} style={{ width: local.width ?? "2.5rem" }} {...others} />
    </TextField>
  );
};

interface DataProps extends InputProps {
  value: number | string;
  onValueChange: (v: number | string) => void;
  saveFunc: (v: number | string) => Promise<any>;
}

export const DataNumberInput: ParentComponent<DataProps> = (props) => {
  return (
    <NumberInput
      value={props.value}
      onInput={(e) => {
        props.onValueChange(Number(e.currentTarget.value));
        debounce(props.saveFunc)(Number(e.currentTarget.value));
      }}
      label={props.label}
      type={props.type}
      width={props.width}
    />
  );
};

export default NumberInput;
