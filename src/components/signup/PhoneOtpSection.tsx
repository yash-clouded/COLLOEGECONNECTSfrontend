"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader, Smartphone } from "lucide-react";

type Variant = "teal" | "orange";

type Props = {
  /** Use `"student"` on student sign-up and `"advisor"` on advisor sign-up (unique field ids). */
  idPrefix: "student" | "advisor";
  variant: Variant;
  phone: string;
  onPhoneChange: (value: string) => void;
  otp: string;
  onOtpChange: (value: string) => void;
  otpSent: boolean;
  otpSending: boolean;
  onSendOtp: () => void;
};

export function PhoneOtpSection({
  idPrefix,
  variant,
  phone,
  onPhoneChange,
  otp,
  onOtpChange,
  otpSent,
  otpSending,
  onSendOtp,
}: Props) {
  const phoneInputId = `${idPrefix}-signup-phone`;
  const accent =
    variant === "teal"
      ? "border-neon-teal focus:border-neon-teal"
      : "border-neon-orange focus:border-neon-orange";
  const btnClass =
    variant === "teal"
      ? "bg-neon-teal hover:bg-neon-teal/80 text-black"
      : "bg-neon-orange hover:bg-neon-orange/80 text-black";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-muted-foreground" htmlFor={phoneInputId}>
        Phone number <span className={variant === "teal" ? "text-neon-teal" : "text-neon-orange"}>•</span>
      </label>
      <div className="flex gap-2">
        <input
          id={phoneInputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 XXXXX XXXXX"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={cn(
            "min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none",
            accent,
          )}
        />
        <Button
          type="button"
          disabled={otpSending || !phone.trim()}
          onClick={onSendOtp}
          className={cn("shrink-0 rounded-xl px-4 font-semibold", btnClass)}
        >
          {otpSending ? (
            <>
              <Loader size={14} className="mr-1 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Smartphone size={14} className="mr-1" />
              Send code
            </>
          )}
        </Button>
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <p className="text-xs text-muted-foreground" id={`${idPrefix}-phone-otp-hint`}>
          Enter the 6-digit code sent to your phone (SMS). Connect Firebase to send real messages.
        </p>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={onOtpChange}
          disabled={!otpSent}
          pattern={REGEXP_ONLY_DIGITS}
          containerClassName="justify-start"
          aria-describedby={`${idPrefix}-phone-otp-hint`}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {!otpSent ? (
          <p className="text-xs text-muted-foreground/80">Tap &quot;Send code&quot; to enable OTP entry.</p>
        ) : null}
      </div>
    </div>
  );
}
