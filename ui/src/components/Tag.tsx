import { ParentComponent } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";
import CloseIcon from "lucide-solid/icons/x";

interface Props {
  onClick: () => void;
  name: string;
}

export const Tag: ParentComponent<Props> = (props) => {
  return (
    <div class="badge border-1 rounded-full p-2 flex flex-row">
      {props.name}
      <KobalteButton onClick={props.onClick} class="ml-1">
        <CloseIcon />
      </KobalteButton>
    </div>
  );
};

export default Tag;
