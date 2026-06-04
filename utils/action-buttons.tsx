import { Edit2, Eye, Trash2, MessageCircleMore } from "lucide-react";

export default function ActionButtons(
    {
        type
    }: {
        type?: "default" | "branch"
    }
) {
    return (
        <div className="flex justify-end items-center px-[11px] py-[10px] border border-[#E6E7EC] rounded-sm w-fit ml-auto divide-x divide-[#E6E7EC]">
            <button className="pr-[11px] text-gray-400">
                {
                    type === 'branch' ?
                        <Eye size={20} /> :
                        <Edit2 size={20} />
                }
            </button>
            <button className="px-[11px] text-gray-400">
                {
                    type === 'branch' ?
                        <Trash2 size={20} /> :
                        <Eye size={20} />
                }
            </button>
            <button className="pl-[11px] text-gray-400">
                {
                    type === "branch" ?
                        <MessageCircleMore size={20} /> :
                        <Trash2 size={20} />
                }
            </button>
        </div>
    );
}