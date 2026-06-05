"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

export const useFileUpload = () => {
  const toasts = useTranslations("toasts");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      setUploading(true);
      setProgress(0);

      const presignedRes = await api.post("/storage/presigned-upload", {
        fileName: file.name,
        contentType: file.type,
      });

      const presigned = presignedRes.data?.data;

      if (!presigned?.uploadUrl || !presigned?.fileUrl) {
        throw new Error(toasts("invalidPresignedUrlResponse"));
      }

      const { uploadUrl, fileUrl, headers } = presigned;

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
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
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || toasts("uploadFailed"));
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
