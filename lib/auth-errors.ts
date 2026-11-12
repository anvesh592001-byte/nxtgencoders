type AuthFlow = "signin" | "signup" | "recovery" | "resend";

type AuthFailure = {
  code?: string;
  message?: string;
  status?: number;
};

export function authErrorCode(error: AuthFailure | null | undefined) {
  return error?.code || "";
}

export function authErrorMessage(error: AuthFailure | null | undefined, flow: AuthFlow) {
  const code = authErrorCode(error);

  if (code === "email_not_confirmed") {
    return "This older account is still marked unconfirmed. Ask an administrator to activate it.";
  }
  if (code === "over_email_send_rate_limit" || code === "email_address_not_authorized") {
    return "Email delivery is disabled. Ask a NXTGENCODERS administrator for account help.";
  }
  if (code === "over_request_rate_limit") {
    return "Too many attempts were made. Please wait a few minutes and try again.";
  }
  if (code === "invalid_credentials") {
    return "Email or password is incorrect. Check both fields and try again.";
  }
  if (code === "user_already_exists" || code === "email_exists") {
    return "An account already exists for this email. Sign in or reset your password instead.";
  }
  if (code === "signup_disabled") {
    return "New registrations are temporarily unavailable.";
  }
  if (code === "weak_password") {
    return "Choose a stronger password with at least 8 characters.";
  }

  if (flow === "signin") return "Sign in is temporarily unavailable. Please try again.";
  if (flow === "signup") return "Your account could not be created. Please try again.";
  if (flow === "recovery") return "The password reset email could not be sent. Please try again later.";
  return "The verification email could not be sent. Please try again later.";
}
