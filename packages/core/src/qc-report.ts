/**
 * Quality Control report generator.
 */

import type { QcReport, Volume, CropRect, CalibrationSettings } from './types.js';

export function generateQcReport(params: {
  videoFile: string;
  gpxFile: string;
  videoDurationS: number;
  gpxDurationS: number;
  gpxTotalDistanceM: number;
  extractedFrames: number;
  fpsExtraction: number;
  downscaleFactor: number;
  cropRect: CropRect;
  calibration: CalibrationSettings;
  volume: Volume;
}): QcReport {
  const { volume, calibration } = params;
  const { data, metadata } = volume;

  // Compute stats
  let sum = 0;
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (data[i] > max) max = data[i];
  }
  const meanIntensity = data.length > 0 ? sum / data.length : 0;

  // Warnings
  const warnings: string[] = [];

  if (params.extractedFrames < 10) {
    warnings.push('Very few frames extracted. Consider increasing FPS or using a longer video.');
  }

  const durationRatio = Math.abs(params.videoDurationS - params.gpxDurationS);
  if (durationRatio > params.videoDurationS * 0.2) {
    warnings.push(
      `Video duration (${params.videoDurationS.toFixed(0)}s) and GPX duration (${params.gpxDurationS.toFixed(0)}s) differ by more than 20%. Check sync offset.`,
    );
  }

  const estimatedMB = (data.length * 4) / (1024 * 1024);
  if (estimatedMB > 512) {
    warnings.push(`Volume is large (${estimatedMB.toFixed(0)} MB). Export may be slow.`);
  }

  if (meanIntensity < 0.01) {
    warnings.push('Mean intensity is very low. The crop region may not contain sonar data.');
  }

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    videoFile: params.videoFile,
    gpxFile: params.gpxFile,
    videoDurationS: params.videoDurationS,
    gpxDurationS: params.gpxDurationS,
    gpxTotalDistanceM: params.gpxTotalDistanceM,
    extractedFrames: params.extractedFrames,
    fpsExtraction: params.fpsExtraction,
    downscaleFactor: params.downscaleFactor,
    cropRect: params.cropRect,
    depthMaxM: calibration.depthMaxM,
    yStepM: calibration.yStepM,
    volumeDimensions: metadata.dimensions,
    volumeSpacing: metadata.spacing,
    volumeSizeBytes: data.length * 4,
    meanIntensity,
    maxIntensity: max,
    warnings,
  };
}

export function qcReportToBlob(report: QcReport): Blob {
  return new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
}
