export default function Header({ title, description, className }: HeaderProps) {
    return (
        <div className={`lg:space-y-[6px] ${className}`}>
            <h1 className="text-xl lg:text-[32px] font-semibold text-dark lg:leading-[42px]">
                {title}
            </h1>

            <p className="text-sm lg:text-base text-gray">
                {description}
            </p>

        </div>
    )
}
