'use client';

// ============================================================
// components/admin/AdminDashboardCharts.tsx
// Client-side Recharts charts for the executive dashboard.
// Renders claim timeline + specialization distribution.
// ============================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── Claim Timeline ───────────────────────────────────────────

interface ClaimTimelineProps {
  data: { month: string; filed: number; approved: number; rejected: number }[];
}

export function ClaimTimelineChart({ data }: ClaimTimelineProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFiled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#e2e8f0',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}
        />
        <Area type="monotone" dataKey="filed" name="Filed" stroke="#818cf8" strokeWidth={2} fill="url(#gradFiled)" dot={false} />
        <Area type="monotone" dataKey="approved" name="Approved" stroke="#4ade80" strokeWidth={2} fill="url(#gradApproved)" dot={false} />
        <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#f87171" strokeWidth={2} fill="url(#gradRejected)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Revenue Timeline ─────────────────────────────────────────

interface RevenueChartProps {
  data: { month: string; revenue: number; purchases: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#e2e8f0',
          }}
          formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
        />
        <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Specialization Pie ───────────────────────────────────────

interface SpecPieProps {
  data: { name: string; value: number; color: string }[];
}

export function SpecializationPieChart({ data }: SpecPieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#e2e8f0',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', paddingTop: '8px' }}
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Registration Timeline ────────────────────────────────────

interface RegistrationChartProps {
  data: { month: string; customers: number; assessors: number }[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCustomers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradAssessors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#e2e8f0',
          }}
        />
        <Area type="monotone" dataKey="customers" name="Customers" stroke="#60a5fa" strokeWidth={2} fill="url(#gradCustomers)" dot={false} />
        <Area type="monotone" dataKey="assessors" name="Assessors" stroke="#c084fc" strokeWidth={2} fill="url(#gradAssessors)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
