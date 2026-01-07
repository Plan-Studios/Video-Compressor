"use client";

import { useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download } from "lucide-react";
import { useFileDrop } from "@/hooks/use-video-compression";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE, MAX_QUEUE_SIZE } from "@/types/video";
import { formatBytes } from "@/lib/format-utils";

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean;
  currentQueueSize?: number;
}

export function Dropzone({
  onFilesAccepted,
  disabled = false,
  currentQueueSize = 0,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const validateAndAcceptFiles = useCallback(
    (files: File[]) => {
      const remainingSlots = MAX_QUEUE_SIZE - currentQueueSize;
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files.slice(0, remainingSlots)) {
        if (!SUPPORTED_FORMATS.includes(file.type)) {
          errors.push(`${file.name}: Formato non supportato`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File troppo grande (max ${formatBytes(MAX_FILE_SIZE)})`);
          continue;
        }
        validFiles.push(file);
      }

      if (files.length > remainingSlots) {
        errors.push(`Massimo ${MAX_QUEUE_SIZE} video nella coda`);
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      if (validFiles.length > 0) {
        onFilesAccepted(validFiles);
      }
    },
    [currentQueueSize, onFilesAccepted]
  );

  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetDrag,
  } = useFileDrop(validateAndAcceptFiles);

  // Global listener to reset drag state when user drags outside browser
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      resetDrag();
    };

    // Reset when drag ends anywhere
    window.addEventListener("dragend", handleGlobalDragEnd);

    // Also reset when mouse leaves the document entirely
    const handleDocumentDragLeave = (e: DragEvent) => {
      // Check if leaving the document
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        resetDrag();
      }
    };

    document.addEventListener("dragleave", handleDocumentDragLeave);

    return () => {
      window.removeEventListener("dragend", handleGlobalDragEnd);
      document.removeEventListener("dragleave", handleDocumentDragLeave);
    };
  }, [resetDrag]);

  const handleClick = () => {
    if (!disabled && !isDragging) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAcceptFiles(files);
    }
    e.target.value = "";
  };

  return (
    <motion.div
      ref={dropzoneRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-2xl border-2 border-dashed p-8 md:p-12
        transition-all duration-300 cursor-pointer overflow-hidden
        ${
          isDragging
            ? "border-violet-400 bg-violet-500/15 dark:bg-violet-500/20 shadow-2xl shadow-violet-500/20"
            : "border-slate-300 dark:border-slate-600 hover:border-violet-400 bg-white/50 dark:bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Animated background rings when dragging */}
      <AnimatePresence>
        {isDragging && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-violet-400 pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-violet-400 pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-violet-400 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Content - pointer-events-none during drag to prevent flickering */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center gap-4 ${
          isDragging ? "pointer-events-none" : ""
        }`}
      >
        {/* Icon with enhanced animation */}
        <motion.div
          animate={
            isDragging
              ? {
                  scale: [1, 1.2, 1],
                  y: [0, -10, 0],
                }
              : { scale: 1, y: 0 }
          }
          transition={
            isDragging
              ? {
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          className={`
            p-5 rounded-full transition-all duration-300
            ${
              isDragging
                ? "bg-violet-500 shadow-xl shadow-violet-500/50"
                : "bg-slate-200 dark:bg-slate-700"
            }
          `}
        >
          {isDragging ? (
            <Download className="w-10 h-10 text-white" />
          ) : (
            <Upload className="w-10 h-10 text-slate-500 dark:text-slate-400" />
          )}
        </motion.div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? "dragging" : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {isDragging ? (
              <>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                  Rilascia qui!
                </p>
                <p className="text-sm text-violet-500/80 dark:text-violet-400/80 mt-1">
                  Il video verra aggiunto alla coda
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
                  Trascina qui i tuoi video
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  oppure clicca per selezionare
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Format badges - hidden when dragging */}
        <motion.div
          animate={{ opacity: isDragging ? 0 : 1, scale: isDragging ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap justify-center gap-2 text-xs text-slate-500"
        >
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">MP4</span>
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">MOV</span>
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">AVI</span>
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">MKV</span>
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">WebM</span>
        </motion.div>

        <motion.p
          animate={{ opacity: isDragging ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-slate-500"
        >
          Max: {formatBytes(MAX_FILE_SIZE)} per file | Fino a {MAX_QUEUE_SIZE} video
        </motion.p>
      </div>

      {/* Gradient overlay when dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-linear-to-t from-violet-500/15 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Corner accents when dragging */}
      <AnimatePresence>
        {isDragging && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 border-violet-500 rounded-tl-xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 border-violet-500 rounded-tr-xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 border-violet-500 rounded-bl-xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 border-violet-500 rounded-br-xl pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
