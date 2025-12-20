import {
  select,
  pointer,
  scaleLinear,
  line as d3Line,
  area as d3Area,
  curveCatmullRom,
  easeCubicOut,
} from "d3";

import { useEffect, useRef } from "react";

interface Props {
  scores: number[];
  width?: number;
  height?: number;
}

export default function ScoreSparkline({
  scores,
  width = 300,
  height = 80,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || scores.length === 0) return;

    const svg = select(ref.current);
    svg.selectAll("*").remove();

    // Setup scales
    const x = scaleLinear()
      .domain([0, scores.length - 1])
      .range([0, width]);
    const y = scaleLinear()
      .domain([0, 100])
      .range([height - 10, 0]);

    // Line generator
    const line = d3Line()
      .x((_: any, i: any) => x(i))
      .y((d: any) => y(d))
      .curve(curveCatmullRom.alpha(0.6));

    // Area generator (for gradient fill)
    const area = d3Area()
      .x((_: any, i: number) => x(i))
      .y0(height)
      .y1((d: any) => y(d))
      .curve(curveCatmullRom.alpha(0.6));

    // Gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "sparklineGradient")
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.45);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.05);

    // Draw area
    svg
      .append("path")
      .attr("d", area(scores)!)
      .attr("fill", "url(#sparklineGradient)")
      .attr("opacity", 0)
      .transition()
      .duration(1400)
      .attr("opacity", 1);

    // Draw line
    const path = svg
      .append("path")
      .attr("d", line(scores)!)
      .attr("fill", "none")
      .attr("stroke", "#16a34a")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    // Animate the line drawing
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1700)
      .ease(easeCubicOut)
      .attr("stroke-dashoffset", 0);

    // Tooltip circle
    const circle = svg
      .append("circle")
      .attr("r", 0)
      .attr("fill", "#15803d")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Tooltip box
    const tooltip = select(ref.current.parentNode as HTMLElement)
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "4px 8px")
      .style("font-size", "12px")
      .style("border", "1px solid #ddd")
      .style("border-radius", "6px")
      .style("box-shadow", "0 3px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Hover overlay
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove touchmove", (event: any) => {
        const [mx] = pointer(event);
        const index = Math.round(x.invert(mx));
        const value = scores[index];

        if (value == null) return;

        circle
          .attr("cx", x(index))
          .attr("cy", y(value))
          .transition()
          .duration(100)
          .attr("r", 5);

        tooltip
          .style("opacity", 1)
          .style("left", x(index) + 10 + "px")
          .style("top", y(value) + 10 + "px")
          .html(`<strong>${value}%</strong>`);
      })
      .on("mouseleave", () => {
        circle.transition().duration(300).attr("r", 0);
        tooltip.style("opacity", 0);
      });
  }, [scores]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref} width={width} height={height}></svg>
    </div>
  );
}

/*
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface Props {
  scores: number[];
  width?: number;
  height?: number;
}

export default function ScoreSparkline({
  scores,
  width = 260,
  height = 60,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || scores.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // clean

    const x = d3
      .scaleLinear()
      .domain([0, scores.length - 1])
      .range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Path
    const path = svg
      .append("path")
      .attr("d", line(scores)!)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    // Fade-in + slide animation
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    // Circle point on latest score
    svg
      .append("circle")
      .attr("cx", x(scores.length - 1))
      .attr("cy", y(scores[scores.length - 1]))
      .attr("r", 0)
      .attr("fill", "#16a34a")
      .transition()
      .delay(600)
      .duration(400)
      .attr("r", 5);
  }, [scores]);

  return <svg ref={ref} width={width} height={height}></svg>;
}

*/
