"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigInputProps {
  label: string;
  placeholder: string;
  suffix?: string;
  type?: "text" | "select";
}

export function ConfigInput({ label, placeholder, suffix, type = "text" }: ConfigInputProps) {
  return (
    <div className="space-y-[8px]">
      <Label className="text-sm font-semibold text-dark">{label}</Label>
      <div className="relative">
        {type === "select" ? (
          <Select>
            <SelectTrigger className="h-[42px] border-gray-200 rounded-[8px] focus:ring-primary">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{placeholder}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <>
            <Input 
              placeholder={placeholder} 
              className="h-[42px] border-gray-200 rounded-[8px] pr-12 focus-visible:ring-primary" 
            />
            {suffix && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}