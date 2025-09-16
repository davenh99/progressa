import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
}

const Container: ParentComponent<Props> = (props) => {
  return <div class={`${props.class ?? ""} px-[3vw] py-4`}>{props.children}</div>;
};

export default Container;
