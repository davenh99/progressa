import { Component, createEffect, onCleanup } from "solid-js";
import * as Plot from "@observablehq/plot";

interface PlotProps {
  options: Plot.PlotOptions;
}

const PlotChart: Component<PlotProps> = (props) => {
  let ref: HTMLDivElement | undefined;
  let chart: ((SVGSVGElement | HTMLElement) & Plot.Plot) | null = null;

  createEffect(() => {
    if (!ref) return;

    // clean up old chart
    if (chart) {
      chart.remove();
      chart = null;
    }

    // create new chart from updated options
    chart = Plot.plot(props.options);
    ref.appendChild(chart);

    // cleanup when component unmounts
    onCleanup(() => {
      chart?.remove();
      chart = null;
    });
  });

  return <div ref={ref} />;
};

export default PlotChart;
