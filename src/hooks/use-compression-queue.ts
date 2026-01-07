"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useFFmpeg } from "./use-ffmpeg";
import { useWebCodecs, checkWebCodecsSupport } from "./use-webcodecs";
import {
  buildFFmpegCommand,
  getVideoMetadata,
  estimateBitrate,
  calculateTargetBitrate,
} from "@/lib/compression-utils";
import {
  generateOutputFilename,
  generateUniqueId,
} from "@/lib/format-utils";
import type {
  VideoFile,
  CompressionOptions,
  CompressionResult,
  QueueItem,
} from "@/types/video";

const DEFAULT_OPTIONS: CompressionOptions = {
  compressionPercent: 35,
  outputFormat: "mp4",
  resolution: "original",
  keepAudio: true,
  removeMetadata: false,
};

type CompressionEngine = "webcodecs" | "ffmpeg";

export function useCompressionQueue() {
  const { load, transcode, loaded, loading, error, supported: ffmpegSupported } = useFFmpeg();
  const { compressVideo: webCodecsCompress, supported: webCodecsSupported } = useWebCodecs();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [options, setOptions] = useState<CompressionOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [engine, setEngine] = useState<CompressionEngine>("webcodecs");
  const cancelledRef = useRef(false);

  // Determine best available engine on mount
  useEffect(() => {
    if (checkWebCodecsSupport()) {
      setEngine("webcodecs");
      console.log("Usando WebCodecs API (veloce)");
    } else {
      setEngine("ffmpeg");
      console.log("WebCodecs non supportato, usando FFmpeg.wasm (lento)");
    }
  }, []);

  const addVideos = useCallback(async (files: File[]) => {
    const newItems: QueueItem[] = await Promise.all(
      files.map(async (file) => {
        const id = generateUniqueId();
        let metadata = { duration: 0, width: 0, height: 0 };

        try {
          metadata = await getVideoMetadata(file);
        } catch {
          // Ignore metadata errors
        }

        const video: VideoFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          previewUrl: URL.createObjectURL(file),
        };

        return {
          id,
          video,
          status: "pending" as const,
          progress: 0,
        };
      })
    );

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.video.previewUrl) {
        URL.revokeObjectURL(item.video.previewUrl);
      }
      if (item?.result?.outputUrl) {
        URL.revokeObjectURL(item.result.outputUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.video.previewUrl) {
        URL.revokeObjectURL(item.video.previewUrl);
      }
      if (item.result?.outputUrl) {
        URL.revokeObjectURL(item.result.outputUrl);
      }
    });
    setQueue([]);
  }, [queue]);

  // WebCodecs compression
  const compressWithWebCodecs = useCallback(
    async (item: QueueItem): Promise<CompressionResult | null> => {
      const bitrate = estimateBitrate(item.video.size, item.video.duration || 0);
      const targetBitrate = calculateTargetBitrate(bitrate, options.compressionPercent);

      const result = await webCodecsCompress(
        item.video.file,
        {
          targetBitrate,
          outputFormat: options.outputFormat,
          resolution: options.resolution,
          keepAudio: options.keepAudio,
        },
        (percent) => {
          setCurrentProgress(percent);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, progress: percent } : q
            )
          );
        }
      );

      if (!result) return null;

      const outputUrl = URL.createObjectURL(result.blob);

      return {
        originalSize: item.video.size,
        compressedSize: result.blob.size,
        originalBitrate: bitrate,
        compressedBitrate: estimateBitrate(result.blob.size, item.video.duration || 0),
        spaceSaved: item.video.size - result.blob.size,
        spaceSavedPercent: Math.round(
          ((item.video.size - result.blob.size) / item.video.size) * 100
        ),
        outputBlob: result.blob,
        outputUrl,
        outputName: result.outputName,
      };
    },
    [webCodecsCompress, options]
  );

  // FFmpeg compression (fallback)
  const compressWithFFmpeg = useCallback(
    async (item: QueueItem): Promise<CompressionResult | null> => {
      const bitrate = estimateBitrate(item.video.size, item.video.duration || 0);
      const outputName = generateOutputFilename(item.video.name, options.outputFormat);
      const args = buildFFmpegCommand("input.mp4", outputName, options, bitrate);

      const outputData = await transcode(
        item.video.file,
        outputName,
        args,
        (percent) => {
          setCurrentProgress(percent);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, progress: percent } : q
            )
          );
        }
      );

      // Create new ArrayBuffer from Uint8Array for Blob compatibility
      const buffer = new ArrayBuffer(outputData.length);
      new Uint8Array(buffer).set(outputData);

      const outputBlob = new Blob([buffer], {
        type: options.outputFormat === "mp4" ? "video/mp4" : "video/webm",
      });
      const outputUrl = URL.createObjectURL(outputBlob);

      return {
        originalSize: item.video.size,
        compressedSize: outputBlob.size,
        originalBitrate: bitrate,
        compressedBitrate: estimateBitrate(outputBlob.size, item.video.duration || 0),
        spaceSaved: item.video.size - outputBlob.size,
        spaceSavedPercent: Math.round(
          ((item.video.size - outputBlob.size) / item.video.size) * 100
        ),
        outputBlob,
        outputUrl,
        outputName,
      };
    },
    [transcode, options]
  );

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    cancelledRef.current = false;
    setIsProcessing(true);

    const useWebCodecs = engine === "webcodecs" && checkWebCodecsSupport();

    try {
      // Load FFmpeg if using FFmpeg engine
      if (!useWebCodecs && !loaded) {
        setCurrentStatus("Caricamento FFmpeg...");
        await load();
      }

      // Process each video in queue
      for (let i = 0; i < queue.length; i++) {
        if (cancelledRef.current) break;

        const item = queue[i];
        if (item.status !== "pending") continue;

        // Update status to processing
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "processing" as const } : q
          )
        );

        const engineLabel = useWebCodecs ? "WebCodecs" : "FFmpeg";
        setCurrentStatus(`Compressione ${item.video.name} (${engineLabel})...`);

        try {
          let result: CompressionResult | null;

          if (useWebCodecs) {
            result = await compressWithWebCodecs(item);
          } else {
            result = await compressWithFFmpeg(item);
          }

          if (cancelledRef.current || !result) break;

          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "completed" as const, progress: 100, result }
                : q
            )
          );
        } catch (err) {
          console.error("Compression error:", err);

          // If WebCodecs fails, try FFmpeg as fallback
          if (useWebCodecs && ffmpegSupported) {
            console.log("WebCodecs fallito, provo con FFmpeg...");
            setCurrentStatus(`Fallback FFmpeg per ${item.video.name}...`);

            try {
              if (!loaded) {
                await load();
              }
              const result = await compressWithFFmpeg(item);
              if (result) {
                setQueue((prev) =>
                  prev.map((q) =>
                    q.id === item.id
                      ? { ...q, status: "completed" as const, progress: 100, result }
                      : q
                  )
                );
                continue;
              }
            } catch (fallbackErr) {
              console.error("FFmpeg fallback failed:", fallbackErr);
            }
          }

          const errorMessage =
            err instanceof Error ? err.message : "Errore compressione";
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "error" as const, error: errorMessage }
                : q
            )
          );
        }
      }
    } catch (err) {
      console.error("Queue processing error:", err);
    } finally {
      setIsProcessing(false);
      setCurrentProgress(0);
      setCurrentStatus("");
    }
  }, [
    isProcessing,
    queue,
    engine,
    loaded,
    load,
    ffmpegSupported,
    compressWithWebCodecs,
    compressWithFFmpeg,
  ]);

  const cancelProcessing = useCallback(() => {
    cancelledRef.current = true;
    setIsProcessing(false);
    setCurrentProgress(0);
    setCurrentStatus("Annullato");
  }, []);

  const downloadAll = useCallback(async () => {
    const completedItems = queue.filter(
      (item) => item.status === "completed" && item.result
    );

    if (completedItems.length === 0) return;

    if (completedItems.length === 1) {
      // Single file download
      const item = completedItems[0];
      if (item.result) {
        const link = document.createElement("a");
        link.href = item.result.outputUrl;
        link.download = item.result.outputName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // Download each file individually
      for (const item of completedItems) {
        if (item.result) {
          const link = document.createElement("a");
          link.href = item.result.outputUrl;
          link.download = item.result.outputName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }, [queue]);

  const updateOptions = useCallback(
    (newOptions: Partial<CompressionOptions>) => {
      setOptions((prev) => ({ ...prev, ...newOptions }));
    },
    []
  );

  const switchEngine = useCallback((newEngine: CompressionEngine) => {
    if (newEngine === "webcodecs" && !checkWebCodecsSupport()) {
      console.warn("WebCodecs non supportato");
      return;
    }
    setEngine(newEngine);
  }, []);

  const totalStats = queue.reduce(
    (acc, item) => {
      if (item.result) {
        acc.originalSize += item.result.originalSize;
        acc.compressedSize += item.result.compressedSize;
        acc.spaceSaved += item.result.spaceSaved;
      }
      return acc;
    },
    { originalSize: 0, compressedSize: 0, spaceSaved: 0 }
  );

  return {
    queue,
    options,
    isProcessing,
    currentProgress,
    currentStatus,
    engine,
    switchEngine,
    webCodecsSupported: checkWebCodecsSupport(),
    ffmpegLoading: loading,
    ffmpegError: error,
    ffmpegSupported,
    addVideos,
    removeFromQueue,
    clearQueue,
    processQueue,
    cancelProcessing,
    downloadAll,
    updateOptions,
    totalStats,
    completedCount: queue.filter((q) => q.status === "completed").length,
    pendingCount: queue.filter((q) => q.status === "pending").length,
  };
}
