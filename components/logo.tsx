import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="DeliveryWay dashboard"
      className="block w-[172px] overflow-hidden rounded-xl bg-white"
    >
      <Image
        src="/deliveryway-logo.jpg"
        alt="DeliveryWay"
        width={686}
        height={541}
        className="h-[58px] w-full object-contain"
        priority
      />
    </Link>
  );
}
