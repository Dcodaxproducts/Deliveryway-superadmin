"use client";

import { Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FileUploader from './file-uploader';

const BrandAssetsSection = () => {
    const themeSettings = useTranslations("themeSettings");

    return (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <ImageIcon className="text-gray-500" />
                <h3 className="text-[20px] font-semibold text-dark">{themeSettings("brandAssets")}</h3>
            </div>
            <FileUploader 
                title={themeSettings("restaurantLogo")}
                recommendation={themeSettings("restaurantLogoRecommendation")}
                fileTypes=".png, .svg, .jpg"
            />
            <FileUploader 
                title={themeSettings("favicon")}
                recommendation={themeSettings("faviconRecommendation")}
                fileTypes=".png, .ico"
            />
            <FileUploader 
                title={themeSettings("heroBanner")}
                recommendation={themeSettings("heroBannerRecommendation")}
                fileTypes=".png, .jpg"
            />
        </div>
    );
};

export default BrandAssetsSection;
