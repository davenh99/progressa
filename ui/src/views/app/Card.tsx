import { ParentComponent } from "solid-js";

interface Props {
  class?: string;
}

const Card: ParentComponent<Props> = (props) => {
  return (
    <div class={`${props.class ?? ""} rounded-2xl p-2 bg-charcoal-900/15 text-dark-slate-gray-900`}>
      {props.children}
    </div>
  );
};

export default Card;
