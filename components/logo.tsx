import Image from "next/image";

export default function Logo() {
    return (
        <div className="max-w-[172px] h-[40px]">
            <Image
                src="/logo.png"
                alt="Logo"
                width={256}
                height={256}
            />
        </div>
    )
}
