import { createEffect, createSignal, JSX, ParentComponent, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";

interface Props {
  label?: string;
  value?: string;
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>;
  onBlur?: () => void;
}

export const TextArea: ParentComponent<Props> = (props) => {
  return (
    <TextField>
      <Show when={props.label}>
        <TextField.Label>{props.label}</TextField.Label>
      </Show>
      <TextField.TextArea onBlur={props.onBlur} type="text" value={props.value} onInput={props.onInput} />
    </TextField>
  );
};

interface DataProps extends Props {
  value: string;
  onValueChange: (v: string) => void;
  saveFunc: (v: string) => Promise<any>;
}

export const DataTextArea: ParentComponent<DataProps> = (props) => {
  return (
    <TextArea
      value={props.value}
      onBlur={() => props.saveFunc(props.value)}
      onInput={(e) => props.onValueChange(e.currentTarget.value)}
      label={props.label}
    />
  );
};

export default TextArea;
