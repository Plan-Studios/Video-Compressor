"use client";

import { motion } from "framer-motion";
import { Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTimeRemaining } from "@/lib/format-utils";
import type { CompressionProgress } from "@/types/video";

interface ProgressBarProps {
  progress: CompressionProgress;
  onCancel?: () => void;
}

const STATUS_CONFIG = {
  idle: {
    icon: null,
    color: "text-slate-400",
    bgColor: "bg-slate-700",
  },
  "loading-ffmpeg": {
    icon: Loader2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500",
  },
  analyzing: {
    icon: Loader2,
    color: "text-violet-400",
    bgColor: "bg-violet-500",
  },
  compressing: {
    icon: Loader2,
    color: "text-violet-400",
    bgColor: "bg-violet-500",
  },
  completed: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    color: "text-rose-400",
    bgColor: "bg-rose-500",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-amber-400",
    bgColor: "bg-amber-500",
  },
};

export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const config = STATUS_CONFIG[progress.status];
  const Icon = config.icon;
  const isProcessing = ["loading-ffmpeg", "analyzing", "compressing"].includes(
    progress.status
  );

  if (progress.status === "idle") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl bg-slate-800/50 backdrop-blur border border-slate-700/50 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`w-5 h-5 ${config.color} ${
                isProcessing ? "animate-spin" : ""
              }`}
            />
          )}
          <span className={`text-sm font-medium ${config.color}`}>
            {progress.message}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {progress.timeRemaining !== undefined && isProcessing && (
            <span className="text-xs text-slate-400">
              {formatTimeRemaining(progress.timeRemaining)} rimanenti
            </span>
          )}
          {isProcessing && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <X className="w-4 h-4 mr-1" />
              Annulla
            </Button>
          )}
        </div>
      </div>

      <Progress
        value={progress.percent}
        className="h-2 bg-slate-700"
      />

      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{progress.percent}%</span>
        {progress.currentFile && (
          <span className="truncate max-w-[200px]">{progress.currentFile}</span>
        )}
      </div>
    </motion.div>
  );
}
