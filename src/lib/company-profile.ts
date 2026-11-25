import { z } from "zod";

export const COMPANY_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
] as const;

export interface CompanyProfileDTO {
  id: string;
  userId: string;
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  industry: string;
  companySize: string | null;
  foundedYear: number | null;
  officialEmail: string;
  contactNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  about: string;
  missionVision: string | null;
  culture: string | null;
  benefitsEnvironment: string | null;
  updatedAt: string;
}

const optionalTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null));

const currentYear = new Date().getFullYear();

export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(120, "Company name must be 120 characters or fewer."),
  logoUrl: optionalTrimmed(500, "Logo URL"),
  industry: z
    .string()
    .trim()
    .min(2, "Industry is required.")
    .max(100, "Industry must be 100 characters or fewer."),
  companySize: optionalTrimmed(60, "Company size"),
  foundedYear: z
    .union([
      z.coerce
        .number()
        .int("Founded year must be a valid year.")
        .min(1800, "Founded year must be 1800 or later.")
        .max(currentYear, `Founded year cannot be later than ${currentYear}.`),
      z.null(),
      z.literal(""),
    ])
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val)),
  website: z
    .string()
    .trim()
    .max(250, "Website URL must be 250 characters or fewer.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message:
          "Please enter a valid website URL starting with https:// or http://.",
      }
    ),
  officialEmail: z
    .string()
    .trim()
    .email("Please enter a valid official company email address.")
    .max(160, "Official email must be 160 characters or fewer."),
  contactNumber: z
    .string()
    .trim()
    .max(30, "Contact number must be 30 characters or fewer.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
    .refine(
      (val) => {
        if (!val) return true;
        return /^[+]?[\d\s().-]{7,20}$/.test(val);
      },
      {
        message:
          "Please enter a valid phone number (7–20 digits, optional +, spaces, or dashes).",
      }
    ),
  address: optionalTrimmed(200, "Address"),
  city: optionalTrimmed(100, "City"),
  state: optionalTrimmed(100, "State"),
  country: optionalTrimmed(100, "Country"),
  postalCode: optionalTrimmed(25, "Postal code"),
  about: z
    .string()
    .trim()
    .min(20, "About the company must be at least 20 characters.")
    .max(5000, "About the company must be 5,000 characters or fewer."),
  missionVision: optionalTrimmed(3000, "Mission and vision"),
  culture: optionalTrimmed(3000, "Company culture"),
  benefitsEnvironment: optionalTrimmed(3000, "Benefits and work environment"),
});

export type CompanyProfileParsed = z.output<typeof companyProfileSchema>;

export function serializeCompanyProfile(profile: {
  id: string;
  userId: string;
  companyName: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  foundedYear: number | null;
  officialEmail: string | null;
  contactNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  about: string | null;
  missionVision: string | null;
  culture: string | null;
  benefitsEnvironment: string | null;
  updatedAt: Date;
}): CompanyProfileDTO {
  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName ?? "",
    logoUrl: profile.logoUrl ?? null,
    website: profile.website ?? null,
    industry: profile.industry ?? "",
    companySize: profile.companySize ?? null,
    foundedYear: profile.foundedYear ?? null,
    officialEmail: profile.officialEmail ?? "",
    contactNumber: profile.contactNumber ?? null,
    address: profile.address ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    country: profile.country ?? null,
    postalCode: profile.postalCode ?? null,
    about: profile.about ?? "",
    missionVision: profile.missionVision ?? null,
    culture: profile.culture ?? null,
    benefitsEnvironment: profile.benefitsEnvironment ?? null,
    updatedAt: profile.updatedAt.toISOString(),
  };
}
