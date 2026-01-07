"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDuration } from "@/lib/format-utils";
import type { VideoFile } from "@/types/video";

interface VideoPreviewProps {
  video: VideoFile;
  onRemove?: () => void;
  showRemove?: boolean;
  compact?: boolean;
}

export function VideoPreview({
  video,
  onRemove,
  showRemove = true,
  compact = false,
}: VideoPreviewProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
        <div className="relative w-16 h-10 bg-slate-700 rounded overflow-hidden shrink-0">
          <video
            src={video.previewUrl}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {video.name}
          </p>
          <p className="text-xs text-slate-400">
            {formatBytes(video.size)}
            {video.duration && ` • ${formatDuration(video.duration)}`}
          </p>
        </div>
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="shrink-0 text-slate-400 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-xl overflow-hidden bg-slate-800/50 backdrop-blur"
    >
      <div className="aspect-video bg-black">
        <video
          src={video.previewUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium text-slate-200 truncate">{video.name}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
              <span>{formatBytes(video.size)}</span>
              {video.duration && <span>{formatDuration(video.duration)}</span>}
              {video.width && video.height && (
                <span>
                  {video.width}x{video.height}
                </span>
              )}
            </div>
          </div>
          {showRemove && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
