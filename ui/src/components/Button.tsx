import { ParentComponent } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";

interface Props {
  onClick: () => void;
}

export const Button: ParentComponent<Props> = (props) => {
  return (
    <KobalteButton onClick={props.onClick} class="rounded-sm border">
      {props.children}
    </KobalteButton>
  );
};

export default Button;
