// Use environment variable for production, or fallback to empty (Vite proxy) for local development.
const API_URL = import.meta.env.VITE_REST_API_URL || "";

function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = API_URL.replace(/\/$/, "");
  return base ? `${base}${p}` : p;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const endpoint = (() => {
      try {
        return new URL(res.url).pathname || res.url;
      } catch {
        return res.url || "unknown endpoint";
      }
    })();
    throw new Error(
      `API returned non-JSON response for ${endpoint}. Configure VITE_REST_API_URL to your backend URL.`,
    );
  }
  return (await res.json()) as T;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    const d = data.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      return d
        .map((x) =>
          typeof x === "object" && x && "msg" in x
            ? String((x as { msg: string }).msg)
            : String(x),
        )
        .join("; ");
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`;
}

/** Response from POST /api/students or /api/advisors after MongoDB insert. */
export type RegisteredProfileResponse = {
  id: string;
  name: string;
  created_at: string;
  email?: string;
  college_email?: string;
};

export type AdvisorProfileResponse = {
  id: string;
  name: string;
  college_email: string;
  personal_email?: string;
  gender?: string;
  detected_college: string;
  branch: string;
  phone?: string;
  state?: string;
  upi_id?: string;
  date_of_birth?: string;
  roll_number?: string;
  jee_mains_percentile?: string;
  jee_mains_rank?: string;
  jee_advanced_rank?: string;
  bio?: string;
  skills?: string;
  achievements?: string;
  languages: string[];
  preferred_timezones?: string[];
  session_price: string;
  current_study_year?: number;
  study_year_at_signup?: number;
  study_year_anchor_date?: string;
  created_at?: string;
  total_earnings?: number;
  total_sessions?: number;
  total_students?: number;
  college_id_front_key?: string;
  college_id_back_key?: string;
};

export type ReferralSummaryResponse = {
  ok: boolean;
  referral_code: string;
  attended_sessions: number;
  can_refer: boolean;
  total_referrals: number;
  program_note: string;
  /** Advisor: cumulative �� from 3% on referred advisors�" sessions (up to 5 each). */
  referral_earnings_inr?: number;
  /** Student: cumulative �� value credited from referrals (discounts / student� advisor rewards). */
  referral_rewards_inr?: number;
};

export type StudentProfileResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state: string;
  academic_status: string;
  jee_mains_percentile: string;
  jee_mains_rank: string;
  jee_advanced_rank?: string;
  languages?: string[];
  language_other?: string;
  total_spent?: number;
  total_sessions?: number;
};

export type AdvisorDirectoryItem = {
  id: string;
  name: string;
  college?: string;
  detected_college?: string;
  branch: string;
  session_price: string;
  current_study_year?: number;
  study_year_at_signup?: number;
  study_year_anchor_date?: string;
  created_at?: string;
  bio?: string;
  languages: string[];
  preferred_timezones?: string[];
  jee_mains_rank?: string;
  college_id_front_key?: string;
};

/** Public advisor profile from GET /api/advisors/id/{id} (Mongo fields, snake_case after normalize). */
export type AdvisorPublicDetail = {
  id: string;
  name?: string;
  gender?: string;
  detected_college?: string;
  branch?: string;
  state?: string;
  bio?: string;
  languages?: string[];
  language_other?: string;
  session_price?: string;
  preferred_timezones?: string[];
  jee_mains_percentile?: string;
  jee_mains_rank?: string;
  jee_advanced_rank?: string;
  current_study_year?: number;
  study_year_at_signup?: number;
  study_year_anchor_date?: string;
  created_at?: string;
};

export type PasswordResetRole = "student" | "advisor";

export async function requestPasswordResetOtp(
  role: PasswordResetRole,
  email: string,
): Promise<{ ok: boolean; expires_in_seconds: number }> {
  const res = await fetch(url("/api/auth/password-reset/request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean; expires_in_seconds: number }>(res);
}

export async function confirmPasswordResetOtp(
  role: PasswordResetRole,
  email: string,
  otp: string,
  newPassword: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/auth/password-reset/confirm"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email, otp, new_password: newPassword }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

/** POST `/api/auth/signup-otp/request`  -  Resend emails OTP; no Firebase user yet. */
export async function requestSignupOtp(
  role: PasswordResetRole,
  email: string,
): Promise<{ ok: boolean; expires_in_seconds: number }> {
  const res = await fetch(url("/api/auth/signup-otp/request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean; expires_in_seconds: number }>(res);
}

/** POST `/api/auth/signup-otp/verify`  -  checks OTP, creates Firebase user (email verified). */
export async function verifySignupOtp(
  role: PasswordResetRole,
  email: string,
  otp: string,
  password: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/auth/signup-otp/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email, otp, password }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export type BookingResponse = {
  id: string;
  advisor_id: string;
  student_id: string;
  advisor_name: string;
  student_name: string;
  student_email: string;
  scheduled_time: string;
  end_time: string;
  selected_slot: string;
  session_price: string;
  status: "pending" | "confirmed" | "cancelled" | "finalized" | "changed";
  google_event_id?: string;
  meet_link?: string;
  student_joined: boolean;
  advisor_joined: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  key?: string; // Optional: Backend might return the Razorpay key
};

export type PaymentVerificationResponse = {
  ok: boolean;
  message?: string;
};

export async function registerStudent(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<RegisteredProfileResponse> {
  const res = await fetch(url("/api/students"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<RegisteredProfileResponse>(res);
}

export async function registerAdvisor(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<RegisteredProfileResponse> {
  const res = await fetch(url("/api/advisors"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<RegisteredProfileResponse>(res);
}

export async function getMyAdvisorProfile(
  firebaseIdToken: string,
): Promise<AdvisorProfileResponse> {
  const res = await fetch(url("/api/advisors/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorProfileResponse>(res);
}

export async function updateMyAdvisorProfile(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<AdvisorProfileResponse> {
  const res = await fetch(url("/api/advisors/me"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorProfileResponse>(res);
}

export async function getMyStudentProfile(
  firebaseIdToken: string,
): Promise<StudentProfileResponse> {
  const res = await fetch(url("/api/students/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<StudentProfileResponse>(res);
}

export async function updateMyStudentProfile(
  firebaseIdToken: string,
  body: Record<string, unknown>,
): Promise<StudentProfileResponse> {
  const res = await fetch(url("/api/students/me"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<StudentProfileResponse>(res);
}

export async function getAdvisorsDirectory(): Promise<AdvisorDirectoryItem[]> {
  const res = await fetch(url("/api/advisors/list"), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorDirectoryItem[]>(res);
}

export async function getAdvisorById(
  advisorId: string,
): Promise<AdvisorPublicDetail> {
  const res = await fetch(url(`/api/advisors/id/${encodeURIComponent(advisorId)}`), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<AdvisorPublicDetail>(res);
}

export async function bookAdvisorSession(
  firebaseIdToken: string,
  advisorId: string,
  selectedSlot: string,
  selectedDate: string,
): Promise<{
  ok: boolean;
  advisor_email?: string;
  selected_slot?: string;
  email_sent?: boolean;
  email_error?: string;
}> {
  const res = await fetch(url("/api/advisors/book"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify({ advisor_id: advisorId, selected_slot: selectedSlot, selected_date: selectedDate }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return await parseJsonOrThrow<{
    ok: boolean;
    advisor_email?: string;
    selected_slot?: string;
    email_sent?: boolean;
    email_error?: string;
  }>(res);
}

export async function notifyStudentSessionUpdate(
  firebaseIdToken: string,
  payload: {
    booking_id: string;
    action: "accept" | "reject" | "change";
    student_email: string;
    student_name: string;
    old_slot: string;
    new_slot?: string;
  },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/advisors/sessions/notify-student"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function notifyAdvisorFinalSlot(
  firebaseIdToken: string,
  payload: {
    advisor_id: string;
    old_slot: string;
    new_slot: string;
  },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/students/sessions/notify-advisor-final-slot"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function createBooking(
  firebaseIdToken: string,
  payload: {
    advisor_id: string;
    student_id: string;
    advisor_name: string;
    student_name: string;
    student_email: string;
    scheduled_time: string;
    end_time: string;
    selected_slot: string;
    session_price: string;
  },
): Promise<BookingResponse> {
  const res = await fetch(url("/api/bookings"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse>(res);
}

export async function getMyBookings(firebaseIdToken: string): Promise<BookingResponse[]> {
  const res = await fetch(url("/api/bookings/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse[]>(res);
}

export async function getBookingById(
  firebaseIdToken: string,
  bookingId: string,
): Promise<BookingResponse> {
  const res = await fetch(url(`/api/bookings/${bookingId}`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<BookingResponse>(res);
}

export async function joinBookingAction(
  firebaseIdToken: string,
  bookingId: string,
): Promise<{ message: string }> {
  const res = await fetch(url(`/api/bookings/${bookingId}/join`), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ message: string }>(res);
}

export async function reportNoShowAction(
  firebaseIdToken: string,
  bookingId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(url(`/api/bookings/${bookingId}/report-noshow`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firebaseIdToken}`,
    },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean; message?: string }>(res);
}

