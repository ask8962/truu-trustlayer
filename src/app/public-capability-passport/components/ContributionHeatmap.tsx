'use client';

import React, { useState } from 'react';
import { GitCommit } from 'lucide-react';

// Generate deterministic heatmap data — 52 weeks × 7 days
function generateHeatmapData() {
  const data: { week: number; day: number; value: number; date: string }[] = [];
  const baseDate = new Date('2025-05-08');

  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + week * 7 + day);

      // Deterministic value based on position — no Math.random()
      const seed = (week * 7 + day);
      const isWeekend = day === 0 || day === 6;
      const baseVal = isWeekend ? (seed % 3) : (seed % 8);
      const spike = (week === 12 || week === 28 || week === 44) && day === 4 ? 4 : 0;
      const value = Math.min(baseVal + spike, 9);

      data.push({
        week,
        day,
        value,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      });
    }
  }
  return data;
}

const HEATMAP_DATA = generateHeatmapData();

function getCellColor(value: number): string {
  if (value === 0) return 'rgba(255,255,255,0.04)';
  if (value <= 2) return 'rgba(59,130,246,0.2)';
  if (value <= 4) return 'rgba(59,130,246,0.4)';
  if (value <= 6) return 'rgba(139,92,246,0.5)';
  if (value <= 8) return 'rgba(139,92,246,0.75)';
  return 'rgba(6,182,212,0.9)';
}

const MONTH_LABELS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

  const totalCommits = HEATMAP_DATA.reduce((acc, d) => acc + d.value, 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <GitCommit size={16} className="text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">Contribution Activity</h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-2 py-1 rounded-full">
          {totalCommits.toLocaleString()} contributions
        </span>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border/50 overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-1 mb-1 ml-6">
          {MONTH_LABELS.map((month, i) => (
            <div key={`month-${i}`} className="text-[9px] font-mono text-muted-foreground" style={{ width: `${(52 / 12) * 11}px`, flexShrink: 0 }}>
              {month}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAY_LABELS.map((d, i) => (
              <div key={`day-label-${i}`} className="text-[9px] font-mono text-muted-foreground w-4 h-[11px] flex items-center justify-center">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1 relative">
            {Array.from({ length: 52 }, (_, week) => (
              <div key={`heatmap-week-${week}`} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, day) => {
                  const cell = HEATMAP_DATA.find(d => d.week === week && d.day === day);
                  if (!cell) return null;
                  return (
                    <div
                      key={`heatmap-cell-${week}-${day}`}
                      className="heatmap-cell w-[11px] h-[11px] cursor-pointer"
                      style={{ background: getCellColor(cell.value), border: `1px solid rgba(255,255,255,0.04)` }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ date: cell.date, value: cell.value, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[9px] font-mono text-muted-foreground">Less</span>
          {[0, 2, 4, 6, 9].map((v) => (
            <div
              key={`legend-${v}`}
              className="w-[11px] h-[11px] rounded-sm"
              style={{ background: getCellColor(v) }}
            />
          ))}
          <span className="text-[9px] font-mono text-muted-foreground">More</span>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 glass-card-bright rounded-lg px-3 py-2 border text-xs font-mono pointer-events-none"
            style={{ top: tooltip.y - 50, left: tooltip.x - 40 }}
          >
            <p className="text-foreground font-bold">{tooltip.value} commits</p>
            <p className="text-muted-foreground">{tooltip.date}</p>
          </div>
        )}
      </div>
    </div>
  );
}