import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

type Variant = "teal" | "orange";

const focusRing: Record<Variant, string> = {
  teal: "focus:border-neon-teal",
  orange: "focus:border-neon-orange",
};

const iconHover: Record<Variant, string> = {
  teal: "text-muted-foreground hover:text-neon-teal focus-visible:outline-neon-teal",
  orange:
    "text-muted-foreground hover:text-neon-orange focus-visible:outline-neon-orange",
};

export function PasswordField({
  id: idProp,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  disabled,
  variant = "teal",
  name,
  autoComplete,
  className,
}: {
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: Variant;
  name?: string;
  autoComplete?: string;
  className?: string;
}) {
  const uid = useId();
  const id = idProp ?? `pwd-${uid}`;
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-background border border-border rounded-xl py-2 pl-4 pr-11 text-sm text-foreground",
            "focus:outline-none transition-colors disabled:opacity-60",
            focusRing[variant],
          )}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            iconHover[variant],
            disabled && "pointer-events-none opacity-40",
          )}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
