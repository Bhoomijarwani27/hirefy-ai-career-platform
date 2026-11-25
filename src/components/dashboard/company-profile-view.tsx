"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  FileEdit,
  Globe,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COMPANY_SIZE_OPTIONS,
  companyProfileSchema,
  type CompanyProfileDTO,
} from "@/lib/company-profile";
import { formatJobDate } from "@/lib/job-validation";

interface CompanyProfileViewProps {
  initialProfile: CompanyProfileDTO;
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function CompanyProfileView({
  initialProfile,
}: CompanyProfileViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<CompanyProfileDTO>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState(initialProfile.companyName);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialProfile.logoUrl);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [industry, setIndustry] = useState(initialProfile.industry);
  const [companySize, setCompanySize] = useState(initialProfile.companySize ?? "");
  const [foundedYear, setFoundedYear] = useState(
    initialProfile.foundedYear ? String(initialProfile.foundedYear) : ""
  );
  const [website, setWebsite] = useState(initialProfile.website ?? "");

  const [officialEmail, setOfficialEmail] = useState(initialProfile.officialEmail);
  const [contactNumber, setContactNumber] = useState(
    initialProfile.contactNumber ?? ""
  );
  const [address, setAddress] = useState(initialProfile.address ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [state, setState] = useState(initialProfile.state ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "");
  const [postalCode, setPostalCode] = useState(initialProfile.postalCode ?? "");

  const [about, setAbout] = useState(initialProfile.about);
  const [missionVision, setMissionVision] = useState(
    initialProfile.missionVision ?? ""
  );
  const [culture, setCulture] = useState(initialProfile.culture ?? "");
  const [benefitsEnvironment, setBenefitsEnvironment] = useState(
    initialProfile.benefitsEnvironment ?? ""
  );

  // Validation & feedback state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [logoError, setLogoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const resetFormFromProfile = (src: CompanyProfileDTO) => {
    setCompanyName(src.companyName);
    setLogoUrl(src.logoUrl);
    setPendingLogoFile(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
    setIndustry(src.industry);
    setCompanySize(src.companySize ?? "");
    setFoundedYear(src.foundedYear ? String(src.foundedYear) : "");
    setWebsite(src.website ?? "");
    setOfficialEmail(src.officialEmail);
    setContactNumber(src.contactNumber ?? "");
    setAddress(src.address ?? "");
    setCity(src.city ?? "");
    setState(src.state ?? "");
    setCountry(src.country ?? "");
    setPostalCode(src.postalCode ?? "");
    setAbout(src.about);
    setMissionVision(src.missionVision ?? "");
    setCulture(src.culture ?? "");
    setBenefitsEnvironment(src.benefitsEnvironment ?? "");
    setFieldErrors({});
    setLogoError(null);
    setSubmitError(null);
  };

  const handleStartEdit = () => {
    resetFormFromProfile(profile);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetFormFromProfile(profile);
    setIsEditing(false);
  };

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError("Unsupported file type. Please choose a PNG, JPG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo file size must be 2 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setPendingLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setPendingLogoFile(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
    setLogoUrl(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);

    const candidatePayload = {
      companyName,
      logoUrl,
      industry,
      companySize: companySize || null,
      foundedYear: foundedYear === "" ? null : Number(foundedYear),
      website: website || null,
      officialEmail,
      contactNumber: contactNumber || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || null,
      postalCode: postalCode || null,
      about,
      missionVision: missionVision || null,
      culture: culture || null,
      benefitsEnvironment: benefitsEnvironment || null,
    };

    const parsed = companyProfileSchema.safeParse(candidatePayload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setSubmitError(
        parsed.error.issues[0]?.message ||
          "Please fix the highlighted validation errors."
      );
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoUrl = parsed.data.logoUrl;

      // Upload new logo file first if selected
      if (pendingLogoFile) {
        const formData = new FormData();
        formData.append("file", pendingLogoFile);
        const uploadRes = await fetch("/api/company/profile/logo", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Failed to upload company logo.");
        }
        finalLogoUrl = uploadJson.logoUrl;
      }

      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          logoUrl: finalLogoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(data.error || "Failed to update company profile.");
      }

      setProfile(data.profile);
      resetFormFromProfile(data.profile);
      setIsEditing(false);
      setSuccessMessage("Company profile updated successfully.");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save company profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeLogoSrc = isEditing ? logoPreviewUrl ?? logoUrl : profile.logoUrl;
  const isProfileIncomplete =
    !profile.companyName || !profile.industry || !profile.officialEmail || !profile.about;

  const inputClass = (field: string) =>
    `mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
      fieldErrors[field] ? "border-rose-500" : "border-border"
    }`;

  const textareaClass = (field: string) =>
    `mt-1.5 w-full rounded-xl border bg-background p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
      fieldErrors[field] ? "border-rose-500" : "border-border"
    }`;

  const formattedLocation = [
    profile.address,
    profile.city,
    profile.state,
    profile.postalCode,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <Link
            href="/company/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Company Dashboard
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Company Profile</span>
        </nav>

        {/* Hero Company Header */}
        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4 min-w-0">
            {activeLogoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeLogoSrc}
                alt={profile.companyName || "Company logo"}
                className="size-16 shrink-0 rounded-2xl border border-border bg-background object-cover sm:size-20"
              />
            ) : (
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-violet-500/10 text-violet-600 dark:text-violet-400 sm:size-20">
                <Building2 className="size-8" />
              </span>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {profile.companyName || "Your Company Profile"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile.industry || "Add your industry, logo, and company details"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last updated {formatJobDate(profile.updatedAt)}
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button
              type="button"
              onClick={handleStartEdit}
              className="min-h-11 shrink-0 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700 gap-2"
            >
              <FileEdit className="size-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            role="status"
            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss message"
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Incomplete Profile Notice */}
        {!isEditing && isProfileIncomplete && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                Your company profile is incomplete. Add your company name,
                industry, official email, and description so candidates know
                who you are.
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleStartEdit}
              className="min-h-9 shrink-0 rounded-xl font-semibold"
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* VIEW MODE */}
        {!isEditing ? (
          <div className="mt-6 space-y-6">
            {/* Basic Company Information */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4 text-violet-600" />
                  <span>Basic Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Company Name
                  </p>
                  <p className="mt-1 font-semibold">
                    {profile.companyName || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Industry
                  </p>
                  <p className="mt-1 font-semibold">
                    {profile.industry || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Company Size
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Users className="size-4 text-sky-600" />
                    {profile.companySize || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Founded Year
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Calendar className="size-4 text-violet-600" />
                    {profile.foundedYear || "Not specified"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Company Website
                  </p>
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 font-semibold text-violet-700 hover:underline dark:text-violet-300 break-all"
                    >
                      <Globe className="size-4 shrink-0" />
                      {profile.website}
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground">Not specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="size-4 text-sky-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-5 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Official Company Email
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-semibold break-all">
                    <Mail className="size-4 shrink-0 text-sky-600" />
                    {profile.officialEmail || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Contact Number
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Phone className="size-4 shrink-0 text-emerald-600" />
                    {profile.contactNumber || "Not specified"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Office Address
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 font-semibold">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{formattedLocation || "Not specified"}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-violet-600" />
                  <span>Company Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5 text-sm">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    About the Company
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line leading-7 text-foreground/90">
                    {profile.about || "No company overview added yet."}
                  </p>
                </div>

                {profile.missionVision && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mission and Vision
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line leading-7 text-foreground/90">
                      {profile.missionVision}
                    </p>
                  </div>
                )}

                {profile.culture && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company Culture
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line leading-7 text-foreground/90">
                      {profile.culture}
                    </p>
                  </div>
                )}

                {profile.benefitsEnvironment && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Benefits and Work Environment
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line leading-7 text-foreground/90">
                      {profile.benefitsEnvironment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* EDIT MODE */
          <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Section 1: Basic Company Information + Logo */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4 text-violet-600" />
                  <span>Basic Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Company Logo Management */}
                <div>
                  <label className="block text-sm font-semibold">
                    Company Logo{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (PNG, JPG, or WebP, max 2 MB)
                    </span>
                  </label>
                  <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                    {activeLogoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeLogoSrc}
                        alt="Company logo preview"
                        className="size-20 shrink-0 rounded-2xl border border-border bg-background object-cover"
                      />
                    ) : (
                      <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground">
                        <Building2 className="size-8" />
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoFileChange}
                        className="hidden"
                        id="company-logo-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-11 rounded-xl gap-2 font-semibold"
                      >
                        <ImagePlus className="size-4" />
                        <span>
                          {activeLogoSrc ? "Change Logo" : "Upload Logo"}
                        </span>
                      </Button>

                      {activeLogoSrc && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveLogo}
                          className="min-h-11 rounded-xl gap-2 font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                        >
                          <Trash2 className="size-4" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {logoPreviewUrl && (
                    <p className="mt-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                      New logo selected — click Save Changes to apply.
                    </p>
                  )}
                  {logoError && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {logoError}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-semibold"
                    >
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="company-name"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies"
                      className={inputClass("companyName")}
                    />
                    {fieldErrors.companyName && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldErrors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="company-industry"
                      className="block text-sm font-semibold"
                    >
                      Industry <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="company-industry"
                      type="text"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Software & AI, FinTech, Healthcare"
                      className={inputClass("industry")}
                    />
                    {fieldErrors.industry && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldErrors.industry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="company-size"
                      className="block text-sm font-semibold"
                    >
                      Company Size{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </label>
                    <select
                      id="company-size"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className={inputClass("companySize")}
                    >
                      <option value="">Select company size</option>
                      {COMPANY_SIZE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="founded-year"
                      className="block text-sm font-semibold"
                    >
                      Founded Year{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="founded-year"
                      type="number"
                      min={1800}
                      max={new Date().getFullYear()}
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      placeholder="e.g. 2019"
                      className={inputClass("foundedYear")}
                    />
                    {fieldErrors.foundedYear && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldErrors.foundedYear}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-semibold"
                    >
                      Company Website{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="company-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.company.com"
                      className={inputClass("website")}
                    />
                    {fieldErrors.website && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldErrors.website}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Contact Information */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="size-4 text-sky-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 pt-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="official-email"
                    className="block text-sm font-semibold"
                  >
                    Official Company Email{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="official-email"
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="careers@company.com"
                    className={inputClass("officialEmail")}
                  />
                  {fieldErrors.officialEmail && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {fieldErrors.officialEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-number"
                    className="block text-sm font-semibold"
                  >
                    Contact Number{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="contact-number"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className={inputClass("contactNumber")}
                  />
                  {fieldErrors.contactNumber && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {fieldErrors.contactNumber}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="company-address"
                    className="block text-sm font-semibold"
                  >
                    Address{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="company-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, suite, or building"
                    className={inputClass("address")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-city"
                    className="block text-sm font-semibold"
                  >
                    City{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="company-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className={inputClass("city")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-state"
                    className="block text-sm font-semibold"
                  >
                    State{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="company-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className={inputClass("state")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-country"
                    className="block text-sm font-semibold"
                  >
                    Country{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="company-country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className={inputClass("country")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-postal"
                    className="block text-sm font-semibold"
                  >
                    Postal Code{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="company-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 560001"
                    className={inputClass("postalCode")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Company Description */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-violet-600" />
                  <span>Company Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div>
                  <label
                    htmlFor="company-about"
                    className="block text-sm font-semibold"
                  >
                    About the Company <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="company-about"
                    rows={4}
                    required
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Share who you are, what products or services you build, and who you serve..."
                    className={textareaClass("about")}
                  />
                  {fieldErrors.about && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {fieldErrors.about}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="company-mission"
                    className="block text-sm font-semibold"
                  >
                    Mission and Vision{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="company-mission"
                    rows={3}
                    value={missionVision}
                    onChange={(e) => setMissionVision(e.target.value)}
                    placeholder="What drives your team and where are you headed?"
                    className={textareaClass("missionVision")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-culture"
                    className="block text-sm font-semibold"
                  >
                    Company Culture{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="company-culture"
                    rows={3}
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    placeholder="Describe how your teams collaborate, learn, and grow..."
                    className={textareaClass("culture")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-benefits"
                    className="block text-sm font-semibold"
                  >
                    Benefits and Work Environment{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="company-benefits"
                    rows={3}
                    value={benefitsEnvironment}
                    onChange={(e) => setBenefitsEnvironment(e.target.value)}
                    placeholder="Health coverage, flexible hours, learning stipends, remote support..."
                    className={textareaClass("benefitsEnvironment")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="min-h-11 rounded-xl px-5 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
