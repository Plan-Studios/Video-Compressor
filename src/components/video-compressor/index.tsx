"use client";

import { motion } from "framer-motion";
import { Play, AlertTriangle, Loader2, Zap, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./dropzone";
import { SettingsPanel } from "./settings-panel";
import { VideoQueue } from "./video-queue";
import { useCompressionQueue } from "@/hooks/use-compression-queue";

export function VideoCompressor() {
  const {
    queue,
    options,
    isProcessing,
    currentProgress,
    currentStatus,
    engine,
    switchEngine,
    webCodecsSupported,
    ffmpegLoading,
    ffmpegError,
    ffmpegSupported,
    addVideos,
    removeFromQueue,
    clearQueue,
    processQueue,
    cancelProcessing,
    downloadAll,
    updateOptions,
    totalStats,
    completedCount,
    pendingCount,
  } = useCompressionQueue();

  const hasVideos = queue.length > 0;
  const canProcess = pendingCount > 0 && !isProcessing;

  // Check if any compression method is available
  const anyEngineSupported = webCodecsSupported || ffmpegSupported;

  if (!anyEngineSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-400">
              Browser non supportato
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Il tuo browser non supporta WebCodecs o SharedArrayBuffer.
              Prova ad usare Chrome, Edge o Safari aggiornati.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engine indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          {engine === "webcodecs" ? (
            <>
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                WebCodecs API
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Veloce
              </span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                FFmpeg.wasm
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                Compatibile
              </span>
            </>
          )}
        </div>

        {/* Engine switcher (only show if both available) */}
        {webCodecsSupported && ffmpegSupported && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => switchEngine(engine === "webcodecs" ? "ffmpeg" : "webcodecs")}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            disabled={isProcessing}
          >
            Cambia
          </Button>
        )}
      </motion.div>

      {/* Dropzone */}
      <Dropzone
        onFilesAccepted={addVideos}
        disabled={isProcessing}
        currentQueueSize={queue.length}
      />

      {/* Video Queue */}
      {hasVideos && (
        <VideoQueue
          queue={queue}
          onRemove={removeFromQueue}
          onClear={clearQueue}
          onDownloadAll={downloadAll}
          totalStats={totalStats}
          completedCount={completedCount}
        />
      )}

      {/* Settings */}
      {hasVideos && (
        <SettingsPanel
          options={options}
          onOptionsChange={updateOptions}
          disabled={isProcessing}
        />
      )}

      {/* Process Button */}
      {hasVideos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {isProcessing ? (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{currentStatus || "Elaborazione..."}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-violet-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <Button
                onClick={cancelProcessing}
                variant="outline"
                className="w-full border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              >
                Annulla
              </Button>
            </div>
          ) : (
            <Button
              onClick={processQueue}
              disabled={!canProcess}
              className="w-full sm:w-auto px-8 py-6 text-lg font-semibold
                bg-linear-to-r from-violet-500 to-cyan-500
                hover:from-violet-600 hover:to-cyan-600
                shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Comprimi {pendingCount} video
            </Button>
          )}

          {ffmpegError && engine === "ffmpeg" && (
            <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{ffmpegError}</p>
          )}

          {ffmpegLoading && engine === "ffmpeg" && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Caricamento FFmpeg in corso...
            </p>
          )}
        </motion.div>
      )}

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-slate-500"
      >
        <span className="inline-flex items-center gap-1">
          Compressione 100% locale - I tuoi video non lasciano mai il tuo
          dispositivo
        </span>
      </motion.div>
    </div>
  );
}
