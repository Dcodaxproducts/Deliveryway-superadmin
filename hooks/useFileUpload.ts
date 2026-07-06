"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";
import { prepareUploadFile } from "@/lib/prepare-upload-file";

export const MAX_UPLOAD_FILE_SIZE_MB = 20;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;

const getUploadErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

export const useFileUpload = () => {
  const toasts = useTranslations("toasts");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);
      setProgress(0);

      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        throw new Error(`File size must be less than or equal to ${MAX_UPLOAD_FILE_SIZE_MB}MB`);
      }

      const prepared = await prepareUploadFile(file);

      const presignedRes = await api.post("/storage/presigned-upload", {
        fileName: prepared.file.name,
        contentType: prepared.file.type,
        fileSize: prepared.file.size,
      });

      const presigned = presignedRes.data?.data;

      if (!presigned?.uploadUrl || !presigned?.fileUrl) {
        throw new Error(toasts("invalidPresignedUrlResponse"));
      }

      const { uploadUrl, fileUrl, headers } = presigned;

      await axios.put(uploadUrl, prepared.file, {
        headers: {
          "Content-Type": prepared.file.type,
          ...(headers || {}),
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      setProgress(100);
      toast.success(toasts("fileUploaded"));
      return fileUrl;
    } catch (err: unknown) {
      toast.error(getUploadErrorMessage(err, toasts("uploadFailed")));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<string | null> => {
    const file = e.target.files?.[0];
    if (!file) return null;

    return await uploadFile(file);
  };

  return {
    uploadFile,
    handleFileChange,
    uploading,
    progress,
  };
};
