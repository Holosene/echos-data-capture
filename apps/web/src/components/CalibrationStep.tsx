import React from 'react';
import { GlassPanel, Button, Slider, Tooltip, colors } from '@echos/ui';
import { estimateVolume } from '@echos/core';
import { useAppState } from '../store/app-state.js';

export function CalibrationStep() {
  const { state, dispatch } = useAppState();
  const { calibration, crop, gpxTrack } = state;

  const totalDistM = gpxTrack?.totalDistanceM ?? 100;
  const est = estimateVolume(
    crop.width,
    crop.height,
    totalDistM,
    calibration.yStepM,
    calibration.downscaleFactor,
  );

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Calibration</h2>
      <p style={{ color: colors.whiteDim, fontSize: '14px' }}>
        Set the maximum depth shown on your sonar screen and adjust processing parameters.
        Hover the (?) icons for explanations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <GlassPanel>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Depth & Resolution</h3>

          <Slider
            label="Depth Max"
            value={calibration.depthMaxM}
            min={1}
            max={100}
            step={0.5}
            unit=" m"
            tooltip="The maximum depth displayed on your sonar screen. Check your sonar settings. This calibrates the Z axis of the volume."
            onChange={(v) => dispatch({ type: 'SET_CALIBRATION', calibration: { depthMaxM: v } })}
          />

          <Slider
            label="Y Step"
            value={calibration.yStepM}
            min={0.05}
            max={1.0}
            step={0.05}
            unit=" m"
            tooltip="Distance between resampled slices along the track. Smaller = more detail but larger volume. Default 0.10m is good for most cases."
            onChange={(v) => dispatch({ type: 'SET_CALIBRATION', calibration: { yStepM: v } })}
          />
        </GlassPanel>

        <GlassPanel>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Processing</h3>

          <Slider
            label="FPS Extraction"
            value={calibration.fpsExtraction}
            min={1}
            max={5}
            step={1}
            unit=" fps"
            tooltip="Frames per second extracted from the video. Higher = more data but slower processing. 2 fps is a good balance."
            onChange={(v) => dispatch({ type: 'SET_CALIBRATION', calibration: { fpsExtraction: v } })}
          />

          <Slider
            label="Downscale"
            value={calibration.downscaleFactor}
            min={0.25}
            max={1.0}
            step={0.25}
            unit="x"
            tooltip="Scale factor applied to each frame. 0.5 = half resolution. Reduces memory usage and processing time."
            onChange={(v) => dispatch({ type: 'SET_CALIBRATION', calibration: { downscaleFactor: v } })}
          />
        </GlassPanel>
      </div>

      <GlassPanel padding="16px">
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, marginBottom: '12px' }}>
          Volume Estimate
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Dimensions</div>
            <div style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {est.dimX} x {est.dimY} x {est.dimZ}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Memory</div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: est.estimatedMB > 512 ? colors.warning : colors.white,
              }}
            >
              {est.estimatedMB.toFixed(0)} MB
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Track Distance</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{totalDistM.toFixed(0)} m</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: colors.whiteMuted }}>Z Spacing</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {(calibration.depthMaxM / (crop.height * calibration.downscaleFactor)).toFixed(3)} m/px
            </div>
          </div>
        </div>

        {est.estimatedMB > 512 && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(245, 166, 35, 0.1)',
              border: `1px solid ${colors.warning}`,
              borderRadius: '8px',
              fontSize: '13px',
              color: colors.warning,
            }}
          >
            Large volume detected. Consider reducing resolution (downscale) or increasing Y step.
          </div>
        )}
      </GlassPanel>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'crop' })}>
          Back
        </Button>
        <Button variant="primary" onClick={() => dispatch({ type: 'SET_STEP', step: 'sync' })}>
          Next: Sync
        </Button>
      </div>
    </div>
  );
}
