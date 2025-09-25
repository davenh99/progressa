import { Component } from "solid-js";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";

interface Props {
  value: number;
}

export const RPESelect: Component<Props> = (props) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger class="border-1 px-3">
        <p>{props.value / 10}</p>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <p>help</p>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};

export default RPESelect;
