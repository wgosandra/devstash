import Image from "next/image";

interface UserAvatarProps {
  name: string | null;
  image: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({
  name,
  image,
  size = 30,
  className,
}: UserAvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={`shrink-0 rounded-full ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
