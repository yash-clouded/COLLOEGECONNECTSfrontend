import { CheckCircle, Upload, X } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

type Variant = "orange" | "teal";

const VARIANT_BORDER: Record<Variant, string> = {
  orange:
    "border-border hover:border-neon-orange hover:text-neon-orange focus:border-neon-orange",
  teal: "border-border hover:border-neon-teal hover:text-neon-teal focus:border-neon-teal",
};

export function CollegeIdImageUploadBox({
  label,
  preview,
  onUpload,
  onRemove,
  variant = "orange",
}: {
  label: string;
  preview: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  variant?: Variant;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const borderClass = VARIANT_BORDER[variant];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="flex flex-col gap-1 flex-1">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-green-500 h-32">
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-all"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-1 left-1 bg-green-500/80 rounded-full px-2 py-0.5 text-xs text-white flex items-center gap-1">
            <CheckCircle size={10} /> Uploaded
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground transition-all duration-300 cursor-pointer ${borderClass}`}
        >
          <Upload size={20} />
          <span className="text-xs">Click to upload</span>
          <span className="text-xs opacity-60">JPG, PNG, WebP (max 5MB)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
