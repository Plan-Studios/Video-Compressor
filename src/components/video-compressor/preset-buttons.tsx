"use client";

import { motion } from "framer-motion";
import { COMPRESSION_PRESETS, PresetKey } from "@/types/video";

interface PresetButtonsProps {
  currentValue: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

export function PresetButtons({
  currentValue,
  onSelect,
  disabled = false,
}: PresetButtonsProps) {
  const presets = Object.entries(COMPRESSION_PRESETS) as [
    PresetKey,
    (typeof COMPRESSION_PRESETS)[PresetKey]
  ][];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Preset rapidi</label>
      <div className="flex flex-wrap gap-2">
        {presets.map(([key, preset]) => {
          const isActive = currentValue === preset.value;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              onClick={() => !disabled && onSelect(preset.value)}
              disabled={disabled}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="mr-1">{preset.emoji}</span>
              {preset.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
