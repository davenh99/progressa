import { ParentComponent, splitProps, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Button as KobalteButton } from "@kobalte/core/button";

interface Props {
  onClick?: () => void;
  href?: string;
  class?: string;
}

export const Button: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, ["children", "href", "onClick", "class"]);

  const classes = `rounded-lg bg-forest-green-800 px-3 py-1.5 font-bold active:opacity-80 ${
    local.class ?? ""
  }`;

  return (
    <Show
      when={local.href}
      fallback={
        <KobalteButton onClick={local.onClick} class={classes} {...others}>
          {local.children}
        </KobalteButton>
      }
    >
      <A href={local.href!} class={classes} {...others}>
        {local.children}
      </A>
    </Show>
  );
};

export default Button;
