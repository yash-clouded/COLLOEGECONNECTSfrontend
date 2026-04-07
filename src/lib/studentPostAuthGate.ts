/**
 * Temporary gate: when true, students are sent to `/pending` after sign-in / completed sign-up
 * instead of the dashboard. Set to `false` to restore the previous behavior.
 */
export const isUnderReview = false;

export type StudentPostAuthPath = "/pending" | "/student/dashboard";

export function studentPostAuthPath(): StudentPostAuthPath {
  return isUnderReview ? "/pending" : "/student/dashboard";
}
