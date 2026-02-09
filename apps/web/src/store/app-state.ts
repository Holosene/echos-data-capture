/**
 * Global application state (React context-based).
 *
 * Manages the full wizard flow state without external state libraries.
 */

import { createContext, useContext } from 'react';
import type {
  CropRect,
  CalibrationSettings,
  SyncSettings,
  GpxTrack,
  Volume,
  FrameMapping,
  PipelineProgress,
  QcReport,
} from '@echos/core';
import { DEFAULT_CALIBRATION } from '@echos/core';

export type WizardStep = 'home' | 'import' | 'crop' | 'calibration' | 'sync' | 'generate' | 'viewer';

export interface AppState {
  // Navigation
  currentStep: WizardStep;

  // Files
  videoFile: File | null;
  gpxFile: File | null;
  videoDurationS: number;
  videoWidth: number;
  videoHeight: number;

  // GPX
  gpxTrack: GpxTrack | null;

  // Crop
  crop: CropRect;
  cropConfirmed: boolean;

  // Calibration
  calibration: CalibrationSettings;

  // Sync
  sync: SyncSettings;

  // Processing
  quickPreview: boolean;
  processing: boolean;
  progress: PipelineProgress | null;
  logs: string[];

  // Volume
  volume: Volume | null;
  mappings: FrameMapping[];
  qcReport: QcReport | null;

  // Errors
  error: string | null;
}

export const INITIAL_STATE: AppState = {
  currentStep: 'home',
  videoFile: null,
  gpxFile: null,
  videoDurationS: 0,
  videoWidth: 0,
  videoHeight: 0,
  gpxTrack: null,
  crop: { x: 0, y: 0, width: 640, height: 480 },
  cropConfirmed: false,
  calibration: { ...DEFAULT_CALIBRATION },
  sync: { offsetS: 0, videoStartEpochMs: 0, videoEndEpochMs: 0 },
  quickPreview: false,
  processing: false,
  progress: null,
  logs: [],
  volume: null,
  mappings: [],
  qcReport: null,
  error: null,
};

export type AppAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_VIDEO'; file: File; durationS: number; width: number; height: number }
  | { type: 'SET_GPX'; file: File; track: GpxTrack }
  | { type: 'SET_CROP'; crop: CropRect }
  | { type: 'CONFIRM_CROP' }
  | { type: 'SET_CALIBRATION'; calibration: Partial<CalibrationSettings> }
  | { type: 'SET_SYNC'; sync: Partial<SyncSettings> }
  | { type: 'SET_QUICK_PREVIEW'; enabled: boolean }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_PROGRESS'; progress: PipelineProgress }
  | { type: 'ADD_LOG'; message: string }
  | { type: 'SET_VOLUME'; volume: Volume; mappings: FrameMapping[] }
  | { type: 'SET_QC_REPORT'; report: QcReport }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'FINISH_PROCESSING' }
  | { type: 'RESET' }
  | { type: 'LOAD_SESSION'; state: Partial<AppState> };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: null };
    case 'SET_VIDEO':
      return {
        ...state,
        videoFile: action.file,
        videoDurationS: action.durationS,
        videoWidth: action.width,
        videoHeight: action.height,
        crop: { x: 0, y: 0, width: action.width, height: action.height },
      };
    case 'SET_GPX':
      return { ...state, gpxFile: action.file, gpxTrack: action.track };
    case 'SET_CROP':
      return { ...state, crop: action.crop };
    case 'CONFIRM_CROP':
      return { ...state, cropConfirmed: true };
    case 'SET_CALIBRATION':
      return {
        ...state,
        calibration: { ...state.calibration, ...action.calibration },
      };
    case 'SET_SYNC':
      return { ...state, sync: { ...state.sync, ...action.sync } };
    case 'SET_QUICK_PREVIEW':
      return { ...state, quickPreview: action.enabled };
    case 'START_PROCESSING':
      return { ...state, processing: true, error: null, logs: [], progress: null };
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${action.message}`] };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume, mappings: action.mappings };
    case 'SET_QC_REPORT':
      return { ...state, qcReport: action.report };
    case 'SET_ERROR':
      return { ...state, error: action.error, processing: false };
    case 'FINISH_PROCESSING':
      return { ...state, processing: false };
    case 'RESET':
      return { ...INITIAL_STATE };
    case 'LOAD_SESSION':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue>({
  state: INITIAL_STATE,
  dispatch: () => {},
});

export function useAppState() {
  return useContext(AppContext);
}
