export interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  duration?: number;
  width?: number;
  height?: number;
  bitrate?: number;
  previewUrl: string;
}

export interface CompressionOptions {
  compressionPercent: number; // 10-90
  outputFormat: "mp4" | "webm";
  resolution: "original" | "1080p" | "720p" | "480p";
  keepAudio: boolean;
  removeMetadata: boolean;
}

export type CompressionStatus =
  | "idle"
  | "loading-ffmpeg"
  | "analyzing"
  | "compressing"
  | "completed"
  | "error"
  | "cancelled";

export interface CompressionProgress {
  status: CompressionStatus;
  percent: number;
  timeElapsed: number;
  timeRemaining?: number;
  currentFile?: string;
  message: string;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  originalBitrate?: number;
  compressedBitrate?: number;
  spaceSaved: number;
  spaceSavedPercent: number;
  outputBlob: Blob;
  outputUrl: string;
  outputName: string;
}

export interface QueueItem {
  id: string;
  video: VideoFile;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: CompressionResult;
  error?: string;
}

export const COMPRESSION_PRESETS = {
  minimal: { label: "Minima", emoji: "🚀", value: 20 },
  low: { label: "Bassa", emoji: "⚡", value: 35 },
  medium: { label: "Media", emoji: "📱", value: 50 },
  high: { label: "Alta", emoji: "🎬", value: 70 },
  maximum: { label: "Massima", emoji: "💎", value: 90 },
} as const;

export type PresetKey = keyof typeof COMPRESSION_PRESETS;

export const SUPPORTED_FORMATS = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const MAX_QUEUE_SIZE = 10;
