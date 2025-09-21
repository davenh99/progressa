import { ParentComponent } from "solid-js";

const SectionHeader: ParentComponent = (props) => {
  return <header class="px-[5vw] py-4 border-b-1 bg-charcoal-500 text-white">{props.children}</header>;
};

export default SectionHeader;
