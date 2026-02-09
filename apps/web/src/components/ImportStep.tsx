import React, { useCallback } from 'react';
import { GlassPanel, FileDropZone, Button, colors } from '@echos/ui';
import { parseGpx } from '@echos/core';
import { useAppState } from '../store/app-state.js';

export function ImportStep() {
  const { state, dispatch } = useAppState();

  const handleVideoFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4')) {
        dispatch({ type: 'SET_ERROR', error: 'Please select an MP4 video file.' });
        return;
      }

      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error('Failed to read video metadata.'));
          video.src = url;
        });

        dispatch({
          type: 'SET_VIDEO',
          file,
          durationS: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
        dispatch({ type: 'ADD_LOG', message: `Video loaded: ${file.name} (${video.videoWidth}x${video.videoHeight}, ${video.duration.toFixed(1)}s)` });
        URL.revokeObjectURL(url);
      } catch (e) {
        dispatch({ type: 'SET_ERROR', error: `Could not read video: ${(e as Error).message}` });
      }
    },
    [dispatch],
  );

  const handleGpxFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.gpx')) {
        dispatch({ type: 'SET_ERROR', error: 'Please select a GPX file (.gpx).' });
        return;
      }

      try {
        const text = await file.text();
        const track = parseGpx(text);
        dispatch({ type: 'SET_GPX', file, track });
        dispatch({
          type: 'ADD_LOG',
          message: `GPX loaded: ${file.name} (${track.points.length} points, ${track.totalDistanceM.toFixed(0)}m, ${track.durationS.toFixed(0)}s)`,
        });
      } catch (e) {
        dispatch({ type: 'SET_ERROR', error: `Could not parse GPX: ${(e as Error).message}` });
      }
    },
    [dispatch],
  );

  const handleSessionFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const { deserializeSession } = await import('@echos/core');
        const session = deserializeSession(text);
        dispatch({
          type: 'LOAD_SESSION',
          state: {
            crop: session.crop,
            calibration: session.calibration,
            sync: session.sync,
            cropConfirmed: true,
          },
        });
        dispatch({ type: 'ADD_LOG', message: `Session loaded: ${file.name}. Re-import your video and GPX files.` });
      } catch (e) {
        dispatch({ type: 'SET_ERROR', error: `Invalid session file: ${(e as Error).message}` });
      }
    },
    [dispatch],
  );

  const canProceed = state.videoFile !== null && state.gpxFile !== null;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Import Files</h2>
      <p style={{ color: colors.whiteDim, fontSize: '14px' }}>
        Drag and drop your sonar screen recording (MP4) and GPS track (GPX).
        Both files must cover the same session.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <GlassPanel padding="0">
          <FileDropZone
            accept="video/mp4,video/*"
            label={state.videoFile ? state.videoFile.name : 'Drop MP4 video'}
            hint={
              state.videoFile
                ? `${state.videoWidth}x${state.videoHeight} — ${state.videoDurationS.toFixed(1)}s`
                : 'Screen recording of your sonar display'
            }
            onFile={handleVideoFile}
            icon={<span>🎬</span>}
          />
        </GlassPanel>

        <GlassPanel padding="0">
          <FileDropZone
            accept=".gpx"
            label={state.gpxFile ? state.gpxFile.name : 'Drop GPX track'}
            hint={
              state.gpxTrack
                ? `${state.gpxTrack.points.length} pts — ${state.gpxTrack.totalDistanceM.toFixed(0)}m — ${state.gpxTrack.durationS.toFixed(0)}s`
                : 'GPS trace from your smartphone'
            }
            onFile={handleGpxFile}
            icon={<span>📍</span>}
          />
        </GlassPanel>
      </div>

      <GlassPanel padding="16px" style={{ opacity: 0.7 }}>
        <FileDropZone
          accept=".json,.echos.json"
          label="Load previous session (.echos.json)"
          hint="Optional — restores crop, calibration and sync settings"
          onFile={handleSessionFile}
          icon={<span>📂</span>}
        />
      </GlassPanel>

      {state.error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${colors.error}`,
            borderRadius: '12px',
            padding: '12px 16px',
            color: colors.error,
            fontSize: '14px',
          }}
        >
          {state.error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'SET_STEP', step: 'crop' })}
        >
          Next: Crop Region
        </Button>
      </div>
    </div>
  );
}
