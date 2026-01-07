export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatBitrate(bitsPerSecond: number): string {
  if (!bitsPerSecond) return "N/A";

  const kbps = bitsPerSecond / 1000;

  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }

  return `${Math.round(kbps)} Kbps`;
}

export function formatTimeRemaining(seconds: number): string {
  if (!seconds || seconds === Infinity) return "Calcolo...";

  if (seconds < 60) {
    return `${Math.ceil(seconds)} sec`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);

  if (mins < 60) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  return `${hours}h ${remainingMins}m`;
}

export function generateOutputFilename(
  originalName: string,
  format: "mp4" | "webm"
): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  return `${nameWithoutExt}_compressed.${format}`;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
