import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import * as Plot from "@observablehq/plot";

import { Analysis, Session, SleepQuality } from "../../../Types";
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
      <Show
        when={editing()}
        fallback={
          <>
            <Graph analysis={props.analysis} setAnalysis={props.setAnalysis} />
            <p>we will put stuff here to add series and stuff</p>
          </>
        }
      >
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
const sleepValueValues: { [key in SleepQuality | ""]: number } = {
  terrible: 0.1,
  poor: 0.3,
  fair: 0.5,
  good: 0.7,
  great: 0.9,
  "": NaN,
};
import sampleData from "../../../../test_data/sampleData.json";

const Graph: Component<Props> = (props) => {
  const [data, setData] = createSignal<Session[]>(sampleData as any);
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

  // createEffect(() => getData());

  const computedData = createMemo(() => {
    let mappedData = filterByRange(data(), range())
      .filter((s) => s.sleepQuality !== undefined && s.sleepQuality !== null)
      .sort((sA, sB) => new Date(sA.userDay).getTime() - new Date(sB.userDay).getTime())
      .map((s) => {
        let kj = 0;
        let gramsProtein = 0;
        for (const m of s.expand?.sessionMeals_via_session ?? []) {
          kj += m.kj;
          gramsProtein += m.gramsProtein;
        }

        return {
          date: new Date(s.userDay),
          scaledValue: sleepValueValues[s.sleepQuality],
          originalValue: s.sleepQuality,
          series: "Sleep Quality",
          kj,
          gramsProtein,
        };
      });

    const normalizeData = (value: number, min: number, max: number, buffer = 0.1) => {
      if (Number.isNaN(value)) return NaN;
      const range = max - min;
      const bufferedMin = min - range * buffer;
      const bufferedMax = max + range * buffer;
      if (bufferedMax === bufferedMin) return 0.5;
      return (value - bufferedMin) / (bufferedMax - bufferedMin);
    };

    mappedData = mappedData.map((d) => ({
      ...d,
      kj: normalizeData(
        d.kj || NaN,
        Math.min(...mappedData.map((d) => d.kj)),
        Math.max(...mappedData.map((d) => d.kj))
      ),
      gramsProtein: normalizeData(
        d.gramsProtein || NaN,
        Math.min(...mappedData.map((d) => d.gramsProtein)),
        Math.max(...mappedData.map((d) => d.gramsProtein))
      ),
    }));

    return mappedData;
  });

  return (
    <div class="w-full flex flex-col items-center">
      <SegmentedControl value={range} onChange={setRange} options={ranges} />
      <PlotChart
        options={{
          y: { grid: 5, label: "Value", tickFormat: () => "", ticks: [0.2, 0.4, 0.6, 0.8] },
          x: { label: null },
          marginBottom: 40,
          width: 370,
          height: 300,
          style: {
            fontSize: "0.9rem",
            fontWeight: "bold",
            strokeWidth: "2",
            fontFamily: "Rubik",
          },
          color: { scheme: "Greens" },
          marks: [
            Plot.ruleY([0]),
            Plot.ruleX([computedData()[0].date]),
            Plot.lineY(computedData(), {
              x: "date",
              y: "scaledValue",
              stroke: "series",
              curve: "monotone-x",
              strokeWidth: 2.5,
              dx: -4, // TODO offset sleep so it is between days, need to calculate distance properly
            }),
            Plot.lineY(computedData(), {
              x: "date",
              y: "kj",
              stroke: "red",
              curve: "monotone-x",
              strokeWidth: 2.5,
            }),
            Plot.lineY(computedData(), {
              x: "date",
              y: "gramsProtein",
              stroke: "blue",
              curve: "monotone-x",
              strokeWidth: 2.5,
            }),
            Plot.tip(
              computedData(),
              Plot.pointerX({ x: "date", y: "kj", style: { background: "red", opacity: 1 } })
            ),
          ],
        }}
      />
    </div>
  );
};

export default AnalysisGraph;
