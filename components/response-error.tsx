import { cn } from "@/lib/utils";

const ResponseError = ({
  error = "Something went wrong",
  className,
}: {
  error?: string;
  className?: string;
}) => {
  return (
    <h1 className={cn("flex h-full items-center justify-center text-red-500", className)}>
      {error}
    </h1>
  );
};

export default ResponseError;
