import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult = {
  path: string;
  url: string;
};

/**
 * Validates and uploads an image to Supabase storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param userId - The authenticated user's ID
 * @returns The upload result with path and public URL
 */
export async function uploadImage(
  file: File,
  bucket: "issue-images" | "meter-images",
  userId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Datei zu groß. Maximale Größe: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Ungültiger Dateityp. Erlaubt: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`
    );
  }

  // Validate file extension matches MIME type
  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
  };
  
  const allowedExtensions = mimeToExt[file.type] || [];
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error("Dateiendung stimmt nicht mit dem Dateityp überein");
  }

  // Generate secure filename with UUID
  const safeExtension = allowedExtensions[0]; // Use canonical extension
  const fileName = `${crypto.randomUUID()}.${safeExtension}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    if (import.meta.env.DEV) console.error("Upload error:", error);
    throw new Error("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
  }

  // Get a signed URL for private bucket access (expires in 1 hour)
  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 3600); // 1 hour expiration

  if (urlError || !urlData) {
    if (import.meta.env.DEV) console.error("Signed URL error:", urlError);
    throw new Error("Fehler beim Erstellen der Bild-URL.");
  }

  return {
    path: data.path,
    url: urlData.signedUrl,
  };
}

/**
 * Gets a signed URL for an image in private storage
 * @param path - The file path in storage
 * @param bucket - The storage bucket name
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if error
 */
export async function getSignedImageUrl(
  path: string,
  bucket: "issue-images" | "meter-images",
  expiresIn: number = 3600
): Promise<string | null> {
  if (!path) return null;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    if (import.meta.env.DEV) console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Deletes an image from Supabase storage
 * @param path - The file path in storage
 * @param bucket - The storage bucket name
 */
export async function deleteImage(
  path: string,
  bucket: "issue-images" | "meter-images"
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    if (import.meta.env.DEV) console.error("Delete error:", error);
    throw new Error("Fehler beim Löschen der Datei.");
  }
}
