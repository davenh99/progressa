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
  initial: string;
  saveFunc: (v: string) => Promise<any>;
}

export const DataTextArea: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal(props.initial);

  createEffect(() => {
    setVal(props.initial);
  });

  return (
    <TextArea
      value={val()}
      onBlur={() => props.saveFunc(val())}
      onInput={(e) => setVal(e.currentTarget.value)}
      label={props.label}
    />
  );
};

export default TextArea;
