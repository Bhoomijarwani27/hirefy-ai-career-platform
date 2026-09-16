-- Better Auth schema (replaces NextAuth-style Account/Session/OtpToken)

ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "CandidateProfile" DROP CONSTRAINT IF EXISTS "CandidateProfile_userId_fkey";
ALTER TABLE "CompanyProfile" DROP CONSTRAINT IF EXISTS "CompanyProfile_userId_fkey";

DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "OtpToken";
DROP TYPE IF EXISTS "OtpType";

ALTER TABLE "User" DROP COLUMN IF EXISTS "password";

ALTER TABLE "User" ADD COLUMN "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "emailVerified_new" = ("emailVerified" IS NOT NULL);
ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";

ALTER TABLE "User" RENAME TO "user";

CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
