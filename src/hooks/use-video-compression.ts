"use client";

import { useState, useCallback, useRef } from "react";
import { useFFmpeg } from "./use-ffmpeg";
import {
  buildFFmpegCommand,
  getVideoMetadata,
  estimateBitrate,
} from "@/lib/compression-utils";
import {
  generateOutputFilename,
  generateUniqueId,
} from "@/lib/format-utils";
import type {
  VideoFile,
  CompressionOptions,
  CompressionProgress,
  CompressionResult,
} from "@/types/video";

const DEFAULT_OPTIONS: CompressionOptions = {
  compressionPercent: 35,
  outputFormat: "mp4",
  resolution: "original",
  keepAudio: true,
  removeMetadata: false,
};

export function useVideoCompression() {
  const { load, transcode, loaded, loading, error, supported } = useFFmpeg();
  const [progress, setProgress] = useState<CompressionProgress>({
    status: "idle",
    percent: 0,
    timeElapsed: 0,
    message: "",
  });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [options, setOptions] = useState<CompressionOptions>(DEFAULT_OPTIONS);
  const cancelledRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const compress = useCallback(
    async (video: VideoFile): Promise<CompressionResult | null> => {
      cancelledRef.current = false;
      startTimeRef.current = Date.now();
      setResult(null);

      try {
        // Load FFmpeg if not already loaded
        if (!loaded) {
          setProgress({
            status: "loading-ffmpeg",
            percent: 0,
            timeElapsed: 0,
            message: "Caricamento FFmpeg...",
          });
          await load();
        }

        if (cancelledRef.current) return null;

        // Analyze video
        setProgress({
          status: "analyzing",
          percent: 0,
          timeElapsed: 0,
          message: "Analisi video...",
        });

        const metadata = await getVideoMetadata(video.file);
        const bitrate = estimateBitrate(video.size, metadata.duration);

        if (cancelledRef.current) return null;

        // Start compression
        setProgress({
          status: "compressing",
          percent: 0,
          timeElapsed: 0,
          message: "Compressione in corso...",
        });

        const outputName = generateOutputFilename(video.name, options.outputFormat);
        const args = buildFFmpegCommand(
          "input.mp4", // Will be replaced in transcode
          outputName,
          options,
          bitrate
        );

        const outputData = await transcode(
          video.file,
          outputName,
          args,
          (percent) => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining =
              percent > 0 ? (elapsed / percent) * (100 - percent) : undefined;

            setProgress({
              status: "compressing",
              percent,
              timeElapsed: elapsed,
              timeRemaining: remaining,
              currentFile: video.name,
              message: `Compressione in corso... ${percent}%`,
            });
          }
        );

        if (cancelledRef.current) return null;

        // Create new ArrayBuffer from Uint8Array for Blob compatibility
        const buffer = new ArrayBuffer(outputData.length);
        new Uint8Array(buffer).set(outputData);

        // Create result
        const outputBlob = new Blob([buffer], {
          type: options.outputFormat === "mp4" ? "video/mp4" : "video/webm",
        });
        const outputUrl = URL.createObjectURL(outputBlob);

        const compressionResult: CompressionResult = {
          originalSize: video.size,
          compressedSize: outputBlob.size,
          originalBitrate: bitrate,
          compressedBitrate: estimateBitrate(outputBlob.size, metadata.duration),
          spaceSaved: video.size - outputBlob.size,
          spaceSavedPercent: Math.round(
            ((video.size - outputBlob.size) / video.size) * 100
          ),
          outputBlob,
          outputUrl,
          outputName,
        };

        setResult(compressionResult);
        setProgress({
          status: "completed",
          percent: 100,
          timeElapsed: (Date.now() - startTimeRef.current) / 1000,
          message: "Completato!",
        });

        return compressionResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Errore durante la compressione";
        setProgress({
          status: "error",
          percent: 0,
          timeElapsed: (Date.now() - startTimeRef.current) / 1000,
          message: errorMessage,
        });
        return null;
      }
    },
    [loaded, load, transcode, options]
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setProgress({
      status: "cancelled",
      percent: 0,
      timeElapsed: (Date.now() - startTimeRef.current) / 1000,
      message: "Compressione annullata",
    });
  }, []);

  const reset = useCallback(() => {
    if (result?.outputUrl) {
      URL.revokeObjectURL(result.outputUrl);
    }
    setResult(null);
    setProgress({
      status: "idle",
      percent: 0,
      timeElapsed: 0,
      message: "",
    });
  }, [result]);

  const updateOptions = useCallback(
    (newOptions: Partial<CompressionOptions>) => {
      setOptions((prev) => ({ ...prev, ...newOptions }));
    },
    []
  );

  return {
    compress,
    cancel,
    reset,
    progress,
    result,
    options,
    updateOptions,
    ffmpegLoading: loading,
    ffmpegError: error,
    ffmpegSupported: supported,
  };
}

// Hook for file drop handling with proper counter-based tracking
export function useFileDrop(onFilesAccepted: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current++;

    // Only set dragging on first enter
    if (dragCounterRef.current === 1) {
      // Check if dragging files (not text or other data)
      if (e.dataTransfer.types.includes("Files")) {
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;

    // Only set not dragging when counter reaches 0
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Set dropEffect to show it's a valid drop target
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Reset counter and state
      dragCounterRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesAccepted(files);
      }
    },
    [onFilesAccepted]
  );

  // Reset function for edge cases
  const resetDrag = useCallback(() => {
    dragCounterRef.current = 0;
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetDrag,
  };
}
