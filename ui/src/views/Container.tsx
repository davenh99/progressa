import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
  noPadding?: boolean;
}

const Container: ParentComponent<Props> = (props) => {
  const classes = `flex-1 overflow-y-auto ${props.noPadding ? "" : "py-4 px-[3vw]"} ${props.class ?? ""}`;

  return <div class={classes}>{props.children}</div>;
};

export default Container;
