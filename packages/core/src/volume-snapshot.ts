/**
 * ECOS — Volume Snapshot (.echos-vol)
 *
 * Binary format for saving/loading pre-computed volumes.
 *
 * V1 Layout (uncompressed Float32):
 *   Bytes  0– 3: magic "EVOL" (4 bytes)
 *   Bytes  4– 7: version uint32 = 1
 *   Bytes  8–11: dimX uint32
 *   Bytes 12–15: dimY uint32
 *   Bytes 16–19: dimZ uint32
 *   Bytes 20–23: extentX float32
 *   Bytes 24–27: extentY float32
 *   Bytes 28–31: extentZ float32
 *   Bytes 32–39: reserved (8 bytes, zeroed)
 *   Bytes 40+  : Float32Array voxel data (dimX × dimY × dimZ × 4 bytes)
 *
 * V2 Layout (quantized Uint16 + deflate compressed):
 *   Bytes  0– 3: magic "EVOL" (4 bytes)
 *   Bytes  4– 7: version uint32 = 2
 *   Bytes  8–11: dimX uint32
 *   Bytes 12–15: dimY uint32
 *   Bytes 16–19: dimZ uint32
 *   Bytes 20–23: extentX float32
 *   Bytes 24–27: extentY float32
 *   Bytes 28–31: extentZ float32
 *   Bytes 32–35: minVal float32  (quantization range min)
 *   Bytes 36–39: maxVal float32  (quantization range max)
 *   Bytes 40+  : deflate-compressed Uint16Array voxel data
 *
 * V2 is ~5-10x smaller than V1 with negligible quality loss.
 * deserializeVolume reads both V1 and V2 transparently.
 */

import { deflateSync, inflateSync } from 'fflate';

const MAGIC = 0x4C4F5645; // "EVOL" in little-endian
const HEADER_SIZE = 40;

export interface VolumeSnapshot {
  data: Float32Array;
  dimensions: [number, number, number];
  extent: [number, number, number];
}

/**
 * Serialize a volume to compressed binary (V2 format).
 * Quantizes Float32 → Uint16 + deflate compression.
 * Typical compression: 5-10x smaller than V1.
 */
export function serializeVolume(snap: VolumeSnapshot): ArrayBuffer {
  const [dimX, dimY, dimZ] = snap.dimensions;
  const voxelCount = dimX * dimY * dimZ;

  // Find data range for quantization
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < voxelCount; i++) {
    const v = snap.data[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  if (!isFinite(minVal)) minVal = 0;
  if (!isFinite(maxVal)) maxVal = 1;
  if (maxVal === minVal) maxVal = minVal + 1; // avoid division by zero

  // Quantize Float32 → Uint16 (0–65535)
  const range = maxVal - minVal;
  const uint16Data = new Uint16Array(voxelCount);
  for (let i = 0; i < voxelCount; i++) {
    const normalized = (snap.data[i] - minVal) / range;
    uint16Data[i] = Math.round(Math.max(0, Math.min(65535, normalized * 65535)));
  }

  // Compress with deflate
  const compressed = deflateSync(new Uint8Array(uint16Data.buffer), { level: 6 });

  // Build final buffer: header (40 bytes) + compressed data
  const totalBytes = HEADER_SIZE + compressed.length;
  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);

  // Header
  view.setUint32(0, MAGIC, true);
  view.setUint32(4, 2, true); // version 2
  view.setUint32(8, dimX, true);
  view.setUint32(12, dimY, true);
  view.setUint32(16, dimZ, true);
  view.setFloat32(20, snap.extent[0], true);
  view.setFloat32(24, snap.extent[1], true);
  view.setFloat32(28, snap.extent[2], true);
  // V2: store quantization range instead of reserved zeros
  view.setFloat32(32, minVal, true);
  view.setFloat32(36, maxVal, true);

  // Compressed voxel data
  new Uint8Array(buffer, HEADER_SIZE).set(compressed);

  return buffer;
}

/**
 * Serialize using the old V1 format (uncompressed Float32).
 * Kept for backward compatibility and IndexedDB storage where compression
 * is not needed (browser storage has no size constraint like git).
 */
export function serializeVolumeV1(snap: VolumeSnapshot): ArrayBuffer {
  const [dimX, dimY, dimZ] = snap.dimensions;
  const voxelCount = dimX * dimY * dimZ;
  const totalBytes = HEADER_SIZE + voxelCount * 4;
  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, 1, true);
  view.setUint32(8, dimX, true);
  view.setUint32(12, dimY, true);
  view.setUint32(16, dimZ, true);
  view.setFloat32(20, snap.extent[0], true);
  view.setFloat32(24, snap.extent[1], true);
  view.setFloat32(28, snap.extent[2], true);

  const dst = new Float32Array(buffer, HEADER_SIZE, voxelCount);
  dst.set(snap.data.subarray(0, voxelCount));

  return buffer;
}

/** Deserialize a .echos-vol binary buffer (V1 or V2) back to volume data. */
export function deserializeVolume(buffer: ArrayBuffer): VolumeSnapshot {
  if (buffer.byteLength < HEADER_SIZE) {
    throw new Error('Invalid .echos-vol file: too small');
  }

  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  if (magic !== MAGIC) {
    throw new Error('Invalid .echos-vol file: bad magic number');
  }

  const version = view.getUint32(4, true);
  if (version > 2) {
    throw new Error(`Unsupported .echos-vol version: ${version} (max supported: 2)`);
  }

  const dimX = view.getUint32(8, true);
  const dimY = view.getUint32(12, true);
  const dimZ = view.getUint32(16, true);
  const extentX = view.getFloat32(20, true);
  const extentY = view.getFloat32(24, true);
  const extentZ = view.getFloat32(28, true);

  const voxelCount = dimX * dimY * dimZ;

  if (version === 1) {
    // V1: uncompressed Float32
    const expectedSize = HEADER_SIZE + voxelCount * 4;
    if (buffer.byteLength < expectedSize) {
      throw new Error(
        `Invalid .echos-vol V1 file: expected ${expectedSize} bytes, got ${buffer.byteLength}`,
      );
    }
    const data = new Float32Array(buffer.slice(HEADER_SIZE, HEADER_SIZE + voxelCount * 4));
    return { data, dimensions: [dimX, dimY, dimZ], extent: [extentX, extentY, extentZ] };
  }

  // V2: quantized Uint16 + deflate compressed
  const minVal = view.getFloat32(32, true);
  const maxVal = view.getFloat32(36, true);
  const range = maxVal - minVal;

  const compressedData = new Uint8Array(buffer, HEADER_SIZE);
  const decompressed = inflateSync(compressedData);
  const uint16Data = new Uint16Array(decompressed.buffer, decompressed.byteOffset, voxelCount);

  // Dequantize Uint16 → Float32
  const data = new Float32Array(voxelCount);
  for (let i = 0; i < voxelCount; i++) {
    data[i] = (uint16Data[i] / 65535) * range + minVal;
  }

  return { data, dimensions: [dimX, dimY, dimZ], extent: [extentX, extentY, extentZ] };
}

/** Create a Blob from a serialized volume (for download). */
export function volumeSnapshotToBlob(snap: VolumeSnapshot): Blob {
  return new Blob([serializeVolume(snap)], { type: 'application/octet-stream' });
}
