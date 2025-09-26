import { createEffect, on, Component, Show, splitProps, ValidComponent } from "solid-js";
import { TextField, type TextFieldInputProps } from "@kobalte/core/text-field";
import type { PolymorphicProps } from "@kobalte/core";
import { debounce } from "../methods/debounce";

interface ExtraProps {
  label?: string;
}

type TextAreaProps<T extends ValidComponent = "input"> = ExtraProps &
  PolymorphicProps<T, TextFieldInputProps<T>>;

export const TextArea: Component<TextAreaProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class"]);
  let textareaRef: HTMLTextAreaElement | undefined;

  const autoResize = () => {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  };

  createEffect(
    on(
      () => others.value,
      () => autoResize()
    )
  );

  return (
    <TextField class={local.class ?? ""}>
      <Show when={local.label}>
        <TextField.Label>{local.label}</TextField.Label>
      </Show>
      <TextField.TextArea
        ref={textareaRef}
        class={`w-full resize-none border-2 border-ash-gray-400 rounded-sm overflow-hidden px-2 py-1`}
        {...others}
      />
    </TextField>
  );
};

interface DataProps extends TextAreaProps {
  value: string;
  onValueChange: (v: string) => void;
  saveFunc: (v: string) => Promise<any>;
}

export const DataTextArea: Component<DataProps> = (props) => {
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
