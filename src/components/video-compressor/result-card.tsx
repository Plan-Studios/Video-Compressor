"use client";

import { motion } from "framer-motion";
import { Download, RotateCcw, CheckCircle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, formatBitrate } from "@/lib/format-utils";
import type { CompressionResult } from "@/types/video";

interface ResultCardProps {
  result: CompressionResult;
  onReset: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = result.outputUrl;
    link.download = result.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-linear-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-6"
    >
      {/* Success Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-emerald-500/20">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-400">
            Video compresso con successo!
          </h3>
          <p className="text-sm text-slate-400">
            Hai risparmiato {result.spaceSavedPercent}% di spazio
          </p>
        </div>
      </div>

      {/* Video Preview */}
      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
        <video
          src={result.outputUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-1">Dimensione originale</p>
          <p className="text-lg font-semibold text-slate-200">
            {formatBytes(result.originalSize)}
          </p>
          {result.originalBitrate && (
            <p className="text-xs text-slate-500">
              {formatBitrate(result.originalBitrate)}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 mb-1">Dimensione compressa</p>
          <p className="text-lg font-semibold text-emerald-300">
            {formatBytes(result.compressedSize)}
          </p>
          {result.compressedBitrate && (
            <p className="text-xs text-emerald-400/70">
              {formatBitrate(result.compressedBitrate)}
            </p>
          )}
        </div>
      </div>

      {/* Space Saved Banner */}
      <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
        <TrendingDown className="w-5 h-5 text-emerald-400" />
        <span className="text-emerald-300 font-medium">
          Risparmiati {formatBytes(result.spaceSaved)} ({result.spaceSavedPercent}
          %)
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Scarica video
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Comprimi altro video
        </Button>
      </div>
    </motion.div>
  );
}
