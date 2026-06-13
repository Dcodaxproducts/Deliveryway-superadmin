"use client";

import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { PremiumImageDropzone } from "@/components/forms/PremiumImageDropzone";

interface FileUploaderProps {
    title: string;
    recommendation: string;
    fileTypes: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ title, recommendation, fileTypes }) => {
    const themeSettings = useTranslations("themeSettings");
    const [preview, setPreview] = useState("");

    const handleFileSelect = (file: File) => {
        if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setPreview(URL.createObjectURL(file));
    };

    const removePreview = () => {
        if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setPreview("");
    };

    useEffect(() => {
        return () => {
            if (preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div className="space-y-[4px]">
            <h4 className="text-base text-dark">{title}</h4>
            <p className="text-sm text-gray max-w-[368px]">{recommendation}</p>
            <PremiumImageDropzone
                accept={fileTypes}
                alt={title}
                emptyHint={fileTypes}
                emptyTitle={themeSettings("clickToUpload")}
                onFileSelect={handleFileSelect}
                onRemove={removePreview}
                preview={preview}
                selectedText={themeSettings("clickToUpload")}
                variant="card"
            />
        </div>
    );
};

export default FileUploader;
