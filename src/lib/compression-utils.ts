import type { CompressionOptions } from "@/types/video";

export function calculateTargetBitrate(
  originalBitrate: number,
  compressionPercent: number
): number {
  return Math.round(originalBitrate * (compressionPercent / 100));
}

export function getResolutionParams(
  resolution: CompressionOptions["resolution"]
): string[] {
  switch (resolution) {
    case "1080p":
      return ["-vf", "scale=-2:1080"];
    case "720p":
      return ["-vf", "scale=-2:720"];
    case "480p":
      return ["-vf", "scale=-2:480"];
    default:
      return [];
  }
}

export function buildFFmpegCommand(
  inputFile: string,
  outputFile: string,
  options: CompressionOptions,
  originalBitrate?: number
): string[] {
  const args: string[] = ["-i", inputFile];

  // Video codec and bitrate
  if (options.outputFormat === "webm") {
    args.push("-c:v", "libvpx-vp9");
  } else {
    args.push("-c:v", "libx264");
    args.push("-preset", "medium");
  }

  // Calculate and apply target bitrate if we have original bitrate
  if (originalBitrate) {
    const targetBitrate = calculateTargetBitrate(
      originalBitrate,
      options.compressionPercent
    );
    const bitrateK = Math.round(targetBitrate / 1000);
    args.push("-b:v", `${bitrateK}k`);
    args.push("-bufsize", `${bitrateK * 2}k`);
  } else {
    // Fallback: use CRF based on compression percent
    // Lower CRF = higher quality, range 0-51 for x264
    const crf = Math.round(51 - (options.compressionPercent / 100) * 30);
    args.push("-crf", crf.toString());
  }

  // Resolution
  const resolutionParams = getResolutionParams(options.resolution);
  args.push(...resolutionParams);

  // Audio
  if (options.keepAudio) {
    args.push("-c:a", "aac");
    args.push("-b:a", "128k");
  } else {
    args.push("-an");
  }

  // Metadata
  if (options.removeMetadata) {
    args.push("-map_metadata", "-1");
  }

  // Output format specific
  if (options.outputFormat === "mp4") {
    args.push("-movflags", "+faststart");
  }

  args.push(outputFile);

  return args;
}

export async function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Impossibile leggere i metadati del video"));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function estimateBitrate(fileSize: number, duration: number): number {
  if (!duration) return 0;
  // Return bits per second
  return (fileSize * 8) / duration;
}
