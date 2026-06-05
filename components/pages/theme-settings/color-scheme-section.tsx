"use client";

import { Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ColorPicker from './color-picker';

const ColorSchemeSection = () => {
    const themeSettings = useTranslations("themeSettings");

    return (
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <Palette className="text-gray-500" />
                <h3 className="text-[20px] font-semibold text-dark">{themeSettings("colorScheme")}</h3>
            </div>
            <ColorPicker 
                label={themeSettings("primaryBrandColor")}
                description={themeSettings("primaryBrandColorDescription")}
                color="#00FF7B"
            />
            <ColorPicker 
                label={themeSettings("secondaryColor")}
                description={themeSettings("secondaryColorDescription")}
                color="#030401"
            />
            <ColorPicker 
                label={themeSettings("accentColor")}
                description={themeSettings("accentColorDescription")}
                color="#F59E0B"
            />
            <ColorPicker 
                label={themeSettings("backgroundColor")}
                color="#FFFFFF"
            />
            <ColorPicker 
                label={themeSettings("textColor")}
                color="#030401"
            />
            <ColorPicker 
                label={themeSettings("buttonColor")}
                color="#CE181B"
            />
        </div>
    );
};

export default ColorSchemeSection;
