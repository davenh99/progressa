import { ParentComponent } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";

interface Props {
  onClick: () => void;
  class?: string;
}

export const Button: ParentComponent<Props> = (props) => {
  return (
    <KobalteButton onClick={props.onClick} class={`rounded-sm border px-2 py-1 ${props.class ?? ""}`}>
      {props.children}
    </KobalteButton>
  );
};

export default Button;