// S3 & Referral functions added from upstream updates



export async function uploadProfilePictureToS3(
  firebaseIdToken: string,
  role: "advisor" | "student",
  file: File,
): Promise<string> {
  const res = await fetch(url("/api/upload/profile-picture/presign"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify({ role, contentType: file.type }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const { uploadUrl, key } = await res.json();
  const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!putRes.ok) throw new Error("Could not upload profile picture to S3 storage.");
  return key;
}

export async function uploadCollegeIdPairToS3(
  firebaseIdToken: string,
  front: File,
  back: File,
): Promise<{ frontKey: string; backKey: string }> {
  try {
    // 1. Get presigned URLs for both
    const res = await fetch(url("/api/upload/college-id/presign-pair"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({
        frontContentType: front.type,
        backContentType: back.type,
      }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorMessage(res));
    }

    const { frontUploadUrl, frontKey, backUploadUrl, backKey } = await res.json();

    // 2. Upload to S3
    const [frontRes, backRes] = await Promise.all([
      fetch(frontUploadUrl, { method: "PUT", body: front }),
      fetch(backUploadUrl, { method: "PUT", body: back }),
    ]);

    if (!frontRes.ok || !backRes.ok) {
      throw new Error("Could not upload ID cards to S3 storage.");
    }

    return { frontKey, backKey };
  } catch (err) {
    console.error("uploadCollegeIdPairToS3 failed:", err);
    throw err;
  }
}

export async function getAdvisorReferralSummary(
  firebaseIdToken: string,
): Promise<ReferralSummaryResponse> {
  const res = await fetch(url("/api/advisors/referrals/summary"), {
    method: "GET",
    headers: { Authorization: `Bearer ${firebaseIdToken}` },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<ReferralSummaryResponse>(res);
}

export async function createAdvisorReferral(
  firebaseIdToken: string,
  body: { referred_email: string; referred_role?: string },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/advisors/referrals/create"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function getStudentReferralSummary(
  firebaseIdToken: string,
): Promise<ReferralSummaryResponse> {
  const res = await fetch(url("/api/students/referrals/summary"), {
    method: "GET",
    headers: { Authorization: `Bearer ${firebaseIdToken}` },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<ReferralSummaryResponse>(res);
}

export async function createStudentReferral(
  firebaseIdToken: string,
  body: { referred_email: string; referred_role: "student" | "advisor" },
): Promise<{ ok: boolean }> {
  const res = await fetch(url("/api/students/referrals/create"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<{ ok: boolean }>(res);
}

export async function createPaymentOrder(
  firebaseIdToken: string,
  amount: number,
  currency = "INR",
): Promise<PaymentOrderResponse> {
  const res = await fetch(url("/api/payments/create-order"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify({ amount, currency }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<PaymentOrderResponse>(res);
}

export async function verifyPayment(
  firebaseIdToken: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
): Promise<PaymentVerificationResponse> {
  const res = await fetch(url("/api/payments/verify-payment"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return await parseJsonOrThrow<PaymentVerificationResponse>(res);
}

export async function syncBookingStatus(firebaseIdToken: string, bookingId: string) {
  const res = await fetch(url(`/api/payments/sync-status/${bookingId}`), {
    method: "POST",
    headers: { Authorization: `Bearer ${firebaseIdToken}` },
  });
  return await parseJsonOrThrow<{ ok: boolean; message?: string }>(res);
}
