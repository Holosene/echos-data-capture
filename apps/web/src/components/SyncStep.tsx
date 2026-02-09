import React, { useMemo } from 'react';
import { GlassPanel, Button, Slider, colors } from '@echos/ui';
import { enrichTrackpoints } from '@echos/core';
import { useAppState } from '../store/app-state.js';

export function SyncStep() {
  const { state, dispatch } = useAppState();
  const { gpxTrack, videoDurationS, sync } = state;

  const enriched = useMemo(
    () => (gpxTrack ? enrichTrackpoints(gpxTrack) : []),
    [gpxTrack],
  );

  const maxDist = enriched.length > 0 ? enriched[enriched.length - 1].cumulativeDistanceM : 0;

  // Simple distance chart as SVG
  const chartWidth = 600;
  const chartHeight = 120;
  const chartPoints = useMemo(() => {
    if (enriched.length === 0) return '';
    const maxT = enriched[enriched.length - 1].elapsedS || 1;
    return enriched
      .map((pt) => {
        const x = (pt.elapsedS / maxT) * chartWidth;
        const y = chartHeight - (pt.cumulativeDistanceM / (maxDist || 1)) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }, [enriched, maxDist]);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Synchronization</h2>
      <p style={{ color: colors.whiteDim, fontSize: '14px' }}>
        Align video timeline with GPS track. Default: video start = GPX start, video end = GPX end.
        Adjust offset if recording started before or after GPS.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <GlassPanel padding="16px">
          <div style={{ fontSize: '13px', color: colors.whiteMuted, marginBottom: '4px' }}>Video Duration</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{videoDurationS.toFixed(1)}s</div>
        </GlassPanel>
        <GlassPanel padding="16px">
          <div style={{ fontSize: '13px', color: colors.whiteMuted, marginBottom: '4px' }}>GPX Duration</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{gpxTrack?.durationS.toFixed(1) ?? '—'}s</div>
        </GlassPanel>
      </div>

      <GlassPanel>
        <Slider
          label="Time Offset"
          value={sync.offsetS}
          min={-30}
          max={30}
          step={0.5}
          unit=" s"
          tooltip="Positive: GPX starts after video. Negative: GPX starts before video. Adjust if the tracks don't align."
          onChange={(v) => dispatch({ type: 'SET_SYNC', sync: { offsetS: v } })}
        />

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: colors.whiteMuted, marginBottom: '8px' }}>
            Distance over time (GPX)
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: '120px', background: colors.blackLight, borderRadius: '8px' }}
          >
            {/* Offset indicator */}
            {sync.offsetS !== 0 && gpxTrack && (
              <line
                x1={(Math.abs(sync.offsetS) / (gpxTrack.durationS || 1)) * chartWidth}
                y1={0}
                x2={(Math.abs(sync.offsetS) / (gpxTrack.durationS || 1)) * chartWidth}
                y2={chartHeight}
                stroke={colors.warning}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}
            {/* Distance curve */}
            <polyline
              points={chartPoints}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
            />
          </svg>
        </div>
      </GlassPanel>

      <GlassPanel padding="16px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Total Distance</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{maxDist.toFixed(0)} m</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Avg Speed</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>
              {gpxTrack && gpxTrack.durationS > 0
                ? (maxDist / gpxTrack.durationS).toFixed(1)
                : '—'}{' '}
              m/s
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Time Ratio</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>
              {gpxTrack ? (gpxTrack.durationS / videoDurationS).toFixed(2) : '—'}x
            </div>
          </div>
        </div>
      </GlassPanel>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'calibration' })}>
          Back
        </Button>
        <Button variant="primary" onClick={() => dispatch({ type: 'SET_STEP', step: 'generate' })}>
          Next: Generate Volume
        </Button>
      </div>
    </div>
  );
}
