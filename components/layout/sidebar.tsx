"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { menuItems, type SidebarMenuItem } from "@/constants/sidebarItems";
import { Button } from "@/components/ui/button";
import Logo from "../logo";

interface SidebarItemProps {
  item: SidebarMenuItem;
  pathname: string;
  isActive?: boolean;
  onLinkClick?: () => void;
}

const normalizePath = (path?: string) => {
  if (!path) return "";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
};

const isRouteActive = (pathname: string, href?: string) => {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (!targetPath) return false;
  if (targetPath === "/") return currentPath === "/";

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const SidebarItem = ({
  item,
  pathname,
  isActive = false,
  onLinkClick,
}: SidebarItemProps) => {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  const parentClasses = `
    flex items-center gap-[12px] w-full transition-all pl-[23px] pr-[18px]
    ${isActive ? "bg-[#FDE8E8] py-[9px]" : "bg-transparent"}
    ${hasChildren ? "cursor-pointer" : ""}
  `;

  const iconClasses = `
    flex items-center justify-center size-10 shrink-0 rounded-xl transition-colors
    ${isActive ? "bg-primary text-white" : "bg-[#F9FAFB] text-primary"}
  `;

  const textClasses = `
    text-sm truncate transition-colors flex-1 text-left
    ${isActive ? "text-black" : "text-gray hover:text-primary"}
  `;

  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={parentClasses}
        >
          <div className={iconClasses}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          <span className={textClasses}>{item.title}</span>

          <ChevronRight
            size={18}
            className={`
              shrink-0 text-gray transition-transform duration-200
              ${isOpen ? "rotate-90 text-primary" : ""}
            `}
          />
        </button>

        {isOpen && (
          <div className="mx-[27px] mt-[4px] rounded-[10px] bg-[#F7F7F7] py-[12px]">
            <div className="flex flex-col gap-[8px]">
              {item.children?.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isRouteActive(pathname, child.href);

                return (
                  <Link
                    key={child.title}
                    href={child.href || "#"}
                    onClick={onLinkClick}
                    className="flex items-center gap-[14px] px-[22px] py-[8px] text-gray transition-colors hover:text-primary"
                  >
                    <div className="flex items-center justify-center size-8 shrink-0 text-primary">
                      <ChildIcon size={20} strokeWidth={2} />
                    </div>

                    <span
                      className={`
                        text-sm truncate font-normal transition-colors
                        ${childActive ? "text-primary" : "text-gray"}
                      `}
                    >
                      {child.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href || "#"} onClick={onLinkClick} className={parentClasses}>
      <div className={iconClasses}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      <span className={textClasses}>{item.title}</span>
    </Link>
  );
};

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <aside className="flex flex-col w-72 bg-white h-full">
      <div className="flex items-center justify-center pt-[50px] xl:hidden">
        <Logo />
      </div>

      <div>
        <Image
          src="/gradient.png"
          alt="Logo"
          width={256}
          height={256}
          className="w-full h-auto pt-[50px] pb-[24px]"
          priority
        />
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
        <nav className="flex flex-col gap-[12px]">
          {menuItems.map((item) => {
            const isParentRouteActive = isRouteActive(pathname, item.href);

            const isChildRouteActive = Boolean(
              item.children?.some((child) => isRouteActive(pathname, child.href))
            );

            const isActive = isParentRouteActive || isChildRouteActive;

            return (
              <SidebarItem
                key={item.title}
                item={item}
                pathname={pathname}
                isActive={isActive}
                onLinkClick={onLinkClick}
              />
            );
          })}
        </nav>
      </div>

      <div className="px-[23px] py-6 sticky bottom-0 bg-white">
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-[12px] w-full h-auto p-0 text-primary hover:bg-red-50 hover:text-primary rounded-xl transition-all"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center size-10 bg-[#F9FAFB] rounded-xl text-primary">
            <LogOut size={20} />
          </div>
          <span className="font-semibold text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}