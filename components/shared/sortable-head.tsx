import { TableHead } from "@/components/ui/table";
import { RxTriangleDown, RxTriangleUp } from "react-icons/rx";

export default function SortableHeader({ label, className = "font-medium" }: { label: string; className?: string }) {
  return (
    <TableHead className="text-dark text-sm text-center cursor-pointer">
      <div className={`flex items-center justify-center gap-2 group ${className}`}>
        {label}
        <div className="flex flex-col -space-y-1 text-[#D3D6E4]">
          <RxTriangleUp size={12} strokeWidth={3} />
          <RxTriangleDown size={12} strokeWidth={3} />
        </div>
      </div>
    </TableHead>
  );
}
