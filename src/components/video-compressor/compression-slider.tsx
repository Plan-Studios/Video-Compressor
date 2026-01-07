"use client";

import { Slider } from "@/components/ui/slider";

interface CompressionSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CompressionSlider({
  value,
  onChange,
  disabled = false,
}: CompressionSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Livello compressione
        </label>
        <span className="text-sm font-mono text-violet-500 dark:text-violet-400">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={10}
        max={90}
        step={5}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Massima compressione</span>
        <span>Massima qualita</span>
      </div>
    </div>
  );
}
