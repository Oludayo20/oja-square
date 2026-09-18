import Image from "next/image";

export default function AppLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/oja-logo-trans.png"
      alt="Oja"
      width={160}
      height={40}
      className={className || "h-8 w-auto"}
      priority={priority}
    />
  );
}
