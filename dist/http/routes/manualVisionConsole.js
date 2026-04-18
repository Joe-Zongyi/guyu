import { respondHtml } from "../response.js";
const HTML = String.raw `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Guyu Manual Vision Console</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      body {
        margin: 0;
        padding: 24px;
        background: #111827;
        color: #f9fafb;
      }
      .wrap {
        max-width: 1100px;
        margin: 0 auto;
      }
      h1, h2, h3 {
        margin: 0 0 12px;
      }
      p {
        color: #d1d5db;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .card {
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 14px;
        padding: 16px;
      }
      label {
        display: block;
        font-size: 14px;
        margin: 12px 0 6px;
      }
      input, textarea, button {
        width: 100%;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid #4b5563;
        background: #111827;
        color: #f9fafb;
        padding: 10px 12px;
        font: inherit;
      }
      textarea {
        min-height: 120px;
        resize: vertical;
      }
      button {
        cursor: pointer;
        background: #2563eb;
        border-color: #2563eb;
        font-weight: 600;
        margin-top: 14px;
      }
      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .preview {
        width: 100%;
        max-height: 240px;
        object-fit: contain;
        border-radius: 10px;
        border: 1px solid #374151;
        background: #0b1220;
      }
      .muted {
        color: #9ca3af;
        font-size: 13px;
      }
      pre {
        background: #0b1220;
        color: #e5e7eb;
        padding: 12px;
        border-radius: 10px;
        overflow: auto;
        min-height: 140px;
        border: 1px solid #374151;
      }
      .row {
        display: grid;
        gap: 12px;
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Manual Vision Console</h1>
      <p>选一张本地图，上传到内存，然后直接看 analyze-profile / assess-state 的格式化 JSON 输出。</p>
      <div class="grid">
        <section class="card">
          <h2>1. 上传图片</h2>
          <input id="fileInput" type="file" accept="image/*" />
          <p class="muted" id="fileMeta">还没有选择图片。</p>
          <img id="preview" class="preview" alt="preview" hidden />
          <button id="uploadButton" type="button">上传图片</button>
          <pre id="uploadOutput">{}</pre>
        </section>

        <section class="card">
          <h2>2. Analyze Profile</h2>
          <label for="userId">user_id</label>
          <input id="userId" value="manual-user" />
          <label for="region">region</label>
          <input id="region" placeholder="可选，例如 Shanghai" />
          <button id="analyzeButton" type="button">调用 analyze-profile</button>
          <h3>请求 JSON</h3>
          <pre id="analyzeRequest">{}</pre>
          <h3>响应 JSON</h3>
          <pre id="analyzeResponse">{}</pre>
        </section>

        <section class="card">
          <h2>3. Assess State</h2>
          <label for="plantId">plant_id</label>
          <input id="plantId" value="manual-plant" />
          <label for="taxonomyId">taxonomy_id</label>
          <input id="taxonomyId" value="monstera_deliciosa" />
          <label for="commonName">common_name</label>
          <input id="commonName" value="龟背竹" />
          <label for="recentAssessments">recent_assessments</label>
          <textarea id="recentAssessments">[]</textarea>
          <button id="assessButton" type="button">调用 assess-state</button>
          <h3>请求 JSON</h3>
          <pre id="assessRequest">{}</pre>
          <h3>响应 JSON</h3>
          <pre id="assessResponse">{}</pre>
        </section>
      </div>
    </div>

    <script>
      const state = {
        file: null,
        uploaded: null,
      };

      const fileInput = document.getElementById("fileInput");
      const fileMeta = document.getElementById("fileMeta");
      const preview = document.getElementById("preview");
      const uploadButton = document.getElementById("uploadButton");
      const uploadOutput = document.getElementById("uploadOutput");
      const analyzeButton = document.getElementById("analyzeButton");
      const analyzeRequest = document.getElementById("analyzeRequest");
      const analyzeResponse = document.getElementById("analyzeResponse");
      const assessButton = document.getElementById("assessButton");
      const assessRequest = document.getElementById("assessRequest");
      const assessResponse = document.getElementById("assessResponse");

      function renderJson(node, value) {
        node.textContent = JSON.stringify(value, null, 2);
      }

      function makeRequestId(prefix) {
        return prefix + "_" + Date.now();
      }

      function requireUploadedFile() {
        if (!state.uploaded) {
          throw new Error("请先上传图片");
        }
        return state.uploaded.file;
      }

      function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
          reader.readAsDataURL(file);
        });
      }

      async function postJson(url, body) {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const text = await response.text();
        return { status: response.status, body: text ? JSON.parse(text) : null };
      }

      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        state.file = file || null;
        state.uploaded = null;
        if (!file) {
          preview.hidden = true;
          fileMeta.textContent = "还没有选择图片。";
          renderJson(uploadOutput, {});
          return;
        }
        fileMeta.textContent = file.name + " · " + (file.type || "unknown") + " · " + file.size + " bytes";
        const dataUrl = await readFileAsDataUrl(file);
        preview.src = dataUrl;
        preview.hidden = false;
      });

      uploadButton.addEventListener("click", async () => {
        if (!state.file) {
          renderJson(uploadOutput, { error: "请先选择图片" });
          return;
        }
        uploadButton.disabled = true;
        try {
          const dataUrl = await readFileAsDataUrl(state.file);
          const comma = dataUrl.indexOf(",");
          const imageBase64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
          const payload = {
            filename: state.file.name,
            content_type: state.file.type || "image/jpeg",
            image_base64: imageBase64,
          };
          const result = await postJson("/_manual/uploads", payload);
          state.uploaded = result.body && result.body.data ? result.body.data : null;
          renderJson(uploadOutput, result.body);
        } catch (error) {
          renderJson(uploadOutput, { error: String(error && error.message ? error.message : error) });
        } finally {
          uploadButton.disabled = false;
        }
      });

      analyzeButton.addEventListener("click", async () => {
        analyzeButton.disabled = true;
        try {
          const file = requireUploadedFile();
          const payload = {
            user_id: document.getElementById("userId").value,
            region: document.getElementById("region").value || undefined,
            image: file,
            request_id: makeRequestId("analyze"),
          };
          renderJson(analyzeRequest, payload);
          const result = await postJson("/v1/plants/profile:analyze", payload);
          renderJson(analyzeResponse, result.body);
        } catch (error) {
          renderJson(analyzeResponse, { error: String(error && error.message ? error.message : error) });
        } finally {
          analyzeButton.disabled = false;
        }
      });

      assessButton.addEventListener("click", async () => {
        assessButton.disabled = true;
        try {
          const file = requireUploadedFile();
          const recentRaw = document.getElementById("recentAssessments").value.trim();
          const payload = {
            plant_id: document.getElementById("plantId").value,
            image: file,
            profile: {
              taxonomy_id: document.getElementById("taxonomyId").value,
              common_name: document.getElementById("commonName").value,
            },
            recent_assessments: recentRaw ? JSON.parse(recentRaw) : [],
            request_id: makeRequestId("assess"),
          };
          renderJson(assessRequest, payload);
          const result = await postJson("/v1/plants/state:assess", payload);
          renderJson(assessResponse, result.body);
        } catch (error) {
          renderJson(assessResponse, { error: String(error && error.message ? error.message : error) });
        } finally {
          assessButton.disabled = false;
        }
      });
    </script>
  </body>
</html>`;
export function handleManualVisionConsoleRequest(request) {
    if (request.method !== "GET") {
        return new Response("method not allowed", {
            status: 405,
            headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "GET" },
        });
    }
    return respondHtml(HTML);
}
//# sourceMappingURL=manualVisionConsole.js.map