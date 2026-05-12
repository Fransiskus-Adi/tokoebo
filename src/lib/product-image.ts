import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_BUCKET = "products";

function buildFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  return `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
}

async function uploadToLocalPublic(file: File, fileName: string) {
  const relativePath = `/uploads/products/${fileName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const fullPath = path.join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();

  await mkdir(uploadDir, { recursive: true });
  await writeFile(fullPath, Buffer.from(bytes));

  return relativePath;
}

async function uploadToSupabaseStorage(file: File, fileName: string) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS || DEFAULT_BUCKET;
  const objectPath = `products/${fileName}`;
  const bytes = await file.arrayBuffer();
  const supabase = getSupabaseAdmin();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, Buffer.from(bytes), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed uploading image to Supabase Storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL from Supabase Storage.");
  }

  return data.publicUrl;
}

export async function saveProductImage(file: File) {
  const fileName = buildFileName(file.name);

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return uploadToSupabaseStorage(file, fileName);
  }

  try {
    return await uploadToLocalPublic(file, fileName);
  } catch {
    return uploadToSupabaseStorage(file, fileName);
  }
}

