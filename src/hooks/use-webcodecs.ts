"use client";

import { useState, useCallback, useRef } from "react";
import { Muxer as MP4Muxer, ArrayBufferTarget } from "mp4-muxer";
import { Muxer as WebMMuxer, ArrayBufferTarget as WebMArrayBufferTarget } from "webm-muxer";

// Check WebCodecs support
export function checkWebCodecsSupport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof VideoEncoder !== "undefined" &&
    typeof VideoDecoder !== "undefined" &&
    typeof VideoFrame !== "undefined"
  );
}

interface CompressionConfig {
  targetBitrate: number; // in bps
  outputFormat: "mp4" | "webm";
  resolution?: "original" | "1080p" | "720p" | "480p";
  keepAudio: boolean;
}

interface WebCodecsState {
  supported: boolean;
  processing: boolean;
  progress: number;
  error: string | null;
}

// Resolution map
const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 854, height: 480 },
};

export function useWebCodecs() {
  const [state, setState] = useState<WebCodecsState>({
    supported: typeof window !== "undefined" ? checkWebCodecsSupport() : false,
    processing: false,
    progress: 0,
    error: null,
  });

  const cancelledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const compressVideo = useCallback(
    async (
      file: File,
      config: CompressionConfig,
      onProgress?: (progress: number) => void
    ): Promise<{ blob: Blob; outputName: string } | null> => {
      if (!checkWebCodecsSupport()) {
        throw new Error("WebCodecs non supportato in questo browser");
      }

      cancelledRef.current = false;
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        processing: true,
        progress: 0,
        error: null,
      }));

      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        onProgress?.(5);
        setState((prev) => ({ ...prev, progress: 5 }));

        // Create video element to extract frames
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Errore caricamento video"));
          video.src = videoUrl;
        });

        // Get video properties
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;
        const duration = video.duration;
        const frameRate = 30; // Default to 30fps, could be detected

        // Calculate target dimensions
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (config.resolution && config.resolution !== "original") {
          const targetRes = RESOLUTION_MAP[config.resolution];
          if (targetRes) {
            // Maintain aspect ratio
            const aspectRatio = originalWidth / originalHeight;
            if (aspectRatio > targetRes.width / targetRes.height) {
              targetWidth = targetRes.width;
              targetHeight = Math.round(targetRes.width / aspectRatio);
            } else {
              targetHeight = targetRes.height;
              targetWidth = Math.round(targetRes.height * aspectRatio);
            }
            // Ensure even dimensions (required by most codecs)
            targetWidth = Math.round(targetWidth / 2) * 2;
            targetHeight = Math.round(targetHeight / 2) * 2;
          }
        }

        console.log(`Compressione: ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight}`);
        console.log(`Bitrate target: ${Math.round(config.targetBitrate / 1000)} kbps`);

        onProgress?.(10);
        setState((prev) => ({ ...prev, progress: 10 }));

        // Setup muxer based on output format
        const isMP4 = config.outputFormat === "mp4";
        let muxer: MP4Muxer<ArrayBufferTarget> | WebMMuxer<WebMArrayBufferTarget>;
        let videoTrack: { id: number } | undefined;

        if (isMP4) {
          muxer = new MP4Muxer({
            target: new ArrayBufferTarget(),
            video: {
              codec: "avc",
              width: targetWidth,
              height: targetHeight,
            },
            fastStart: "in-memory",
          });
        } else {
          muxer = new WebMMuxer({
            target: new WebMArrayBufferTarget(),
            video: {
              codec: "V_VP9",
              width: targetWidth,
              height: targetHeight,
            },
          });
        }

        // Create video encoder
        const encodedChunks: EncodedVideoChunk[] = [];
        const encoder = new VideoEncoder({
          output: (chunk, metadata) => {
            if (isMP4) {
              (muxer as MP4Muxer<ArrayBufferTarget>).addVideoChunk(chunk, metadata);
            } else {
              (muxer as WebMMuxer<WebMArrayBufferTarget>).addVideoChunk(chunk, metadata);
            }
          },
          error: (e) => {
            console.error("Encoder error:", e);
            throw e;
          },
        });

        // Configure encoder
        const codecString = isMP4 ? "avc1.640028" : "vp09.00.10.08";

        await encoder.configure({
          codec: codecString,
          width: targetWidth,
          height: targetHeight,
          bitrate: config.targetBitrate,
          framerate: frameRate,
          latencyMode: "quality",
          bitrateMode: "variable",
        });

        // Create canvas for frame capture
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        // Process video frame by frame
        const totalFrames = Math.ceil(duration * frameRate);
        const frameInterval = 1 / frameRate;
        let processedFrames = 0;

        // Use requestVideoFrameCallback for more accurate frame timing if available
        video.currentTime = 0;

        for (let time = 0; time < duration; time += frameInterval) {
          if (cancelledRef.current) {
            encoder.close();
            URL.revokeObjectURL(videoUrl);
            return null;
          }

          // Seek to frame
          video.currentTime = time;
          await new Promise<void>((resolve) => {
            video.onseeked = () => resolve();
          });

          // Draw frame to canvas
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          // Create VideoFrame
          const frame = new VideoFrame(canvas, {
            timestamp: time * 1_000_000, // microseconds
            duration: frameInterval * 1_000_000,
          });

          // Encode frame
          const keyFrame = processedFrames % (frameRate * 2) === 0; // Keyframe every 2 seconds
          encoder.encode(frame, { keyFrame });
          frame.close();

          processedFrames++;

          // Update progress (10-90% for encoding)
          const progress = 10 + Math.round((processedFrames / totalFrames) * 80);
          onProgress?.(progress);
          setState((prev) => ({ ...prev, progress }));
        }

        // Flush encoder
        await encoder.flush();
        encoder.close();

        onProgress?.(95);
        setState((prev) => ({ ...prev, progress: 95 }));

        // Finalize muxer
        muxer.finalize();

        // Get output
        let outputBuffer: ArrayBuffer;
        if (isMP4) {
          outputBuffer = (muxer as MP4Muxer<ArrayBufferTarget>).target.buffer;
        } else {
          outputBuffer = (muxer as WebMMuxer<WebMArrayBufferTarget>).target.buffer;
        }

        // Cleanup
        URL.revokeObjectURL(videoUrl);

        // Create output blob
        const mimeType = isMP4 ? "video/mp4" : "video/webm";
        const blob = new Blob([outputBuffer], { type: mimeType });

        // Generate output name
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const outputName = `${baseName}_compressed.${config.outputFormat}`;

        onProgress?.(100);
        setState((prev) => ({
          ...prev,
          processing: false,
          progress: 100,
        }));

        console.log(`Compressione completata: ${Math.round(blob.size / 1024)} KB`);

        return { blob, outputName };
      } catch (error) {
        console.error("Errore compressione WebCodecs:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Errore durante la compressione";

        setState((prev) => ({
          ...prev,
          processing: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      processing: false,
      progress: 0,
    }));
  }, []);

  return {
    ...state,
    compressVideo,
    cancel,
  };
}
