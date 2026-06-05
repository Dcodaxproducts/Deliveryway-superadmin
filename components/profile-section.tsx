"use client"

import Image from "@/components/MyImage"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useAuth"
import { useTranslations } from "next-intl"

export default function ProfileSection() {
  const router = useRouter();
  const { data: userData } = useUser();
  const profile = useTranslations("profile");

  const avatarSrc = userData?.profile ?? "/fallback.png"

  return (
    <Button
      variant={null}
      className="flex justify-between items-center lg:pl-[25px] gap-[24px] py-2 rounded-lg h-auto"
    >
      <div className="flex flex-col items-start justify-center">
        <span className="lg:text-base text-muted-foreground">{profile("hello")}</span>
        <span className="lg:text-base font-semibold text-foreground">{profile("superAdmin")}</span>
      </div>

      <Avatar
        className="w-10 h-10 lg:w-13 lg:h-13"
      >
        <Image
          src={avatarSrc}
          alt="Super Admin"
          width={56}
          height={56}
          quality={90}
          className="aspect-square object-cover w-full h-full"
        />
      </Avatar>
    </Button>
  )
}
