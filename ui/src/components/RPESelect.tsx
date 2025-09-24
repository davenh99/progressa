import { ParentComponent } from "solid-js";

interface Props {
  value: number;
}

export const RPESelect: ParentComponent<Props> = (props) => {
  return <p>{props.value / 10}</p>;
};

export default RPESelect;
