import { ParentComponent, splitProps, Show, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import { Button as KobalteButton } from "@kobalte/core/button";

interface Props {
  onClick?: () => void;
  href?: string;
  class?: string;
  variant?: "text";
  variantColor?: "good" | "bad" | "neutral";
}

export const Button: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, ["children", "href", "onClick", "class", "variant"]);

  const classes = createMemo(() => {
    const baseClass = `font-bold active:opacity-80 ${local.class ?? ""}`;

    if (props.variant === "text") {
      const extendedClass = `${baseClass} p-1`;
      switch (props.variantColor) {
        case "good":
          return `${extendedClass} text-green-400`;
        case "bad":
          return `${extendedClass} text-red-400`;
        default:
          return `${extendedClass} text-charcoal-800`;
      }
    } else {
      const extendedClass = `${baseClass} rounded-md px-3 py-1 text-charcoal-300 border-1`;
      switch (props.variantColor) {
        case "good":
          return `${extendedClass} bg-green-400/20 text-green-400`;
        case "bad":
          return `${extendedClass} bg-red-400/20 text-red-400`;
        default:
          return `${extendedClass} bg-charcoal-800/20 text-charcoal-800`;
      }
    }
  });

  return (
    <Show
      when={local.href}
      fallback={
        <KobalteButton onClick={local.onClick} class={classes()} {...others}>
          {local.children}
        </KobalteButton>
      }
    >
      <A href={local.href!} class={classes()} {...others}>
        {local.children}
      </A>
    </Show>
  );
};

export default Button;
