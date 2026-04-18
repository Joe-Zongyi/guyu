import { createHash, createHmac } from "node:crypto";
import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_HOST = "ai3d.tencentcloudapi.com";
const API_ENDPOINT = `https://${API_HOST}`;
const API_VERSION = "2025-05-13";
const ALLOWED_VIEWS = new Set([
  "left",
  "right",
  "back",
  "top",
  "bottom",
  "left_front",
  "right_front",
]);

type SubmitAction = "SubmitHunyuanTo3DRapidJob" | "SubmitHunyuanTo3DProJob";
type QueryAction = "QueryHunyuanTo3DRapidJob" | "QueryHunyuanTo3DProJob";

type TencentApiResult = {
  Response?: Record<string, unknown>;
};

type UploadImage = {
  name: string;
  bytes: Buffer;
  view?: string;
};

export type HunyuanSubmitInput = {
  images: UploadImage[];
  prompt?: string;
  engine?: "rapid" | "pro";
  model?: "3.0" | "3.1";
  enablePbr?: boolean;
  region?: string;
};

export type HunyuanSubmitResult = {
  jobId: string;
  queryAction: QueryAction;
  region: string;
  imageName: string;
};

type TencentEnv = {
  secretId: string;
  secretKey: string;
  region: string;
};

function sha256Hex(content: Buffer | string) {
  return createHash("sha256").update(content).digest("hex");
}

function hmacSha256(key: Buffer | string, msg: string) {
  return createHmac("sha256", key).update(msg, "utf8").digest();
}

async function loadTencentEnv(): Promise<TencentEnv> {
  const repoEnvPath = path.resolve(process.cwd(), "..", ".env");
  const envFromFile: Record<string, string> = {};

  try {
    await access(repoEnvPath);
    const raw = await readFile(repoEnvPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }
      const [key, ...rest] = trimmed.split("=");
      envFromFile[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // ignore missing repo-level .env
  }

  const secretId = process.env.TENCENT_SECRET_ID || envFromFile.TENCENT_SECRET_ID || "";
  const secretKey = process.env.TENCENT_SECRET_KEY || envFromFile.TENCENT_SECRET_KEY || "";
  const region = process.env.TENCENT_REGION || envFromFile.TENCENT_REGION || "ap-guangzhou";

  if (!secretId || !secretKey) {
    throw new Error("缺少腾讯云凭证，请在仓库根目录 .env 中配置 TENCENT_SECRET_ID / TENCENT_SECRET_KEY");
  }

  return { secretId, secretKey, region };
}

function buildTc3Headers(
  action: string,
  payload: Buffer,
  secretId: string,
  secretKey: string,
  region: string,
) {
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000).toString();
  const date = now.toISOString().slice(0, 10);
  const service = "ai3d";
  const algorithm = "TC3-HMAC-SHA256";
  const canonicalHeaders =
    "content-type:application/json; charset=utf-8\n" +
    `host:${API_HOST}\n` +
    `x-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = "content-type;host;x-tc-action";
  const canonicalRequest = [
    "POST",
    "/",
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    sha256Hex(Buffer.from(canonicalRequest, "utf8")),
  ].join("\n");
  const secretDate = hmacSha256(`TC3${secretKey}`, date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, "tc3_request");
  const signature = createHmac("sha256", secretSigning).update(stringToSign, "utf8").digest("hex");
  const authorization =
    `${algorithm} Credential=${secretId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    "Content-Type": "application/json; charset=utf-8",
    Host: API_HOST,
    "X-TC-Action": action,
    "X-TC-Version": API_VERSION,
    "X-TC-Timestamp": timestamp,
    "X-TC-Region": region,
  };
}

