import { Component, For } from "solid-js";
import { Session } from "../../../Types";

interface TSummary extends Session {
  dailyKj: number;
  dailyGramsProtein: number;
  dailyGramsFat: number;
  dailyGramsCarbohydrate: number;
}

interface Props {
  dateSummaries: TSummary[];
}

const Summary: Component<Props> = (props) => {
  return (
    <div>
      <For each={props.dateSummaries}>
        {(summary) => (
          <div>
            <h2>{summary.name}</h2>
            <p>{summary.notes}</p>
          </div>
        )}
      </For>
    </div>
  );
};

export default Summary;
