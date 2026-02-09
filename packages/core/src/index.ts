/**
 * @echos/core — Main entry point
 */

// Types
export type {
  GpxTrackpoint,
  GpxTrack,
  GpxPointWithDistance,
  CropRect,
  CalibrationSettings,
  SyncSettings,
  FrameData,
  FrameMapping,
  VolumeMetadata,
  Volume,
  EchosSession,
  QcReport,
  PipelineStage,
  PipelineProgress,
  ProcessingConfig,
} from './types.js';

export { DEFAULT_CALIBRATION, DEFAULT_PROCESSING_CONFIG } from './types.js';

// Haversine
export { haversineDistance, cumulativeDistances } from './haversine.js';

// GPX
export { parseGpx, enrichTrackpoints, interpolateDistance } from './gpx-parser.js';

// Sync
export { createSyncContext, mapFrameToPosition, mapAllFrames } from './sync.js';
export type { SyncContext } from './sync.js';

// Volume
export { buildVolume, estimateVolume } from './volume-builder.js';
export type { VolumeBuilderInput } from './volume-builder.js';

// NRRD
export { encodeNrrd, nrrdToBlob } from './nrrd-export.js';

// Session
export { createSession, serializeSession, deserializeSession, sessionToBlob } from './session.js';

// QC Report
export { generateQcReport, qcReportToBlob } from './qc-report.js';
