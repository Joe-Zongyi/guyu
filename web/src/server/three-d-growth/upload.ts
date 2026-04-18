import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureThreeDGrowthRuntime } from "./storage";

export async function saveUploadedImage(file: File) {
  await ensureThreeDGrowthRuntime();
  const extension = path.extname(file.name || "") || ".png";
  const filename = `${randomUUID()}${extension}`;
  const relativePath = path.join("runtime", "three-d-growth", "uploads", filename);
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));
  return `/${relativePath.replaceAll("\\", "/")}`;
}
