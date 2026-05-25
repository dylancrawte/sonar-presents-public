import type { ClerkAPIError } from "@clerk/types";

/** Maps Clerk sign-in API errors to short UI copy; unknown codes fall back to Clerk's message. */
export function clerkSignInErrorMessage(error: ClerkAPIError): string {
  const code = error.code ?? "";
  const param =
    error.meta && "paramName" in error.meta ? String(error.meta.paramName) : "";

  switch (code) {
    case "form_password_incorrect":
      return "Wrong password";
    case "form_identifier_not_found":
    case "identifier_not_found":
      return "No account found with this email address";
    case "form_param_format_invalid":
      if (param === "identifier" || param === "email_address") {
        return "Please enter a valid email address";
      }
      if (param === "password") {
        return "Invalid password format";
      }
      break;
    case "session_exists":
      return "You're already signed in on this device.";
    default:
      break;
  }

  return (
    error.longMessage ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

export function uniqueSignInErrorLines(errors: ClerkAPIError[]): string[] {
  const lines = errors.map(clerkSignInErrorMessage);
  return [...new Set(lines)];
}
