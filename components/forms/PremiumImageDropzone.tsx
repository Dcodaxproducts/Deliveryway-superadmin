"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/getImageUrl";

type PremiumImageDropzoneVariant = "avatar" | "logo" | "cover" | "card";

type PremiumImageDropzoneProps = {
  accept?: string;
  alt: string;
  className?: string;
  disabled?: boolean;
  emptyHint: string;
  emptyTitle: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  preview?: string;
  progress?: number;
  removeLabel?: string;
  selectedText: string;
  uploading?: boolean;
  uploadText?: string;
  variant?: PremiumImageDropzoneVariant;
};

const getPreviewSrc = (preview?: string) => {
  return getImageUrl(preview || null) || "";
};

export function PremiumImageDropzone({
  accept = "image/*",
  alt,
  className,
  disabled = false,
  emptyHint,
  emptyTitle,
  onFileSelect,
  onRemove,
  preview,
  progress = 0,
  removeLabel = "Remove image",
  selectedText,
  uploading = false,
  uploadText = "Uploading",
  variant = "card",
}: PremiumImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewSrc = getPreviewSrc(preview);
  const hasPreview = Boolean(previewSrc);
  const isRound = variant === "avatar" || variant === "logo";
  const isCover = variant === "cover";

  const handleFiles = (files: FileList | null) => {
    if (disabled) return;

    const file = files?.[0];
    if (!file) return;

    onFileSelect(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsDragging(false);
  };

  const statusText = uploading
    ? `${uploadText}${progress > 0 ? ` ${progress}%` : ""}`
    : hasPreview
    ? selectedText
    : emptyTitle;

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative flex cursor-pointer overflow-hidden border border-dashed border-gray-300 bg-[radial-gradient(circle_at_top_left,rgba(193,0,10,0.10),transparent_32%),linear-gradient(135deg,#ffffff,#f7f7f8)] shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_22px_60px_rgba(193,0,10,0.13)]",
        isCover
          ? "min-h-[220px] rounded-[18px] p-4"
          : "min-h-[166px] flex-col items-center justify-center rounded-2xl p-6 text-center",
        isRound && "min-h-[180px]",
        isDragging && "border-primary bg-primary/5 ring-4 ring-primary/10",
        disabled && "cursor-not-allowed opacity-65 hover:translate-y-0",
        className
      )}
    >
      {hasPreview && isCover ? (
        <>
          <Image
            src={previewSrc}
            alt={alt}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        </>
      ) : null}

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-center justify-center text-center",
          isCover &&
            "rounded-2xl border border-white/60 bg-white/75 px-5 py-7 backdrop-blur-sm"
        )}
      >
        {!isCover ? (
          <span
            className={cn(
              "relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden border border-gray-200 bg-white shadow-inner",
              isRound ? "rounded-full" : "rounded-2xl"
            )}
          >
            {hasPreview ? (
              <Image
                src={previewSrc}
                alt={alt}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <UploadCloud className="h-9 w-9 text-primary" />
            )}
          </span>
        ) : (
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_34px_rgba(193,0,10,0.28)]">
            {hasPreview ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </span>
        )}

        <span className="text-sm font-semibold text-gray-950">
          {statusText}
        </span>
        <span className="mt-1 max-w-[360px] text-xs leading-5 text-gray-500">
          {emptyHint}
        </span>
      </div>

      {uploading ? (
        <span className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 text-white">
          <Loader2 className="mb-3 h-8 w-8 animate-spin" />
          <span className="text-sm font-semibold">{progress}%</span>
        </span>
      ) : null}

      {hasPreview && onRemove && !disabled ? (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          className="absolute right-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow hover:bg-white"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}
