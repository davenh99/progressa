import { ParentComponent } from "solid-js";

const Container: ParentComponent = (props) => {
  return <div class="p-8">{props.children}</div>;
};

export default Container;
