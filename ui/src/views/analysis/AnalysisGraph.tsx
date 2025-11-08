import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import * as Plot from "@observablehq/plot";
import { SegmentedControl } from "@kobalte/core/segmented-control";

import { Analysis, Session } from "../../../Types";
import { TextArea, Input, Button } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import PlotChart from "./Plot";
import LoadFullScreen from "../app/LoadFullScreen";

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
  const [saving, setSaving] = createSignal(false);
  const { pb } = useAuthPB();

  const save = async () => {
    setSaving(true);
    const data = {
      title: title(),
      description: description(),
      filters: filters(),
      series: series(),
    };

    try {
      await pb.collection("analyses").update(props.analysis.id, data);
      // console.log(props.analysis.id, JSON.stringify(data));

      props.setAnalysis("analysis", "title", title());
      props.setAnalysis("analysis", "description", description());
      props.setAnalysis("analysis", "series", series());
      props.setAnalysis("analysis", "filters", filters());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {saving() && <LoadFullScreen />}
      <div class="flex justify-end mt-2">
        <Show
          when={editing()}
          fallback={
            <Button class="text-lg" variant="text" variantColor="good" onClick={() => setEditing(true)}>
              edit
            </Button>
          }
        >
          <Button
            class="text-lg"
            variant="text"
            variantColor="good"
            onClick={() => save().then(() => setEditing(false))}
          >
            save
          </Button>
        </Show>
      </div>
      <Show when={editing()} fallback={<Graph analysis={props.analysis} setAnalysis={props.setAnalysis} />}>
        <Input label="Name" class="mb-3" labelPosition="above" value={title()} onChange={setTitle} />
        <TextArea
          label="Description"
          value={description()}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
      </Show>
    </div>
  );
};

type Range = "5y" | "1y" | "6m" | "1m" | "custom";
const ranges: Range[] = ["5y", "1y", "6m", "1m", "custom"];

const Graph: Component<Props> = (props) => {
  const [data, setData] = createSignal<Session[]>([]);
  const [range, setRange] = createSignal<Range>("5y");
  const { pb } = useAuthPB();

  const getData = async () => {
    try {
      const sessions = await pb.collection<Session>("sessions").getFullList({ sort: "-userDay" });
      console.log(sessions);
      setData(sessions);
    } catch (e) {
      console.error("get sessions error: ", e);
    }
  };

  createEffect(() => getData());

  return (
    <div>
      <SegmentedControl class="flex flex-col gap-0.5 my-2">
        <div role="presentation" class="bg-charcoal-600 rounded-sm m-0 p-0 relative w-fit">
          <SegmentedControl.Indicator
            class={`bg-charcoal-700 rounded-sm opacity-40 absolute transition-segmented-control-indicator
              `}
          />
          <div role="presentation" class="inline-flex list-none">
            <For each={ranges}>
              {(range) => (
                <SegmentedControl.Item value={range} class="relative flex justify-center px-2 py-1">
                  <SegmentedControl.ItemInput class="" />
                  <SegmentedControl.ItemLabel class="">{range}</SegmentedControl.ItemLabel>
                </SegmentedControl.Item>
              )}
            </For>
          </div>
        </div>
      </SegmentedControl>
      <PlotChart
        options={{
          caption: "my chart",
          y: { grid: true },
          x: { grid: true },
          color: { scheme: "burd" },
          marks: [Plot.ruleY([0]), Plot.dot(data(), { x: "x", y: "y", stroke: "Anomaly" })],
        }}
      />
    </div>
  );
};

export default AnalysisGraph;
