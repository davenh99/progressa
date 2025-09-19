import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
}

const Container: ParentComponent<Props> = (props) => {
  return <div class={`px-[3vw] flex-1 py-4 overflow-y-auto ${props.class ?? ""}`}>{props.children}</div>;
};

export default Container;
