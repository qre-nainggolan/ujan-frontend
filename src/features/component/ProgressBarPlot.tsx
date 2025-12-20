import { useEffect, useRef } from "react";

import Plotly from "plotly.js-dist-min";

export default function ProgressBarPlot({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const width = 120;
    const height = 15;
    const data: any[] = []; // no bar traces

    const layout = {
      width,
      height,
      barmode: "stack",
      dragmode: false,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      xaxis: { visible: false, range: [0, 100], fixedrange: true },
      yaxis: { visible: false, range: [0, 10], fixedrange: true },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      shapes: [
        // Background bar (gray)
        {
          type: "rect",
          x0: 0,
          x1: 100,
          y0: 0,
          y1: 30,
          fillcolor: "#e5e7eb",
          line: { width: 0 },
          layer: "below",
          // rounded corner
          rx: 10,
          ry: 10,
        },
        {
          type: "rect",
          x0: 0,
          x1: value,
          y0: 0,
          y1: 30,
          fillcolor:
            value < 50
              ? "rgba(245, 5, 5, 0.6)"
              : value < 60
              ? "#fffc4b"
              : value >= 80
              ? "#16a34a"
              : "linear-gradient(to left bottom, #0067c1, rgb(70, 58, 151))",
          line: { width: 0 },
          rx: 10,
          ry: 10,
        },
      ],
    };

    const config = {
      displayModeBar: false,
      scrollZoom: false,
      doubleClick: false,
      staticPlot: true,
    };

    Plotly.newPlot(ref.current, data, layout, config);

    return () => {
      if (ref.current) {
        Plotly.purge(ref.current);
      }
    };
  }, [value]);

  return <div ref={ref} />;
}
