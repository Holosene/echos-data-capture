import React, { useCallback, useState, useRef } from 'react';
import { GlassPanel, Button, ProgressBar, colors } from '@echos/ui';
import {
  createSyncContext,
  mapAllFrames,
  buildVolume,
  generateQcReport,
  estimateVolume,
} from '@echos/core';
import type { FrameData, FrameMapping } from '@echos/core';
import { useAppState } from '../store/app-state.js';

export function GenerateStep() {
  const { state, dispatch } = useAppState();
  const [showLogs, setShowLogs] = useState(false);
  const abortRef = useRef(false);

  const totalDistM = state.gpxTrack?.totalDistanceM ?? 0;
  const est = estimateVolume(
    state.crop.width,
    state.crop.height,
    totalDistM,
    state.calibration.yStepM,
    state.calibration.downscaleFactor,
  );

  const extractFramesFromVideo = useCallback(
    async (
      videoFile: File,
      fps: number,
      maxDurationS: number | null,
      onProgress: (p: number, msg: string) => void,
    ): Promise<FrameData[]> => {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = url;
      });

      const duration = maxDurationS ?? video.duration;
      const interval = 1 / fps;
      const totalFrames = Math.floor(duration * fps);
      const { crop, calibration } = state;

      const offscreen = document.createElement('canvas');
      const targetW = Math.round(crop.width * calibration.downscaleFactor);
      const targetH = Math.round(crop.height * calibration.downscaleFactor);
      offscreen.width = targetW;
      offscreen.height = targetH;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Cannot create canvas context');

      const frames: FrameData[] = [];

      for (let i = 0; i < totalFrames; i++) {
        if (abortRef.current) break;

        const timeS = i * interval;
        video.currentTime = timeS;

        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });

        // Draw cropped, scaled frame
        ctx.drawImage(
          video,
          crop.x, crop.y, crop.width, crop.height,
          0, 0, targetW, targetH,
        );

        // Get grayscale pixels
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const gray = new Uint8Array(targetW * targetH);
        for (let p = 0; p < gray.length; p++) {
          const r = imageData.data[p * 4];
          const g = imageData.data[p * 4 + 1];
          const b = imageData.data[p * 4 + 2];
          gray[p] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        }

        frames.push({
          index: i,
          timeS,
          pixels: gray,
          width: targetW,
          height: targetH,
        });

        onProgress((i + 1) / totalFrames, `Extracting frame ${i + 1}/${totalFrames}`);
      }

      URL.revokeObjectURL(url);
      return frames;
    },
    [state],
  );

  const handleGenerate = useCallback(
    async (quickPreview: boolean) => {
      if (!state.videoFile || !state.gpxTrack) return;

      abortRef.current = false;
      dispatch({ type: 'START_PROCESSING' });
      dispatch({ type: 'SET_QUICK_PREVIEW', enabled: quickPreview });

      try {
        const maxDurationS = quickPreview ? 30 : null;

        dispatch({ type: 'ADD_LOG', message: 'Starting frame extraction...' });
        dispatch({
          type: 'SET_PROGRESS',
          progress: { stage: 'extracting', progress: 0, message: 'Preparing video...' },
        });

        // Step 1: Extract frames
        const frames = await extractFramesFromVideo(
          state.videoFile,
          state.calibration.fpsExtraction,
          maxDurationS,
          (p, msg) => {
            dispatch({
              type: 'SET_PROGRESS',
              progress: { stage: 'extracting', progress: p * 0.5, message: msg },
            });
          },
        );

        if (frames.length === 0) {
          throw new Error('No frames extracted. Check your video and crop settings.');
        }

        dispatch({ type: 'ADD_LOG', message: `Extracted ${frames.length} frames` });

        // Step 2: Map frames to GPS positions
        dispatch({
          type: 'SET_PROGRESS',
          progress: { stage: 'mapping', progress: 0.5, message: 'Mapping frames to GPS...' },
        });
        dispatch({ type: 'ADD_LOG', message: 'Mapping frames to GPS positions...' });

        const syncCtx = createSyncContext(state.gpxTrack, state.videoDurationS, state.sync);
        const frameTimes = frames.map((f) => ({ index: f.index, timeS: f.timeS }));
        const mappings: FrameMapping[] = mapAllFrames(syncCtx, frameTimes);

        dispatch({ type: 'ADD_LOG', message: `Mapped ${mappings.length} frames to positions` });

        // Step 3: Build volume
        dispatch({
          type: 'SET_PROGRESS',
          progress: { stage: 'building', progress: 0.6, message: 'Building 3D volume...' },
        });
        dispatch({ type: 'ADD_LOG', message: 'Building 3D volume...' });

        const volume = buildVolume(
          { frames, mappings, calibration: state.calibration },
          (p, msg) => {
            dispatch({
              type: 'SET_PROGRESS',
              progress: { stage: 'building', progress: 0.6 + p * 0.35, message: msg },
            });
          },
        );

        dispatch({
          type: 'ADD_LOG',
          message: `Volume built: ${volume.metadata.dimensions.join('x')} (${((volume.data.length * 4) / 1024 / 1024).toFixed(1)} MB)`,
        });

        // Step 4: Generate QC report
        const report = generateQcReport({
          videoFile: state.videoFile.name,
          gpxFile: state.gpxFile!.name,
          videoDurationS: state.videoDurationS,
          gpxDurationS: state.gpxTrack.durationS,
          gpxTotalDistanceM: state.gpxTrack.totalDistanceM,
          extractedFrames: frames.length,
          fpsExtraction: state.calibration.fpsExtraction,
          downscaleFactor: state.calibration.downscaleFactor,
          cropRect: state.crop,
          calibration: state.calibration,
          volume,
        });

        dispatch({ type: 'SET_VOLUME', volume, mappings });
        dispatch({ type: 'SET_QC_REPORT', report });
        dispatch({
          type: 'SET_PROGRESS',
          progress: { stage: 'done', progress: 1, message: 'Volume generation complete!' },
        });
        dispatch({ type: 'ADD_LOG', message: 'Generation complete!' });
        dispatch({ type: 'FINISH_PROCESSING' });

        if (report.warnings.length > 0) {
          dispatch({ type: 'ADD_LOG', message: `Warnings: ${report.warnings.join('; ')}` });
        }
      } catch (e) {
        const msg = (e as Error).message || 'Unknown error during processing';
        dispatch({ type: 'SET_ERROR', error: msg });
        dispatch({ type: 'ADD_LOG', message: `ERROR: ${msg}` });
      }
    },
    [state, dispatch, extractFramesFromVideo],
  );

  const isComplete = state.progress?.stage === 'done';

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Generate Volume</h2>

      <GlassPanel padding="16px">
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, marginBottom: '12px' }}>
          Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
          <div>
            <span style={{ color: colors.whiteMuted }}>Estimated size: </span>
            <span style={{ fontWeight: 600 }}>{est.estimatedMB.toFixed(0)} MB</span>
          </div>
          <div>
            <span style={{ color: colors.whiteMuted }}>Frames: </span>
            <span style={{ fontWeight: 600 }}>
              ~{Math.floor((state.videoDurationS) * state.calibration.fpsExtraction)}
            </span>
          </div>
          <div>
            <span style={{ color: colors.whiteMuted }}>Volume: </span>
            <span style={{ fontWeight: 600 }}>{est.dimX}x{est.dimY}x{est.dimZ}</span>
          </div>
        </div>
      </GlassPanel>

      {!state.processing && !isComplete && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="secondary" size="lg" onClick={() => handleGenerate(true)}>
            Quick Preview (30s)
          </Button>
          <Button variant="primary" size="lg" onClick={() => handleGenerate(false)}>
            Full Generation
          </Button>
        </div>
      )}

      {(state.processing || isComplete) && state.progress && (
        <GlassPanel>
          <ProgressBar
            value={state.progress.progress}
            label={state.progress.message}
          />
          <div
            style={{
              marginTop: '16px',
              fontSize: '13px',
              color: state.progress.stage === 'done' ? colors.success : colors.whiteDim,
              fontWeight: state.progress.stage === 'done' ? 600 : 400,
            }}
          >
            {state.progress.stage === 'done' ? 'Volume ready!' : state.progress.message}
          </div>
        </GlassPanel>
      )}

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

      {/* Collapsible logs */}
      {state.logs.length > 0 && (
        <GlassPanel padding="12px">
          <button
            onClick={() => setShowLogs(!showLogs)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.whiteMuted,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
            }}
          >
            <span style={{ transform: showLogs ? 'rotate(90deg)' : 'none', transition: '150ms ease' }}>
              ▶
            </span>
            Processing Logs ({state.logs.length})
          </button>
          {showLogs && (
            <pre
              style={{
                marginTop: '8px',
                padding: '12px',
                background: colors.black,
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: colors.whiteDim,
                maxHeight: '200px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
              }}
            >
              {state.logs.join('\n')}
            </pre>
          )}
        </GlassPanel>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="ghost"
          disabled={state.processing}
          onClick={() => dispatch({ type: 'SET_STEP', step: 'sync' })}
        >
          Back
        </Button>
        {isComplete && (
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'SET_STEP', step: 'viewer' })}
          >
            Open Viewer
          </Button>
        )}
      </div>
    </div>
  );
}
