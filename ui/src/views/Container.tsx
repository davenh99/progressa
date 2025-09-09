import { ParentComponent } from "solid-js";

const Container: ParentComponent = (props) => {
  return <div class="container mx-auto sm:p-4">{props.children}</div>;
};

export default Container;
