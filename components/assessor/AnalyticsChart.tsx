'use client';

// ============================================================
// components/assessor/AnalyticsChart.tsx
// Responsive wrapper for Recharts displaying assessor analytics.
// ============================================================

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  xKey?: string;
  yKeys?: { key: string; color: string; name?: string }[];
  height?: number;
}

export function AnalyticsChart({ type, data, xKey = 'name', yKeys = [], height = 300 }: ChartProps) {
  // Custom premium tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-base-900)]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] p-3 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[var(--color-base-400)]">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'line') {
    return (
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey={xKey} stroke="var(--color-base-600)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-base-600)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.map((y) => (
              <Line
                key={y.key}
                type="monotone"
                dataKey={y.key}
                name={y.name || y.key}
                stroke={y.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: y.color, stroke: 'var(--color-base-900)', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey={xKey} stroke="var(--color-base-600)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-base-600)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.map((y) => (
              <Bar
                key={y.key}
                dataKey={y.key}
                name={y.name || y.key}
                fill={y.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
