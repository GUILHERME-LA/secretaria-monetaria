"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

type Props = {
  data: number[];
  color: string;
  height?: number;
};

export function SparklineChart({ data, color, height = 40 }: Props) {
  if (data.length < 2) return null;

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
