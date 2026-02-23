"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud } from "lucide-react";

interface ImageUploadProps {
    onUpload?: (url: string) => void;
    multiple?: boolean;
}

export default function ImageUpload({ onUpload, multiple = false }: ImageUploadProps) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-200 rounded-lg bg-red-50 p-4 text-center">
                <UploadCloud className="w-8 h-8 text-red-300 mb-2" />
                <p className="text-sm font-medium text-red-600">Cloudinary not configured</p>
                <p className="text-xs text-red-500 mt-1">Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env</p>
            </div>
        );
    }

    return (
        <CldUploadWidget
            uploadPreset="jacobt_preset"
            options={{
                folder: "jacobt",
                maxFileSize: 10000000,
                multiple: multiple,
                showUploadMoreButton: multiple,
                showPoweredBy: false,
                clientAllowedFormats: ["jpg", "png", "webp", "jpeg"],
                resourceType: "image",
                maxImageFileSize: 10000000,
                sources: ["local", "url", "camera"],
            }}
            onSuccess={(result: any) => {
                if (result.info && typeof result.info === "object" && result.info.secure_url) {
                    onUpload?.(result.info.secure_url);
                }
            }}
        >
            {({ open }) => (
                <button
                    type="button"
                    onClick={() => open()}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-finance-gold/50 rounded-lg hover:bg-finance-gold/10 transition-colors bg-card"
                >
                    <UploadCloud className="w-8 h-8 text-finance-gold mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Tap to upload images (Max 10MB)
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WEBP
                    </span>
                </button>
            )}
        </CldUploadWidget>
    );
}
