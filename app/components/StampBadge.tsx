type StampBadgeProps = {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  variant?: "water" | "stamp" | "ink";
};

export default function StampBadge({
  children,
  className = "",
  rotate = -6,
  variant = "water",
}: StampBadgeProps) {
  const colors: Record<string, string> = {
    water: "border-water text-water",
    stamp: "border-stamp text-stamp",
    ink: "border-ink text-ink",
  };

  return (
    <span
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`stamp-badge inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-xs uppercase ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
