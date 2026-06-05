"use client";

import { Type } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

const TypographySection = () => {
    const themeSettings = useTranslations("themeSettings");

    return (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <Type className="text-gray-500" />
                <h3 className="text-[20px] font-semibold text-dark">{themeSettings("typography")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="headingFont" className="block text-base font-semibold text-dark mb-2">{themeSettings("headingFontFamily")}</label>
                    <Input id="headingFont" placeholder={themeSettings("enterFontFamily")} className="h-[52px] border-gray-200 rounded-[12px] focus:ring-primary" />
                </div>
                <div>
                    <label htmlFor="bodyFont" className="block text-base font-semibold text-dark mb-2">{themeSettings("bodyFontFamily")}</label>
                    <Input id="bodyFont" placeholder={themeSettings("enterFontFamily")} className="h-[52px] border-gray-200 rounded-[12px] focus:ring-primary" />
                </div>
            </div>
        </div>
    );
};

export default TypographySection;
