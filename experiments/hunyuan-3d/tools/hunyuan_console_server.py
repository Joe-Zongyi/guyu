from __future__ import annotations

import base64
import cgi
import datetime as dt
import hashlib
import hmac
import json
import mimetypes
import os
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
EXPERIMENT_DIR = Path(__file__).resolve().parents[1]
TEMP_DIR = EXPERIMENT_DIR / "runtime" / "hunyuan"
UPLOAD_DIR = TEMP_DIR / "uploads"
JOB_DIR = TEMP_DIR / "jobs"
MODEL_DIR = TEMP_DIR / "models"
API_HOST = "ai3d.tencentcloudapi.com"
API_ENDPOINT = f"https://{API_HOST}"
API_VERSION = "2025-05-13"
ENV_PATH = REPO_ROOT / ".env"
ALLOWED_VIEWS = {"left", "right", "back", "top", "bottom", "left_front", "right_front"}


def ensure_dirs() -> None:
    for path in (UPLOAD_DIR, JOB_DIR, MODEL_DIR):
        path.mkdir(parents=True, exist_ok=True)


def load_dotenv() -> None:
    if not ENV_PATH.exists():
        return
    for raw_line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def sha256_hex(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def hmac_sha256(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def build_tc3_headers(action: str, payload: bytes, secret_id: str, secret_key: str) -> dict[str, str]:
    now = utc_now()
    timestamp = str(int(now.timestamp()))
    date = now.strftime("%Y-%m-%d")
    service = "ai3d"
    algorithm = "TC3-HMAC-SHA256"
    canonical_headers = (
        "content-type:application/json; charset=utf-8\n"
        f"host:{API_HOST}\n"
        f"x-tc-action:{action.lower()}\n"
    )
    signed_headers = "content-type;host;x-tc-action"
    canonical_request = "\n".join(
        [
            "POST",
            "/",
            "",
            canonical_headers,
            signed_headers,
            sha256_hex(payload),
        ]
    )
    credential_scope = f"{date}/{service}/tc3_request"
    string_to_sign = "\n".join(
        [
            algorithm,
            timestamp,
            credential_scope,
            sha256_hex(canonical_request.encode("utf-8")),
        ]
    )
    secret_date = hmac_sha256(f"TC3{secret_key}".encode("utf-8"), date)
    secret_service = hmac_sha256(secret_date, service)
    secret_signing = hmac_sha256(secret_service, "tc3_request")
    signature = hmac.new(secret_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
    authorization = (
        f"{algorithm} Credential={secret_id}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    return {
        "Authorization": authorization,
        "Content-Type": "application/json; charset=utf-8",
        "Host": API_HOST,
        "X-TC-Action": action,
        "X-TC-Version": API_VERSION,
        "X-TC-Timestamp": timestamp,
    }


def tencent_api_request(action: str, payload_obj: dict, secret_id: str, secret_key: str, region: str) -> dict:
    payload = json.dumps(payload_obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    headers = build_tc3_headers(action, payload, secret_id, secret_key)
    headers["X-TC-Region"] = region
    request = urllib.request.Request(API_ENDPOINT, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Tencent API HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Tencent API request failed: {exc.reason}") from exc


def load_job(session_id: str) -> dict:
    path = JOB_DIR / f"{session_id}.json"
    if not path.exists():
        raise FileNotFoundError(session_id)
    return json.loads(path.read_text(encoding="utf-8"))


def save_job(job: dict) -> None:
    path = JOB_DIR / f"{job['sessionId']}.json"
    path.write_text(json.dumps(job, ensure_ascii=False, indent=2), encoding="utf-8")


def list_jobs() -> list[dict]:
    records: list[dict] = []
    if not JOB_DIR.exists():
        return records
    for path in JOB_DIR.glob("*.json"):
        try:
            job = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        records.append(job)
    records.sort(key=lambda item: item.get("submittedAt", ""), reverse=True)
    return records


def serialize_job_summary(job: dict) -> dict:
    preview_image_url = None
    result_files = (job.get("lastResponse") or {}).get("ResultFile3Ds") or []
    if result_files:
        preview_image_url = result_files[0].get("PreviewImageUrl")
    return {
        "sessionId": job.get("sessionId"),
        "jobId": job.get("jobId"),
        "imageName": job.get("imageName"),
        "status": job.get("status"),
        "submittedAt": job.get("submittedAt"),
        "lastPolledAt": job.get("lastPolledAt"),
        "imageUrls": job.get("imagePaths") or [],
        "previewImageUrl": preview_image_url,
        "localModelUrl": job.get("localModelUrl"),
        "downloadedFile": ("/" + job["downloadedFile"]) if job.get("downloadedFile") else None,
    }


def normalize_upload_items(item: cgi.FieldStorage | list[cgi.FieldStorage]) -> list[cgi.FieldStorage]:
    if isinstance(item, list):
        return item
    return [item]


def make_job_payload(form: cgi.FieldStorage) -> tuple[dict, list[dict[str, str]], str]:
    engine = (form.getfirst("engine") or "rapid").strip().lower()
    region = (form.getfirst("region") or os.getenv("TENCENT_REGION") or "ap-guangzhou").strip()
    enable_pbr = (form.getfirst("enablePbr") or "true").lower() == "true"
    prompt = (form.getfirst("prompt") or "").strip()
    if "images" in form:
        upload_item = form["images"]
    elif "image" in form:
        upload_item = form["image"]
    else:
        raise ValueError("缺少上传图片。")
    uploads = normalize_upload_items(upload_item)
    if not uploads:
        raise ValueError("缺少上传图片。")
    image_views_raw = form.getfirst("imageViews") or "[]"
    try:
        image_views = json.loads(image_views_raw)
    except json.JSONDecodeError as exc:
        raise ValueError("imageViews 参数格式错误。") from exc
    upload_records: list[dict[str, str]] = []
    multi_view_images: list[dict[str, str]] = []
    primary_image_base64 = None
    primary_name = ""
    seen_views: set[str] = set()
    for index, item in enumerate(uploads):
        if not getattr(item, "file", None):
            continue
        image_bytes = item.file.read()
        if not image_bytes:
            continue
        image_name = Path(item.filename or f"upload-{index + 1}.png").name
        image_base64 = base64.b64encode(image_bytes).decode("ascii")
        upload_records.append(
            {
                "name": image_name,
                "bytesBase64": image_base64,
            }
        )
        if primary_image_base64 is None:
            primary_image_base64 = image_base64
            primary_name = image_name
            continue
        view = ""
        if index < len(image_views):
            view = str(image_views[index] or "").strip()
        if view not in ALLOWED_VIEWS:
            continue
        if view in seen_views:
            continue
        seen_views.add(view)
        multi_view_images.append({"View": view, "ImageBase64": image_base64})
    if primary_image_base64 is None:
        raise ValueError("上传图片为空。")
    payload: dict[str, object] = {
        "ImageBase64": primary_image_base64,
    }
    if prompt:
        payload["Prompt"] = prompt
    if multi_view_images:
        payload["MultiViewImages"] = multi_view_images
    if engine == "rapid":
        payload["ResultFormat"] = "GLB"
        payload["EnablePBR"] = enable_pbr
    else:
        payload["EnablePBR"] = enable_pbr
    return {
        "action": "SubmitHunyuanTo3DRapidJob" if engine == "rapid" else "SubmitHunyuanTo3DProJob",
        "queryAction": "QueryHunyuanTo3DRapidJob" if engine == "rapid" else "QueryHunyuanTo3DProJob",
        "engine": engine,
        "region": region,
        "payload": payload,
        "imageName": primary_name,
        "prompt": prompt,
        "enablePbr": enable_pbr,
    }, upload_records, primary_name


def json_response(handler: "HunyuanHandler", status: int, payload: dict) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def parse_json(handler: "HunyuanHandler") -> dict:
    length = int(handler.headers.get("Content-Length", "0"))
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def select_result_file(files: list[dict]) -> dict | None:
    if not files:
        return None
    for preferred in ("GLB", "OBJ"):
        for item in files:
            if str(item.get("Type", "")).upper() == preferred:
                return item
    return files[0]


def local_model_url(path: Path) -> str:
    return "/" + path.relative_to(REPO_ROOT).as_posix()


def download_result_file(url: str, target_dir: Path) -> Path:
    parsed = urllib.parse.urlparse(url)
    filename = Path(parsed.path).name or "model.bin"
    destination = target_dir / filename
    with urllib.request.urlopen(url, timeout=300) as response, destination.open("wb") as handle:
        shutil.copyfileobj(response, handle)
    return destination


def extract_previewable_model(downloaded: Path, target_dir: Path) -> tuple[Path | None, list[str]]:
    extracted_files: list[str] = []
    if downloaded.suffix.lower() != ".zip":
        return downloaded if downloaded.suffix.lower() in {".glb", ".gltf"} else None, [downloaded.name]
    with zipfile.ZipFile(downloaded) as archive:
        archive.extractall(target_dir)
        extracted_files = archive.namelist()
    for suffix in (".glb", ".gltf"):
        for name in extracted_files:
            if Path(name).suffix.lower() == suffix:
                return target_dir / name, extracted_files
    return None, extracted_files


class HunyuanHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        clean_path = path.split("?", 1)[0].split("#", 1)[0]
        relative = clean_path.lstrip("/") or "experiments/hunyuan-3d/ui/hunyuan-3d-console.html"
        return str((REPO_ROOT / relative).resolve())

    def do_GET(self) -> None:
        if self.path.startswith("/api/health"):
            json_response(self, HTTPStatus.OK, {"ok": True})
            return
        if self.path.startswith("/api/history"):
            items = [serialize_job_summary(job) for job in list_jobs()]
            json_response(self, HTTPStatus.OK, {"items": items})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/api/submit":
            self.handle_submit()
            return
        if self.path.startswith("/api/jobs/") and self.path.endswith("/poll"):
            self.handle_poll()
            return
        json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def handle_submit(self) -> None:
        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    "REQUEST_METHOD": "POST",
                    "CONTENT_TYPE": self.headers.get("Content-Type", ""),
                },
            )
            secret_id = (os.getenv("TENCENT_SECRET_ID") or "").strip()
            secret_key = (os.getenv("TENCENT_SECRET_KEY") or "").strip()
            if not secret_id or not secret_key:
                raise ValueError("本地 .env 中缺少腾讯云 SecretId 或 SecretKey。")
            request_meta, upload_records, image_name = make_job_payload(form)
            response = tencent_api_request(
                request_meta["action"],
                request_meta["payload"],
                secret_id,
                secret_key,
                request_meta["region"],
            )
            result = response.get("Response", {})
            job_id = result.get("JobId")
            if not job_id:
                raise RuntimeError(f"提交任务失败：{json.dumps(result, ensure_ascii=False)}")
            session_id = uuid.uuid4().hex
            upload_paths = []
            for index, record in enumerate(upload_records):
                suffix = Path(record["name"]).suffix.lower() or ".png"
                upload_path = UPLOAD_DIR / f"{session_id}-{index + 1}{suffix}"
                upload_path.write_bytes(base64.b64decode(record["bytesBase64"]))
                upload_paths.append("/" + upload_path.relative_to(REPO_ROOT).as_posix())
            job = {
                "sessionId": session_id,
                "jobId": job_id,
                "engine": request_meta["engine"],
                "region": request_meta["region"],
                "queryAction": request_meta["queryAction"],
                "imageName": image_name,
                "imagePaths": upload_paths,
                "prompt": request_meta["prompt"],
                "enablePbr": request_meta["enablePbr"],
                "status": "WAIT",
                "submittedAt": utc_now().isoformat(),
                "lastResponse": result,
            }
            save_job(job)
            json_response(
                self,
                HTTPStatus.OK,
                {
                    "sessionId": session_id,
                    "jobId": job_id,
                    "status": "WAIT",
                    "imageUrls": upload_paths,
                },
            )
        except Exception as exc:
            json_response(self, HTTPStatus.BAD_REQUEST, {"error": str(exc)})

    def handle_poll(self) -> None:
        try:
            session_id = self.path.split("/")[3]
            body = parse_json(self)
            secret_id = (os.getenv("TENCENT_SECRET_ID") or "").strip()
            secret_key = (os.getenv("TENCENT_SECRET_KEY") or "").strip()
            if not secret_id or not secret_key:
                raise ValueError("本地 .env 中缺少腾讯云 SecretId 或 SecretKey。")
            job = load_job(session_id)
            response = tencent_api_request(
                job["queryAction"],
                {"JobId": job["jobId"]},
                secret_id,
                secret_key,
                job["region"],
            )
            result = response.get("Response", {})
            job["status"] = result.get("Status", "UNKNOWN")
            job["lastPolledAt"] = utc_now().isoformat()
            job["lastResponse"] = result
            preview_url = None
            download_url = None
            files = result.get("ResultFile3Ds") or []
            selected = select_result_file(files)
            if selected:
                download_url = selected.get("Url")
                preview_url = selected.get("PreviewImageUrl")
            if job["status"] == "DONE" and download_url and not job.get("localModelUrl"):
                target_dir = MODEL_DIR / session_id
                target_dir.mkdir(parents=True, exist_ok=True)
                downloaded = download_result_file(download_url, target_dir)
                previewable, extracted_files = extract_previewable_model(downloaded, target_dir)
                job["downloadedFile"] = str(downloaded.relative_to(REPO_ROOT).as_posix())
                job["extractedFiles"] = extracted_files
                if previewable:
                    job["localModelUrl"] = local_model_url(previewable)
            save_job(job)
            json_response(
                self,
                HTTPStatus.OK,
                {
                    "sessionId": job["sessionId"],
                    "jobId": job["jobId"],
                    "status": job["status"],
                    "errorCode": result.get("ErrorCode") or "",
                    "errorMessage": result.get("ErrorMessage") or "",
                    "previewImageUrl": preview_url,
                    "downloadUrl": download_url,
                    "localModelUrl": job.get("localModelUrl"),
                    "downloadedFile": ("/" + job["downloadedFile"]) if job.get("downloadedFile") else None,
                    "extractedFiles": job.get("extractedFiles") or [],
                    "resultFiles": files,
                },
            )
        except FileNotFoundError:
            json_response(self, HTTPStatus.NOT_FOUND, {"error": "任务不存在。"})
        except Exception as exc:
            json_response(self, HTTPStatus.BAD_REQUEST, {"error": str(exc)})

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))


def main() -> None:
    load_dotenv()
    ensure_dirs()
    port = 8766
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    server = ThreadingHTTPServer(("127.0.0.1", port), HunyuanHandler)
    print(f"Hunyuan 3D console on http://127.0.0.1:{port}/experiments/hunyuan-3d/ui/hunyuan-3d-console.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
