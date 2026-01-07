"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueueItemComponent } from "./queue-item";
import { formatBytes } from "@/lib/format-utils";
import type { QueueItem } from "@/types/video";

interface VideoQueueProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onDownloadAll: () => void;
  totalStats: {
    originalSize: number;
    compressedSize: number;
    spaceSaved: number;
  };
  completedCount: number;
}

export function VideoQueue({
  queue,
  onRemove,
  onClear,
  onDownloadAll,
  totalStats,
  completedCount,
}: VideoQueueProps) {
  if (queue.length === 0) {
    return null;
  }

  const hasCompleted = completedCount > 0;
  const savingsPercent =
    totalStats.originalSize > 0
      ? Math.round((totalStats.spaceSaved / totalStats.originalSize) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Coda video ({queue.length})
        </h3>
        <div className="flex items-center gap-2">
          {hasCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadAll}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Download className="w-4 h-4 mr-1" />
              Scarica tutti ({completedCount})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-400 hover:text-rose-400"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Svuota
          </Button>
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {queue.map((item) => (
            <QueueItemComponent
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Total stats */}
      {hasCompleted && totalStats.spaceSaved > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-linear-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-300">Totale risparmiato</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-emerald-400">
                {formatBytes(totalStats.spaceSaved)}
              </p>
              <p className="text-xs text-slate-400">
                {formatBytes(totalStats.originalSize)} →{" "}
                {formatBytes(totalStats.compressedSize)} ({savingsPercent}%)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
