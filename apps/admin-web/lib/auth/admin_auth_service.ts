import { apiRequest } from "@/lib/api/client";

export type LoginRequestResponse = {
  message: string;
  otp_channel: "sms" | "email";
};

export type VerifyLoginOtpResponse = {
  requires_setup: boolean;
  token_type: string;
  session_token?: string;
  refresh_token?: string;
  setup_token?: string;
};

export type TokenResponse = {
  token_type: string;
  session_token: string;
  refresh_token?: string;
};

export async function requestAdminLogin(
  email: string,
  password: string,
): Promise<LoginRequestResponse> {
  return apiRequest<LoginRequestResponse>("/auth/login-request", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function verifyAdminLoginOtp(
  email: string,
  otpCode: string,
): Promise<VerifyLoginOtpResponse> {
  return apiRequest<VerifyLoginOtpResponse>("/auth/login-verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp_code: otpCode,
    }),
  });
}

export async function completeAdminFirstLogin(
  setupToken: string,
  newPassword: string,
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/complete-first-login", {
    method: "POST",
    token: setupToken,
    body: JSON.stringify({
      new_password: newPassword,
    }),
  });
}

export async function refreshAdminSession(
  refreshToken: string,
): Promise<{ session_token: string; token_type: string }> {
  return apiRequest("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });
}

export async function requestPasswordChangeOtp(
  currentPassword: string,
  newPassword: string,
  token: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/change-password-request", {
    method: "POST",
    token,
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  otpCode: string,
  token: string,
): Promise<{ message: string }> {
  return apiRequest("/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      otp_code: otpCode,
    }),
  });
}
