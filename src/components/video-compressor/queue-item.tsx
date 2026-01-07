"use client";

import { motion } from "framer-motion";
import {
  Download,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format-utils";
import type { QueueItem as QueueItemType } from "@/types/video";

interface QueueItemProps {
  item: QueueItemType;
  onRemove: () => void;
  onDownload?: () => void;
}

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  error: AlertCircle,
};

const STATUS_COLORS = {
  pending: "text-slate-400",
  processing: "text-violet-400",
  completed: "text-emerald-400",
  error: "text-rose-400",
};

const STATUS_LABELS = {
  pending: "In attesa",
  processing: "Compressione...",
  completed: "Completato",
  error: "Errore",
};

export function QueueItemComponent({
  item,
  onRemove,
  onDownload,
}: QueueItemProps) {
  const Icon = STATUS_ICONS[item.status];
  const colorClass = STATUS_COLORS[item.status];

  const handleDownload = () => {
    if (item.result) {
      const link = document.createElement("a");
      link.href = item.result.outputUrl;
      link.download = item.result.outputName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        p-4 rounded-xl border transition-all
        ${
          item.status === "processing"
            ? "bg-violet-500/10 border-violet-500/30"
            : item.status === "completed"
            ? "bg-emerald-500/10 border-emerald-500/30"
            : item.status === "error"
            ? "bg-rose-500/10 border-rose-500/30"
            : "bg-slate-800/50 border-slate-700/50"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="relative w-16 h-10 bg-slate-700 rounded overflow-hidden shrink-0">
          <video
            src={item.result?.outputUrl || item.video.previewUrl}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {item.video.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Icon
              className={`w-3 h-3 ${colorClass} ${
                item.status === "processing" ? "animate-spin" : ""
              }`}
            />
            <span className={`text-xs ${colorClass}`}>
              {STATUS_LABELS[item.status]}
              {item.error && `: ${item.error}`}
            </span>
          </div>
        </div>

        {/* Size info */}
        <div className="hidden sm:block text-right">
          {item.result ? (
            <div>
              <p className="text-xs text-slate-400 line-through">
                {formatBytes(item.result.originalSize)}
              </p>
              <p className="text-sm text-emerald-400 font-medium">
                {formatBytes(item.result.compressedSize)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              {formatBytes(item.video.size)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {item.status === "completed" && item.result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {item.status !== "processing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar for processing items */}
      {item.status === "processing" && (
        <div className="mt-3">
          <Progress value={item.progress} className="h-1.5 bg-slate-700" />
          <p className="text-xs text-violet-400 mt-1 text-right">
            {item.progress}%
          </p>
        </div>
      )}

      {/* Savings badge for completed items */}
      {item.status === "completed" && item.result && (
        <div className="mt-2 flex justify-end">
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
            -{item.result.spaceSavedPercent}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
