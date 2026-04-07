import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

/** Re-use for hero watermarks / meta tags if needed */
export const brandLogoSrc = logo;

const sizeMap = {
  sm: "h-8 w-auto max-w-[2rem]",
  md: "h-9 w-auto max-w-[2.25rem] sm:h-10 sm:max-w-[2.5rem]",
  lg: "h-14 w-auto max-w-[3.75rem] sm:h-16 sm:max-w-[4rem]",
  xl: "h-20 w-auto max-w-[5.5rem] sm:h-24 sm:max-w-[6rem]",
  hero: "h-28 w-auto max-w-[8rem] sm:h-32 sm:max-w-[9rem] md:h-36 md:max-w-[10rem]",
};

/**
 * Wordmark: transparent PNG (no extra box behind it) + “College” / “Connect” text.
 */
export function BrandLogo({
  size = "md",
  withText = true,
  asLink = false,
  align = "center",
  className,
  imgClassName,
}: {
  size?: keyof typeof sizeMap;
  withText?: boolean;
  asLink?: boolean;
  /** Use `start` to pin mark + wordmark to the left (e.g. auth headers). */
  align?: "center" | "start";
  className?: string;
  imgClassName?: string;
}) {
  const mark = (
    <img
      src={logo}
      alt={withText ? "" : "CollegeConnect"}
      width={512}
      height={512}
      draggable={false}
      className={cn(
        sizeMap[size],
        "object-contain object-center bg-transparent",
        imgClassName,
      )}
    />
  );

  const wordmark = withText ? (
    <span
      className={cn(
        "inline-flex items-center gap-1 sm:gap-1.5 flex-wrap",
        align === "start" ? "justify-start" : "justify-center",
      )}
    >
      <span className="text-foreground font-display font-bold tracking-tight text-xl sm:text-2xl">
        College
      </span>
      <span className="gradient-text-orange text-glow-orange font-display font-bold text-xl sm:text-2xl">
        Connect
      </span>
    </span>
  ) : null;

  const inner = (
    <span
      className={cn(
        withText
          ? cn(
              "inline-flex flex-col gap-1.5 sm:gap-2",
              align === "start" ? "items-start" : "items-center",
            )
          : "inline-flex items-center",
        className,
      )}
    >
      {mark}
      {wordmark}
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className={cn(
          "inline-flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-neon-teal/50 rounded-lg",
          align === "start" ? "items-start" : "items-center",
        )}
        data-ocid="nav.link"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
