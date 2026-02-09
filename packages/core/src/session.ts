/**
 * Session (project file) management.
 *
 * .echos.json files store all user settings for a scan session,
 * allowing reload without re-configuring crop, calibration, etc.
 */

import type { EchosSession, CropRect, CalibrationSettings, SyncSettings, VolumeMetadata } from './types.js';

const SESSION_VERSION = '1.0.0';

export function createSession(params: {
  videoFileName: string;
  gpxFileName: string;
  crop: CropRect;
  calibration: CalibrationSettings;
  sync: SyncSettings;
  volumeMetadata?: VolumeMetadata;
}): EchosSession {
  const now = new Date().toISOString();
  return {
    version: SESSION_VERSION,
    createdAt: now,
    updatedAt: now,
    ...params,
  };
}

export function serializeSession(session: EchosSession): string {
  return JSON.stringify(
    { ...session, updatedAt: new Date().toISOString() },
    null,
    2,
  );
}

export function deserializeSession(json: string): EchosSession {
  try {
    const obj = JSON.parse(json);

    if (!obj.version || !obj.videoFileName || !obj.gpxFileName) {
      throw new Error('Missing required fields.');
    }

    if (!obj.crop || typeof obj.crop.x !== 'number') {
      throw new Error('Invalid or missing crop settings.');
    }

    if (!obj.calibration || typeof obj.calibration.depthMaxM !== 'number') {
      throw new Error('Invalid or missing calibration settings.');
    }

    return obj as EchosSession;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('Invalid .echos.json file: not valid JSON.');
    }
    throw new Error(`Invalid .echos.json file: ${(e as Error).message}`);
  }
}

export function sessionToBlob(session: EchosSession): Blob {
  return new Blob([serializeSession(session)], { type: 'application/json' });
}
