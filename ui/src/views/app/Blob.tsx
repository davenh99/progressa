import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
}

const Blob: ParentComponent<Props> = (props) => {
  return (
    <div class={`${props.class ?? ""} rounded-2xl p-2 bg-charcoal-300/80 text-dark-slate-gray-900`}>
      {props.children}
    </div>
  );
};

export default Blob;
