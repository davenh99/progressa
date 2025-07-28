import { ParentComponent } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";
import CloseIcon from "lucide-solid/icons/x";

interface Props {
  onClick: () => void;
  name: string;
}

export const Tag: ParentComponent<Props> = (props) => {
  return (
    <span class="badge">
      {props.name}
      <KobalteButton onClick={props.onClick} class="ml-1">
        <CloseIcon />
      </KobalteButton>
    </span>
  );
};

export default Tag;
