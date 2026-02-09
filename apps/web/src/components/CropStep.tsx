import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GlassPanel, Button, colors } from '@echos/ui';
import type { CropRect } from '@echos/core';
import { useAppState } from '../store/app-state.js';

export function CropStep() {
  const { state, dispatch } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameReady, setFrameReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [localCrop, setLocalCrop] = useState<CropRect>(state.crop);
  const [scale, setScale] = useState(1);

  // Grab a frame from the video for preview
  useEffect(() => {
    if (!state.videoFile) return;
    const url = URL.createObjectURL(state.videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(2, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = containerRef.current;
      const maxW = container ? container.clientWidth - 40 : 800;
      const s = Math.min(1, maxW / video.videoWidth);
      setScale(s);

      canvas.width = video.videoWidth * s;
      canvas.height = video.videoHeight * s;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      setFrameReady(true);
      URL.revokeObjectURL(url);
    };

    video.src = url;
    return () => URL.revokeObjectURL(url);
  }, [state.videoFile]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.round((e.clientX - rect.left) / scale),
        y: Math.round((e.clientY - rect.top) / scale),
      };
    },
    [scale],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const coords = getCanvasCoords(e);
      setDragStart(coords);
      setDragging(true);
    },
    [getCanvasCoords],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !dragStart) return;
      const coords = getCanvasCoords(e);
      const x = Math.min(dragStart.x, coords.x);
      const y = Math.min(dragStart.y, coords.y);
      const w = Math.abs(coords.x - dragStart.x);
      const h = Math.abs(coords.y - dragStart.y);
      setLocalCrop({ x, y, width: Math.max(10, w), height: Math.max(10, h) });
    },
    [dragging, dragStart, getCanvasCoords],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragStart(null);
  }, []);

  // Draw crop overlay
  useEffect(() => {
    if (!frameReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Re-grab frame and draw overlay
    if (!state.videoFile) return;
    const url = URL.createObjectURL(state.videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(2, video.duration / 2);
    };

    video.onseeked = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Dark overlay outside crop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop area
      const cx = localCrop.x * scale;
      const cy = localCrop.y * scale;
      const cw = localCrop.width * scale;
      const ch = localCrop.height * scale;
      ctx.clearRect(cx, cy, cw, ch);
      ctx.drawImage(
        video,
        localCrop.x, localCrop.y, localCrop.width, localCrop.height,
        cx, cy, cw, ch,
      );

      // Crop border
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cx, cy, cw, ch);
      ctx.setLineDash([]);

      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = colors.primary;
      for (const [hx, hy] of [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]]) {
        ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
      }

      URL.revokeObjectURL(url);
    };

    video.src = url;
    return () => URL.revokeObjectURL(url);
  }, [frameReady, localCrop, scale, state.videoFile]);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Crop Sonar Region</h2>
      <p style={{ color: colors.whiteDim, fontSize: '14px' }}>
        Draw a rectangle over the sonar display area. Exclude menus, sidebars, and decorations.
        Only the echo/depth data should be inside the crop.
      </p>

      <GlassPanel padding="20px">
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            cursor: dragging ? 'crosshair' : 'crosshair',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ borderRadius: '8px', maxWidth: '100%' }}
          />
          {!frameReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.whiteMuted,
              }}
            >
              Loading video frame...
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
        >
          {[
            { label: 'X', value: localCrop.x },
            { label: 'Y', value: localCrop.y },
            { label: 'Width', value: localCrop.width },
            { label: 'Height', value: localCrop.height },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: colors.whiteMuted, marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: colors.primary, fontVariantNumeric: 'tabular-nums' }}>
                {value}px
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {state.error && (
        <div style={{ color: colors.error, fontSize: '14px', padding: '8px' }}>{state.error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'import' })}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={localCrop.width < 20 || localCrop.height < 20}
          onClick={() => {
            dispatch({ type: 'SET_CROP', crop: localCrop });
            dispatch({ type: 'CONFIRM_CROP' });
            dispatch({ type: 'SET_STEP', step: 'calibration' });
          }}
        >
          Confirm Crop
        </Button>
      </div>
    </div>
  );
}
