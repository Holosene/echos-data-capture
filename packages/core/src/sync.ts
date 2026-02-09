/**
 * Frame-to-GPS synchronization.
 *
 * MVP strategy: align video start/end to GPX start/end,
 * with an optional manual offset.
 *
 * Each extracted frame gets a timestamp (seconds from video start).
 * We map that into GPX elapsed time using:
 *   gpxElapsedS = (frameTimeS - offsetS) × (gpxDuration / videoDuration)
 */

import type {
  FrameMapping,
  SyncSettings,
  GpxTrack,
} from './types.js';
import { enrichTrackpoints, interpolateDistance } from './gpx-parser.js';
import type { GpxPointWithDistance } from './types.js';

export interface SyncContext {
  enrichedPoints: GpxPointWithDistance[];
  gpxDurationS: number;
  videoDurationS: number;
  offsetS: number;
}

/**
 * Create a sync context from track and settings.
 */
export function createSyncContext(
  track: GpxTrack,
  videoDurationS: number,
  sync: SyncSettings,
): SyncContext {
  const enrichedPoints = enrichTrackpoints(track);
  return {
    enrichedPoints,
    gpxDurationS: track.durationS,
    videoDurationS,
    offsetS: sync.offsetS,
  };
}

/**
 * Map a single frame to a GPS position and distance.
 */
export function mapFrameToPosition(
  ctx: SyncContext,
  frameIndex: number,
  frameTimeS: number,
): FrameMapping {
  // Linear time mapping: video time → GPX elapsed time
  const adjustedTimeS = frameTimeS - ctx.offsetS;
  const timeRatio = ctx.gpxDurationS / ctx.videoDurationS;
  const gpxElapsedS = adjustedTimeS * timeRatio;

  const { distanceM, lat, lon } = interpolateDistance(ctx.enrichedPoints, gpxElapsedS);

  return {
    frameIndex,
    timeS: frameTimeS,
    distanceM,
    lat,
    lon,
  };
}

/**
 * Map all frames to GPS positions.
 */
export function mapAllFrames(
  ctx: SyncContext,
  frameTimes: Array<{ index: number; timeS: number }>,
): FrameMapping[] {
  return frameTimes.map(({ index, timeS }) => mapFrameToPosition(ctx, index, timeS));
}

/**
 * Estimate video duration needed for a given GPS distance coverage.
 * Useful for quick preview mode.
 */
export function estimateVideoDurationForDistance(
  ctx: SyncContext,
  targetDistanceM: number,
): number {
  const totalDistance = ctx.enrichedPoints[ctx.enrichedPoints.length - 1].cumulativeDistanceM;
  const ratio = Math.min(1, targetDistanceM / totalDistance);
  return ratio * ctx.videoDurationS;
}
