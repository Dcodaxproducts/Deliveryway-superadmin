import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ExportSection() {
    const common = useTranslations("common");

    return (
        <div className="space-y-[15px]">
            <h3 className="text-base text-dark">{common("exportReports")}</h3>

            <div className="flex gap-[16px] max-w-[700px] overflow-x-auto scroll-hidden">
                <Button
                    variant="outline"
                    className="h-[52px] min-w-[180px] flex-1 flex items-center justify-center gap-3 border-gray-200 rounded-[12px] text-gray font-medium hover:bg-gray-50 transition-colors"
                >
                    <FileText size={20} className="text-gray-400" />
                    CSV
                </Button>

                <Button
                    variant="outline"
                    className="h-[52px] min-w-[180px] flex-1 flex items-center justify-center gap-3 border-gray-200 rounded-[12px] text-gray font-medium hover:bg-gray-50 transition-colors"
                >
                    <FileText size={20} className="text-gray-400" />
                    Excel
                </Button>

                <Button
                    variant="outline"
                    className="h-[52px] min-w-[180px] flex-1 flex items-center justify-center gap-3 border-gray-200 rounded-[12px] text-gray font-medium hover:bg-gray-50 transition-colors"
                >
                    <FileText size={20} className="text-gray-400" />
                    PDF
                </Button>
            </div>
        </div>
    );
}
