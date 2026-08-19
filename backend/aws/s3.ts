import "dotenv/config";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET;

if (!region) {
  throw new Error("AWS_REGION is missing");
}

if (!bucket) {
  throw new Error("S3_BUCKET is missing");
}

const bucketName: string = bucket;
const s3 = new S3Client({ region });

export type S3ObjectLocation = {
  bucket: string;
  key: string;
};

export async function uploadDocumentToS3(
  file: Express.Multer.File,
): Promise<S3ObjectLocation> {
  const extension = extname(file.originalname).toLowerCase();
  const key = `analyses/${randomUUID()}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return { bucket: bucketName, key };
}

export async function deleteDocumentFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

export async function getDocumentFromS3(key: string) {
  return s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
