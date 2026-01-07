"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface FFmpegState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  supported: boolean;
  progress: number;
}

// Check if SharedArrayBuffer is available
function checkSharedArrayBufferSupport(): boolean {
  try {
    // Check if SharedArrayBuffer exists and is functional
    if (typeof SharedArrayBuffer === "undefined") {
      return false;
    }
    // Try to create one to make sure it works
    new SharedArrayBuffer(1);
    return true;
  } catch {
    return false;
  }
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);
  const [state, setState] = useState<FFmpegState>({
    loaded: false,
    loading: false,
    error: null,
    supported: false, // Will be set in useEffect
    progress: 0,
  });

  // Check support on client side only
  useEffect(() => {
    const isSupported = checkSharedArrayBufferSupport();
    setState((prev) => ({ ...prev, supported: isSupported }));

    if (!isSupported) {
      console.warn(
        "SharedArrayBuffer non disponibile. Assicurati che il sito sia servito con i corretti headers COOP/COEP."
      );
    }
  }, []);

  const load = useCallback(async () => {
    // Return existing instance if already loaded
    if (loadedRef.current && ffmpegRef.current) {
      return ffmpegRef.current;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, progress: 0 }));

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      // Log progress during load
      ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
      });

      // Use unpkg CDN for ffmpeg core files
      // Using version 0.12.6 which is stable
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

      console.log("Caricamento FFmpeg core da:", baseURL);

      // Fetch the files and create blob URLs
      const coreResponse = await fetch(`${baseURL}/ffmpeg-core.js`);
      if (!coreResponse.ok) {
        throw new Error(`Impossibile caricare ffmpeg-core.js: ${coreResponse.status}`);
      }
      const coreBlob = await coreResponse.blob();
      const coreURL = URL.createObjectURL(
        new Blob([await coreBlob.text()], { type: "text/javascript" })
      );

      setState((prev) => ({ ...prev, progress: 33 }));

      const wasmResponse = await fetch(`${baseURL}/ffmpeg-core.wasm`);
      if (!wasmResponse.ok) {
        throw new Error(`Impossibile caricare ffmpeg-core.wasm: ${wasmResponse.status}`);
      }
      const wasmBlob = await wasmResponse.blob();
      const wasmURL = URL.createObjectURL(wasmBlob);

      setState((prev) => ({ ...prev, progress: 66 }));

      // Load FFmpeg with the blob URLs
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      loadedRef.current = true;
      setState((prev) => ({ ...prev, loaded: true, loading: false, progress: 100 }));

      console.log("FFmpeg caricato con successo!");
      return ffmpeg;
    } catch (error) {
      console.error("Errore caricamento FFmpeg:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore sconosciuto durante il caricamento di FFmpeg";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: 0,
      }));

      // Clean up
      ffmpegRef.current = null;
      loadedRef.current = false;

      throw new Error(`Caricamento FFmpeg fallito: ${errorMessage}`);
    }
  }, []);

  const transcode = useCallback(
    async (
      inputFile: File,
      outputName: string,
      args: string[],
      onProgress?: (progress: number) => void
    ): Promise<Uint8Array> => {
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg || !loadedRef.current) {
        throw new Error("FFmpeg non e' stato caricato. Chiama load() prima di transcode().");
      }

      // Set up progress handler
      const progressHandler = ({ progress }: { progress: number }) => {
        const percent = Math.min(Math.round(progress * 100), 100);
        onProgress?.(percent);
      };

      ffmpeg.on("progress", progressHandler);

      try {
        // Determine input extension
        const inputExt = inputFile.name.includes(".")
          ? inputFile.name.substring(inputFile.name.lastIndexOf("."))
          : ".mp4";
        const inputName = `input${inputExt}`;

        console.log(`Scrittura file input: ${inputName} (${inputFile.size} bytes)`);

        // Write input file to FFmpeg virtual filesystem
        const fileData = await fetchFile(inputFile);
        await ffmpeg.writeFile(inputName, fileData);

        // Build the command - replace placeholder with actual input name
        const command = args.map((arg) => {
          if (arg === "input.mp4" || arg === args[1]) {
            return inputName;
          }
          return arg;
        });

        console.log("Esecuzione comando FFmpeg:", command.join(" "));

        // Execute FFmpeg command
        await ffmpeg.exec(command);

        // Read output file
        const data = await ffmpeg.readFile(outputName);

        console.log(`Output generato: ${outputName} (${(data as Uint8Array).length} bytes)`);

        // Cleanup files from virtual filesystem
        try {
          await ffmpeg.deleteFile(inputName);
          await ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
          console.warn("Errore pulizia file temporanei:", cleanupError);
        }

        return data as Uint8Array;
      } finally {
        // Always remove the progress handler
        ffmpeg.off("progress", progressHandler);
      }
    },
    []
  );

  const terminate = useCallback(() => {
    if (ffmpegRef.current) {
      try {
        ffmpegRef.current.terminate();
      } catch (e) {
        console.warn("Errore terminazione FFmpeg:", e);
      }
      ffmpegRef.current = null;
      loadedRef.current = false;
      setState({
        loaded: false,
        loading: false,
        error: null,
        supported: checkSharedArrayBufferSupport(),
        progress: 0,
      });
    }
  }, []);

  return {
    ...state,
    load,
    transcode,
    terminate,
    ffmpeg: ffmpegRef.current,
  };
}
