import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { auth } from "@/lib/auth";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";

export const runtime = "nodejs";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

function hasValidImageSignature(buf: Buffer, mime: string): boolean {
  if (buf.length < 12) return false;
  if (mime === "image/png") {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    );
  }
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mime === "image/webp") {
    return (
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "RECRUITER") {
    return NextResponse.json(
      { error: "Forbidden: Recruiter access only" },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please select an image file to upload." },
      { status: 400 }
    );
  }

  const ext = ALLOWED_MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported format. Please upload a PNG, JPG, or WebP image." },
      { status: 400 }
    );
  }

  if (file.size === 0 || file.size > MAX_LOGO_BYTES) {
    return NextResponse.json(
      { error: "Logo image must be between 1 byte and 2 MB." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(session.user.id);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasValidImageSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "The uploaded file does not appear to be a valid PNG, JPG, or WebP image." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "company-logos"
    );
    await mkdir(uploadDir, { recursive: true });

    // Remove previous local logo if it was stored by this endpoint
    if (company.logoUrl?.startsWith("/api/company/profile/logo/")) {
      const oldName = path.basename(company.logoUrl);
      if (oldName && oldName.startsWith(`${company.id}-`)) {
        await unlink(path.join(uploadDir, oldName)).catch(() => {});
      }
    }

    const filename = `${company.id}-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      logoUrl: `/api/company/profile/logo/${filename}`,
    });
  } catch (error) {
    console.error("POST /api/company/profile/logo error:", error);
    return NextResponse.json(
      { error: "Failed to upload company logo." },
      { status: 500 }
    );
  }
}
