import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const imageUploadLimit = 8 * 1024 * 1024;
export const videoUploadLimit = 100 * 1024 * 1024;

const allowedContentTypes = new Map([
  ["image/jpeg", { extension: "jpg", maxBytes: imageUploadLimit }],
  ["image/png", { extension: "png", maxBytes: imageUploadLimit }],
  ["image/webp", { extension: "webp", maxBytes: imageUploadLimit }],
  ["image/gif", { extension: "gif", maxBytes: imageUploadLimit }],
  ["video/mp4", { extension: "mp4", maxBytes: videoUploadLimit }],
  ["video/webm", { extension: "webm", maxBytes: videoUploadLimit }],
  ["video/quicktime", { extension: "mov", maxBytes: videoUploadLimit }]
]);

interface R2Config {
  bucket: string;
  publicUrl: string;
  client: S3Client;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}.`);
  return value;
}

export function getR2Config(): R2Config {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requiredEnv("R2_BUCKET");
  const publicUrl = requiredEnv("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/$/, "");
  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  return {
    bucket,
    publicUrl,
    client: new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey }
    })
  };
}

export function getUploadRules(contentType: string) {
  return allowedContentTypes.get(contentType.toLowerCase()) ?? null;
}

export function isValidStoragePath(value: string) {
  return /^\d{4}\/[a-z0-9-]+-[0-9a-f-]{36}\.(?:jpg|png|webp|gif|mp4|webm|mov)$/.test(value);
}

export function getPublicObjectUrl(publicUrl: string, path: string) {
  return `${publicUrl}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function createR2UploadUrl(path: string, contentType: string) {
  const { bucket, client } = getR2Config();
  return getSignedUrl(client, new PutObjectCommand({
    Bucket: bucket,
    Key: path,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable"
  }), { expiresIn: 300 });
}

export async function inspectR2Object(path: string) {
  const { bucket, client } = getR2Config();
  return client.send(new HeadObjectCommand({ Bucket: bucket, Key: path }));
}

export async function deleteR2Object(path: string) {
  const { bucket, client } = getR2Config();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: path }));
}
