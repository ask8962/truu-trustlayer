'use client';

import React, { useState } from 'react';
import { GitCommit } from 'lucide-react';
import { useProfile } from '../ProfileContext';

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
  const { heatmapData } = useProfile();
  const [tooltip, setTooltip] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

  // If no data, render an empty grid gracefully
  const dataToUse = heatmapData && heatmapData.length > 0 ? heatmapData : [];
  const totalCommits = dataToUse.reduce((acc, d) => acc + d.value, 0);

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
                  const cell = dataToUse.find(d => d.week === week && d.day === day);
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