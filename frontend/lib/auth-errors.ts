type FirebaseErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/email-already-exists"
  | "auth/invalid-action-code"
  | "auth/invalid-verification-code"
  | "auth/missing-verification-code"
  | "auth/expired-action-code"
  | "auth/requires-recent-login"
  | string

export function getAuthErrorMessage(error: { code?: FirebaseErrorCode; message: string }) {
  switch (error.code) {
    case "auth/email-already-in-use":
    case "auth/email-already-exists":
      return "This email is already registered. Please sign in or use a different email."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/operation-not-allowed":
      return "This sign-in method is not allowed. Please contact support."
    case "auth/weak-password":
      return "Please choose a stronger password."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    case "auth/invalid-action-code":
    case "auth/invalid-verification-code":
    case "auth/missing-verification-code":
      return "The verification link is invalid or has expired. Please request a new one."
    case "auth/expired-action-code":
      return "The verification link has expired. Please request a new one."
    case "auth/requires-recent-login":
      return "This action requires you to sign in again for security reasons."
    default:
      return error.message || "An unexpected error occurred. Please try again."
  }
}

export function isAuthError(error: any): error is { code: FirebaseErrorCode; message: string } {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string"
}

export function formatAuthError(error: any): string {
  if (isAuthError(error)) {
    return getAuthErrorMessage(error)
  }
  return "An unexpected error occurred. Please try again."
}