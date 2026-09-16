import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const authBaseURL =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "http://localhost:3000";

function env(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

// OAuth credentials
const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");

const githubClientId = env(
  "GITHUB_CLIENT_ID",
  "Github__CLIENT_ID"
);

const githubClientSecret = env(
  "GITHUB_CLIENT_SECRET",
  "Github__CLIENT_SECRET"
);

// Social providers
const socialProviders: NonNullable<
  Parameters<typeof betterAuth>[0]["socialProviders"]
> = {};

// Google
if (googleClientId && googleClientSecret) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  };
}

// GitHub
if (
  githubClientId &&
  githubClientSecret &&
  !githubClientId.includes("googleusercontent.com")
) {
  socialProviders.github = {
    clientId: githubClientId,
    clientSecret: githubClientSecret,
  };
}

export const auth = betterAuth({
  // Database
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Better Auth secret
  secret: process.env.BETTER_AUTH_SECRET,

  // Base URL
  baseURL: authBaseURL,

  // Trusted origins
  trustedOrigins: [
    authBaseURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

  // Email + Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Google + GitHub
  socialProviders,

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  // Additional user fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CANDIDATE",
        input: true,
      },
    },
  },

  // Email OTP
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 15 * 60,

      async sendVerificationOTP({ email, otp, type }) {
        if (!process.env.RESEND_API_KEY) {
          throw new Error("RESEND_API_KEY is missing in .env");
        }

        const isReset = type === "forget-password";

        const subject = isReset
          ? "Reset your Hirefy AI password"
          : "Verify your Hirefy AI email address";

        const { error } = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 480px;
                margin: 0 auto;
                padding: 24px;
              "
            >
              <h2>
                ${isReset ? "Reset Password" : "Email Verification"}
              </h2>

              <p>Your verification code:</p>

              <p
                style="
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 6px;
                "
              >
                ${otp}
              </p>

              <p>Expires in 15 minutes.</p>
            </div>
          `,
        });

        if (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  // Automatically create candidate/recruiter profile
  // when a new user is created.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const role =
            (user as { role?: string }).role ?? "CANDIDATE";

          try {
            if (role === "RECRUITER") {
              await prisma.companyProfile.create({
                data: {
                  userId: user.id,
                },
              });
            } else {
              await prisma.candidateProfile.create({
                data: {
                  userId: user.id,
                },
              });
            }
          } catch {
            // Profile may already exist.
          }
        },
      },
    },
  },
});