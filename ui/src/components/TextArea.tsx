import { JSX, ParentComponent, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";
import { debounce } from "../methods/debounce";

interface Props {
  label?: string;
  value?: string;
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>;
}

export const TextArea: ParentComponent<Props> = (props) => {
  return (
    <TextField>
      <Show when={props.label}>
        <TextField.Label>{props.label}</TextField.Label>
      </Show>
      <TextField.TextArea type="text" value={props.value} onInput={props.onInput} />
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
      onInput={(e) => {
        props.onValueChange(e.currentTarget.value);
        debounce(props.saveFunc)(e.currentTarget.value);
      }}
      label={props.label}
    />
  );
};

export default TextArea;
