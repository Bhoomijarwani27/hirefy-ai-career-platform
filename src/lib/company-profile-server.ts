import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import {
  serializeCompanyProfile,
  type CompanyProfileDTO,
} from "@/lib/company-profile";

export async function getCompanyProfileDTO(
  userId: string
): Promise<CompanyProfileDTO> {
  const profile = await getOrCreateCompanyProfile(userId);
  return serializeCompanyProfile(profile);
}
