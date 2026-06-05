"use client";

import Image from "@/components/MyImage";
import MyImage from "@/components/MyImage";
import { useTranslations } from "next-intl";

export default function Hero({ data }: { data: any }) {
    const restaurants = useTranslations("restaurants");

    return (
        <div className="w-full rounded-[14px] overflow-hidden space-y-[24px] md:space-y-[32px]">

            {/* Banner Image */}
          <div className="relative w-full h-[120px] md:h-[175px]">
    <Image
        src={data?.coverImage || "/profile-banner.png"}
        alt={data?.name ? `${data.name} ${restaurants("banner")}` : restaurants("restaurantBanner")}
        fill
        className="object-cover rounded-[14px]"
        priority
    />
</div>

            {/* Profile Section */}
            <div className="px-4 md:px-[30px] pb-[30px] relative">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">

                    <div className="relative size-[120px] md:w-[196px] md:h-[196px] mt-[-60px] md:mt-[-128px] rounded-full overflow-hidden bg-white shadow-md shrink-0">
                        <MyImage
                            src={data?.logoUrl || "/placeholder.svg"}
                            alt={data?.name || restaurants("restaurantLogo")}
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row flex-1 items-center md:items-center justify-between gap-4 md:pb-4 md:-mt-4 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-[18px]">
                            <div className="flex items-center gap-2 md:gap-[18px]">
                                <div className="size-2 md:size-3 rounded-full bg-green shrink-0" />
                                <h1 className="text-2xl md:text-[32px] font-semibold text-dark capitalize">{data?.name}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
