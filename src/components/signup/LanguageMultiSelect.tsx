"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  OTHER_LANGUAGE_LABEL,
  SIGNUP_LANGUAGE_OPTIONS,
} from "@/constants/signupLanguages";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useId } from "react";

type Variant = "teal" | "orange";

type Props = {
  variant: Variant;
  label: string;
  optionalHint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  otherDetail: string;
  onOtherDetailChange: (v: string) => void;
};

export function LanguageMultiSelect({
  variant,
  label,
  optionalHint,
  value,
  onChange,
  otherDetail,
  onOtherDetailChange,
}: Props) {
  const otherFieldId = useId();
  const focusBorder =
    variant === "teal" ? "focus:border-neon-teal" : "focus:border-neon-orange";

  const toggle = (lang: string) => {
    if (value.includes(lang)) {
      onChange(value.filter((x) => x !== lang));
      if (lang === OTHER_LANGUAGE_LABEL) onOtherDetailChange("");
    } else {
      onChange([...value, lang]);
    }
  };

  const summary =
    value.length === 0
      ? "Select languages…"
      : value.length <= 2
        ? value.join(", ")
        : `${value.length} languages selected`;

  const showOther = value.includes(OTHER_LANGUAGE_LABEL);

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-normal text-muted-foreground">
        {label}{" "}
        {optionalHint ? <span className="text-xs">{optionalHint}</span> : null}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-auto min-h-10 w-full justify-between rounded-xl border-border bg-background px-4 py-2 font-normal text-foreground hover:bg-background",
              focusBorder,
            )}
          >
            <span className="line-clamp-2 text-left text-sm">{summary}</span>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="start">
          <ScrollArea className="h-[min(60vh,320px)] p-2">
            <div className="flex flex-col gap-2 pr-3">
              {SIGNUP_LANGUAGE_OPTIONS.map((lang, index) => (
                <label
                  key={lang}
                  htmlFor={`signup-lang-opt-${index}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    id={`signup-lang-opt-${index}`}
                    checked={value.includes(lang)}
                    onCheckedChange={() => toggle(lang)}
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {showOther ? (
        <div className="mt-1 flex flex-col gap-1">
          <Label
            htmlFor={otherFieldId}
            className="text-xs text-muted-foreground"
          >
            Specify language(s) for “Other”{" "}
            <span
              className={
                variant === "teal" ? "text-neon-teal" : "text-neon-orange"
              }
            >
              •
            </span>
          </Label>
          <input
            id={otherFieldId}
            type="text"
            placeholder="e.g. Sign language, regional dialect…"
            value={otherDetail}
            onChange={(e) => onOtherDetailChange(e.target.value)}
            className={cn(
              "rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none",
              focusBorder,
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
