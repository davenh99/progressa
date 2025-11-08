import { Component, createSignal, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

import { Analysis } from "../../../Types";
import { TextArea, Input, Button } from "../../components";
import { useAuthPB } from "../../config/pocketbase";

interface Props {
  analysis: Analysis;
  setAnalysis: SetStoreFunction<{
    analysis: Analysis | null;
  }>;
}

const AnalysisGraph: Component<Props> = (props) => {
  const [editing, setEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.analysis.title);
  const [description, setDescription] = createSignal(props.analysis.description);
  const [series, setSeries] = createSignal(props.analysis.series);
  const [filters, setFilters] = createSignal(props.analysis.filters);
  const { pb } = useAuthPB();

  const save = async () => {
    const data = {
      title: title(),
      description: description(),
      filters: filters(),
      series: series(),
    };

    try {
      await pb.collection("analyses").update(props.analysis.id, data);

      props.setAnalysis("analysis", "title", title());
      props.setAnalysis("analysis", "description", description());
      props.setAnalysis("analysis", "series", series());
      props.setAnalysis("analysis", "filters", filters());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div>
        <Show
          when={editing()}
          fallback={
            <Button variant="text" variantColor="good" onClick={() => setEditing(true)}>
              edit
            </Button>
          }
        >
          <Button variant="text" variantColor="good" onClick={() => setEditing(false)}>
            save
          </Button>
        </Show>
      </div>
      <Show when={editing()} fallback={<Graph analysis={props.analysis} setAnalysis={props.setAnalysis} />}>
        <Input label="Name" class="mb-3" labelPosition="above" value={title()} onChange={setTitle} />
        <TextArea label="Description" value={description()} onChange={setDescription} />
      </Show>
    </div>
  );
};

const Graph: Component<Props> = (props) => {
  let data = [1, 2, 3, 4, 5];
  let other = [3, 6, 2, 54, 7];

  return <></>;
};

export default AnalysisGraph;