async function tencentApiRequest<T extends Record<string, unknown>>(
  action: string,
  payloadObject: T,
  env: TencentEnv,
) {
  const payload = Buffer.from(JSON.stringify(payloadObject), "utf8");
  const headers = buildTc3Headers(action, payload, env.secretId, env.secretKey, env.region);
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers,
    body: payload,
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: TencentApiResult;
  try {
    parsed = JSON.parse(text) as TencentApiResult;
  } catch {
    throw new Error(`腾讯云返回了非 JSON 响应：${text}`);
  }

  if (!response.ok) {
    throw new Error(`腾讯云请求失败（${response.status}）：${text}`);
  }

  const result = parsed.Response ?? {};
  if (result.Error) {
    const errorInfo = result.Error as { Code?: string; Message?: string };
    throw new Error(
      `腾讯云请求失败：${errorInfo.Code ?? "UNKNOWN"} ${errorInfo.Message ?? ""}`.trim(),
    );
  }

  return result;
}

function buildSubmitPayload(input: HunyuanSubmitInput) {
  const engine = input.engine ?? "rapid";
  const primary = input.images[0];
  if (!primary) {
    throw new Error("缺少建模主图");
  }

  const multiViewImages = input.images
    .slice(1)
    .filter((item) => item.view && ALLOWED_VIEWS.has(item.view))
    .map((item) => ({
      View: item.view as string,
      ImageBase64: item.bytes.toString("base64"),
    }));

  const payload: Record<string, unknown> = {
    ImageBase64: primary.bytes.toString("base64"),
  };

  if (input.prompt?.trim()) {
    payload.Prompt = input.prompt.trim();
  }

  if (multiViewImages.length > 0) {
    payload.MultiViewImages = multiViewImages;
  }

  if (engine === "rapid") {
    payload.ResultFormat = "GLB";
    payload.EnablePBR = input.enablePbr ?? true;
  } else {
    payload.Model = input.model ?? "3.1";
    payload.EnablePBR = input.enablePbr ?? true;
  }

  return {
    action: (engine === "rapid"
      ? "SubmitHunyuanTo3DRapidJob"
      : "SubmitHunyuanTo3DProJob") as SubmitAction,
    queryAction: (engine === "rapid"
      ? "QueryHunyuanTo3DRapidJob"
      : "QueryHunyuanTo3DProJob") as QueryAction,
    payload,
    imageName: primary.name,
  };
}

export async function submitHunyuanJob(input: HunyuanSubmitInput): Promise<HunyuanSubmitResult> {
  const env = await loadTencentEnv();
  const meta = buildSubmitPayload(input);
  const result = await tencentApiRequest(meta.action, meta.payload, {
    ...env,
    region: input.region ?? env.region,
  });
  const jobId = String(result.JobId ?? "");
  if (!jobId) {
    throw new Error(`混元 3D 提交失败：${JSON.stringify(result)}`);
  }

  return {
    jobId,
    queryAction: meta.queryAction,
    region: input.region ?? env.region,
    imageName: meta.imageName,
  };
}

export async function queryHunyuanJob(input: {
  jobId: string;
  queryAction: QueryAction;
  region: string;
}) {
  const env = await loadTencentEnv();
  return tencentApiRequest(
    input.queryAction,
    { JobId: input.jobId },
    { ...env, region: input.region || env.region },
  );
}

export function selectResultFile(files: Array<Record<string, unknown>>) {
  if (!files.length) {
    return null;
  }
  for (const preferred of ["GLB", "OBJ"]) {
    const found = files.find((item) => String(item.Type ?? "").toUpperCase() === preferred);
    if (found) {
      return found;
    }
  }
  return files[0];
}

export async function downloadModelToPublic(options: {
  downloadUrl: string;
  targetDir: string;
  filenameHint: string;
}) {
  const parsed = new URL(options.downloadUrl);
  const guessedExt = path.extname(parsed.pathname) || path.extname(options.filenameHint) || ".glb";
  const filename = `${options.filenameHint}${guessedExt}`;
  const absoluteDir = path.resolve(options.targetDir);
  await mkdir(absoluteDir, { recursive: true });
  const absolutePath = path.join(absoluteDir, filename);

  const response = await fetch(options.downloadUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`下载混元模型失败（${response.status}）`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(absolutePath, bytes);
  return absolutePath;
}
