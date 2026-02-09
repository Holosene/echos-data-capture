import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel, Button, colors } from '@echos/ui';

export function DocsPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.black,
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: colors.whiteMuted,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to ECHOS
        </button>

        <h1 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '32px' }}>
          Documentation
        </h1>

        <div style={{ display: 'grid', gap: '24px' }}>
          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: colors.primary }}>
              User Guide
            </h2>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>1. Recording</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              Record your sonar screen using your phone or tablet's built-in screen recording.
              Simultaneously, start a GPS tracking app (like GPX Recorder, Strava, or any app
              that exports .gpx files). Both recordings should cover the same time period.
              Ideally, start GPS first, then screen recording — and stop in reverse order.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>2. Import</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              Drag and drop your MP4 video and GPX file into the import step. ECHOS reads
              video metadata (resolution, duration) and parses the GPX track (points, distance,
              timestamps).
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>3. Crop</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              Draw a rectangle over the sonar echo display. Exclude menus, toolbars, depth
              scales, and decorations. Only the actual echo image should be inside the crop.
              This region will be extracted from every frame.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>4. Calibrate</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              Set the <strong>Depth Max</strong> — the maximum depth shown on your sonar screen
              (check your sonar's settings). This calibrates the vertical (Z) axis.
              Adjust FPS extraction (2 is usually enough), downscale factor (0.5 saves memory),
              and Y step (distance between slices — 0.10m is default).
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>5. Sync</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              By default, the video start aligns with the GPX start and the video end aligns
              with the GPX end. If there's a time difference, use the offset slider to adjust.
              The distance-time chart helps you verify alignment.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>6. Generate</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '16px' }}>
              Choose "Quick Preview" (processes only 30 seconds) to verify settings, or
              "Full Generation" for the complete volume. Processing happens in your browser —
              no data is sent to any server.
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>7. View & Export</h3>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px' }}>
              Explore the volume using three orthogonal slice views with color presets.
              Export the volume as NRRD (compatible with 3D Slicer, ParaView, etc.),
              the mapping data as JSON, the QC report, and your session settings
              for future re-processing.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: colors.primary }}>
              Technical Concepts
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                {
                  term: 'Crop Region',
                  def: 'The rectangle that isolates the sonar echo display from the screen recording. Everything outside (menus, UI) is discarded.',
                },
                {
                  term: 'Depth Max',
                  def: 'The maximum depth shown on the sonar screen, in meters. Used to calibrate the Z axis: z_spacing = depth_max / crop_height.',
                },
                {
                  term: 'Y Step',
                  def: 'The distance interval (in meters) between resampled volume slices along the GPS track. Smaller = higher resolution, larger volume.',
                },
                {
                  term: 'FPS Extraction',
                  def: 'Frames per second extracted from the video. Higher values capture more detail but increase processing time and memory.',
                },
                {
                  term: 'Downscale Factor',
                  def: 'Spatial scaling applied to each extracted frame. 0.5 = half resolution. Reduces memory usage quadratically.',
                },
                {
                  term: 'NRRD',
                  def: 'Nearly Raw Raster Data — a standard volumetric data format readable by 3D Slicer, ParaView, ITK, and other scientific visualization tools.',
                },
                {
                  term: 'Transfer Function / Preset',
                  def: 'A color and opacity mapping applied to volume intensity values. Different presets emphasize different features (water, structures, contrast).',
                },
              ].map(({ term, def }) => (
                <div key={term}>
                  <dt style={{ fontSize: '14px', fontWeight: 600, color: colors.white }}>{term}</dt>
                  <dd style={{ fontSize: '13px', color: colors.whiteDim, lineHeight: '1.6', margin: '4px 0 0 0' }}>
                    {def}
                  </dd>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: colors.primary }}>
              Volume Coordinate System
            </h2>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginBottom: '12px' }}>
              The 3D volume uses the following axes:
            </p>
            <ul style={{ color: colors.whiteDim, lineHeight: '2', fontSize: '14px', paddingLeft: '20px' }}>
              <li><strong>X</strong> — Horizontal position in the sonar image (width of the crop)</li>
              <li><strong>Y</strong> — Distance along the GPS track (meters, resampled at Y step)</li>
              <li><strong>Z</strong> — Depth (0 = surface, depth_max = bottom of display)</li>
            </ul>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px', marginTop: '12px' }}>
              Data is stored as Float32 in range [0, 1], where 0 = no echo (black) and 1 = maximum
              echo intensity (white). The array is indexed as: data[z * dimY * dimX + y * dimX + x].
            </p>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: colors.primary }}>
              Privacy & Processing
            </h2>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '14px' }}>
              All processing happens locally in your web browser. No video, GPS, or volume data
              is ever sent to a server. The application is a static site hosted on GitHub Pages.
              Your data stays on your machine.
            </p>
          </GlassPanel>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button variant="primary" onClick={() => navigate('/scan')}>
            Start Scanning
          </Button>
        </div>
      </div>
    </div>
  );
}
