import { ParentComponent } from "solid-js";

const SectionHeader: ParentComponent = (props) => {
  return <header class="p-4 border-b-1">{props.children}</header>;
};

export default SectionHeader;
