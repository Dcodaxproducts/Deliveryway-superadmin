"use client";

import { Info } from "lucide-react";

interface ConfigSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ConfigSection({ title, description, children }: ConfigSectionProps) {
  return (
    <div className="bg-white p-4 lg:p-[30px] rounded-[14px] shadow-sm border border-gray-100">
      <div className="flex gap-3 mb-6">
        <div className="size-6 rounded-full flex items-center justify-center shrink-0">
          <Info className="text-gray size-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-dark leading-tight">{title}</h3>
          <p className="text-sm text-gray">{description}</p>
        </div>
      </div>
      <div className="space-y-[20px]">
        {children}
      </div>
    </div>
  );
}