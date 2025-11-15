import { Accessor, Component, createEffect, createMemo, createSignal, Setter, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import * as Plot from "@observablehq/plot";

import { Analysis as TAnalysis, Session, SleepQuality } from "../../../Types";
import { TextArea, Input, Button, sleepValueLabels } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import PlotChart from "./Plot";
import LoadFullScreen from "../app/LoadFullScreen";
import { ClientResponseError } from "pocketbase";
import { SegmentedControl } from "../../components";
import { filterByRange } from "../../methods/analysis";

interface Props {
  analysis: TAnalysis;
  setAnalysis: SetStoreFunction<{
    analysis: TAnalysis | null;
  }>;
  pageDimensions: Accessor<{
    width: number;
    height: number;
  }>;
}

const Analysis: Component<Props> = (props) => {
  const [editing, setEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.analysis.title);
  const [description, setDescription] = createSignal(props.analysis.description);
  const [series, setSeries] = createSignal(props.analysis.series);
  const [filters, setFilters] = createSignal(props.analysis.filters);
  const [selectedDate, setSelectedDate] = createSignal({ start: "", end: "" });
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

  createEffect(() => {
    console.log(selectedDate());
  });

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
            <Graph {...props} setSelectedDate={setSelectedDate} />
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

interface GraphProps extends Props {
  setSelectedDate: Setter<{
    start: string;
    end: string;
  }>;
}

const Graph: Component<GraphProps> = (props) => {
  let plotRef: HTMLDivElement | undefined;
  const [data, setData] = createSignal<Session[]>(sampleData as any);
  const [range, setRange] = createSignal("1y");
  const { pb } = useAuthPB();

  const getData = async () => {
    try {
      const sessions = await pb.collection<Session>("sessions").getFullList({ sort: " -userDay" });

      // setData(sessions);
    } catch (e) {
      if (e instanceof ClientResponseError && e.status == 0) {
      } else {
        console.error("get sessions error: ", e);
      }
    }
  };

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
          sleep: sleepValueValues[s.sleepQuality],
          originalSleep: sleepValueLabels[s.sleepQuality],
          weight: 0,
          originalWeight: s.userWeight,
          series: "Sleep Quality",
          originalKj: kj,
          originalGramsProtein: gramsProtein,
          kj: NaN,
          gramsProtein: NaN,
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
        d.originalKj || NaN,
        Math.min(...mappedData.map((d) => d.originalKj)),
        Math.max(...mappedData.map((d) => d.originalKj))
      ),
      gramsProtein: normalizeData(
        d.originalGramsProtein || NaN,
        Math.min(...mappedData.map((d) => d.originalGramsProtein)),
        Math.max(...mappedData.map((d) => d.originalGramsProtein))
      ),
      weight: normalizeData(
        d.originalWeight || NaN,
        Math.min(...mappedData.map((d) => d.originalWeight)),
        Math.max(...mappedData.map((d) => d.originalWeight))
      ),
    }));

    const long = mappedData.flatMap((d) => [
      {
        date: d.date,
        series: "Sleep",
        value: d.sleep,
        raw: d.originalSleep,
      },
      {
        date: d.date,
        series: "Weight",
        value: d.weight,
        raw: d.originalWeight,
      },
      // {
      //   date: d.date,
      //   series: "KJ",
      //   value: d.kj,
      //   raw: d.originalKj,
      // },
      // {
      //   date: d.date,
      //   series: "Protein",
      //   value: d.gramsProtein,
      //   raw: d.originalGramsProtein,
      // },
    ]);

    return long;
  });

  createEffect(() => getData());

  return (
    <div class="w-full flex flex-col items-center">
      <SegmentedControl value={range} onChange={setRange} options={ranges} />
      <PlotChart
        class="py-1 px-0 rounded-md bg-dark-slate-gray-500 border-1 border-charcoal-700"
        options={{
          y: { grid: 5, label: "Value", tickFormat: () => "", ticks: [0.2, 0.4, 0.6, 0.8] },
          x: { label: null },
          marginBottom: 40,
          width: props.pageDimensions().width * 0.9,
          height: props.pageDimensions().height / 4,
          style: {
            fontSize: "0.9rem",
            fontWeight: "bold",
            strokeWidth: "2",
            fontFamily: "Rubik",
            color: "var(--color-charcoal-800)",
          },
          color: { scheme: "PRGn" },
          marks: [
            Plot.ruleY([0]),
            Plot.ruleX([computedData()[0].date]),
            Plot.lineY(computedData(), {
              x: "date",
              y: "value",
              stroke: "series",
              curve: "monotone-x",
              strokeWidth: 2,
            }),
            // links to set date
            Plot.rectY(computedData(), {
              x: (d) => d.date,
              x2: (d) => new Date(+d.date + 24 * 60 * 60 * 1000),
              y1: 0,
              y2: 1,
              title: (d) => d.date.toLocaleDateString(),
              stroke: "transparent",
              strokeWidth: 7,
              render(index, scales, values, dimensions, context, next) {
                const el = next?.(index, scales, values, dimensions, context) || null;
                const rects = el?.querySelectorAll("rect") ?? [];

                rects.forEach((rect, i) => {
                  rect.style.cursor = "pointer";

                  rect.addEventListener("click", () => {
                    const d = computedData()[i].date.toLocaleDateString("en-CA");
                    props.setSelectedDate({ start: d, end: d });
                  });
                });

                return el;
              },
            }),
            Plot.tip(
              computedData(),
              Plot.pointerX({
                x: "date",
                y: "value",
                title: (d) => `${d.date.toLocaleDateString()}\n${d.series}: ${d.raw}`,
                strokeWidth: 0.8,
                opacity: 0.95,
                fill: "var(--color-charcoal-300)",
              })
            ),
          ],
        }}
      />
    </div>
  );
};

export default Analysis;
