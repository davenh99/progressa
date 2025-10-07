import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
  noPadding?: boolean;
}

const Container: ParentComponent<Props> = (props) => {
  const classes = `flex-1  text-dark-slate-gray-900 ${props.noPadding ? "" : "py-4 px-[3vw]"} ${
    props.class ?? ""
  }`;

  return <div class={classes}>{props.children}</div>;
};

export default Container;
