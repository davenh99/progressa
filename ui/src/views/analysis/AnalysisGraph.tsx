import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import * as Plot from "@observablehq/plot";

import { Analysis, Session } from "../../../Types";
import { TextArea, Input, Button } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import PlotChart from "./Plot";
import LoadFullScreen from "../app/LoadFullScreen";
import { ClientResponseError } from "pocketbase";
import { SegmentedControl } from "../../components";
import { filterByRange } from "../../methods/analysis";

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
            <Button class="text-lg" variant="text" onClick={() => setEditing(true)}>
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

const ranges = ["5y", "1y", "6m", "1m", "custom"];

const Graph: Component<Props> = (props) => {
  const [data, setData] = createSignal<Session[]>([]);
  const [range, setRange] = createSignal("1y");
  const { pb } = useAuthPB();

  const getData = async () => {
    try {
      const sessions = await pb.collection<Session>("sessions").getFullList({ sort: "-userDay" });

      setData(sessions);
    } catch (e) {
      if (e instanceof ClientResponseError && e.status == 0) {
      } else {
        console.error("get sessions error: ", e);
      }
    }
  };

  createEffect(() => getData());

  const computedData = createMemo(() =>
    filterByRange(data(), range())
      .filter((s) => s.userWeight !== undefined && s.userWeight !== null)
      .map((s) => ({
        date: new Date(s.userDay),
        weight: s.userWeight,
        series: "Weight (kg)",
      }))
  );

  return (
    <div class="w-full flex flex-col items-center">
      <SegmentedControl value={range} onChange={setRange} options={ranges} />
      <PlotChart
        options={{
          y: { grid: true, label: null },
          x: { grid: true, label: null },
          width: 350,
          height: 250,
          style: {
            fontSize: "0.9rem",
          },
          color: { legend: true, scheme: "Greens" },
          marks: [
            Plot.ruleY([0]),
            Plot.line(computedData(), {
              x: "date",
              y: "weight",
              stroke: "series",
            }),
          ],
        }}
      />
    </div>
  );
};

export default AnalysisGraph;
