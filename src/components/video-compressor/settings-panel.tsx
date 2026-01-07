"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CompressionSlider } from "./compression-slider";
import { PresetButtons } from "./preset-buttons";
import type { CompressionOptions } from "@/types/video";

interface SettingsPanelProps {
  options: CompressionOptions;
  onOptionsChange: (options: Partial<CompressionOptions>) => void;
  disabled?: boolean;
}

export function SettingsPanel({
  options,
  onOptionsChange,
  disabled = false,
}: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700/50 p-6 transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Impostazioni</h2>
      </div>

      <div className="space-y-6">
        {/* Compression Slider */}
        <CompressionSlider
          value={options.compressionPercent}
          onChange={(value) => onOptionsChange({ compressionPercent: value })}
          disabled={disabled}
        />

        {/* Preset Buttons */}
        <PresetButtons
          currentValue={options.compressionPercent}
          onSelect={(value) => onOptionsChange({ compressionPercent: value })}
          disabled={disabled}
        />

        {/* Format and Resolution Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Formato output
            </label>
            <Select
              value={options.outputFormat}
              onValueChange={(value: "mp4" | "webm") =>
                onOptionsChange({ outputFormat: value })
              }
              disabled={disabled}
            >
              <SelectTrigger className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="webm">WebM (VP9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Risoluzione
            </label>
            <Select
              value={options.resolution}
              onValueChange={(value: CompressionOptions["resolution"]) =>
                onOptionsChange({ resolution: value })
              }
              disabled={disabled}
            >
              <SelectTrigger className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Originale</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-300">Mantieni audio</label>
            <Switch
              checked={options.keepAudio}
              onCheckedChange={(checked) =>
                onOptionsChange({ keepAudio: checked })
              }
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-300">Rimuovi metadati</label>
            <Switch
              checked={options.removeMetadata}
              onCheckedChange={(checked) =>
                onOptionsChange({ removeMetadata: checked })
              }
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
