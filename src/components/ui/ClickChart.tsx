"use client";

import { useId, useState } from "react";

interface ClickChartProps {
  data: { date: string; clicks: number }[];
  height?: number;
}

export default function ClickChart({ data, height = 240 }: ClickChartProps) {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500"
        style={{ height }}
      >
        No click activity recorded in this period.
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((d) => d.clicks), 5);
  const minClicks = 0;
  const range = maxClicks - minClicks || 1;

  const width = 800;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const stepX = chartWidth / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - ((d.clicks - minClicks) / range) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  // Grid lines
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const value = Math.round(minClicks + (range / gridSteps) * i);
    const y = height - paddingY - (i / gridSteps) * chartHeight;
    return { value, y };
  });

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible select-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={paddingX}
              y1={line.y}
              x2={width - paddingX}
              y2={line.y}
              stroke="#1e293b"
              strokeDasharray="4 4"
            />
            <text
              x={paddingX - 10}
              y={line.y + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px]"
            >
              {line.value}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line stroke */}
        <path
          d={linePath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === idx ? 6 : 3.5}
              fill="#070b14"
              stroke="#a78bfa"
              strokeWidth={hoveredIndex === idx ? 3 : 2}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Transparent hover target */}
            <rect
              x={p.x - stepX / 2}
              y={paddingY}
              width={stepX}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        ))}

        {/* X-axis labels (render select dates to avoid clutter) */}
        {points.map((p, idx) => {
          const showLabel =
            idx === 0 ||
            idx === points.length - 1 ||
            idx % Math.ceil(points.length / 5) === 0;

          if (!showLabel) return null;

          const dateObj = new Date(p.date);
          const formatted = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

          return (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {formatted}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-purple-500/40 bg-slate-900/95 px-3 py-1.5 shadow-xl backdrop-blur-md transition-all"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100}%`
          }}
        >
          <div className="text-[11px] font-semibold text-purple-300">
            {points[hoveredIndex].date}
          </div>
          <div className="text-xs font-bold text-white">
            {points[hoveredIndex].clicks} {points[hoveredIndex].clicks === 1 ? "click" : "clicks"}
          </div>
        </div>
      )}
    </div>
  );
}
