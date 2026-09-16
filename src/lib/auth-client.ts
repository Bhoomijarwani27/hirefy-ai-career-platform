"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

function getClientBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
