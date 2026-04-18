# Pixel Art Generation Service

Pixel Art Generation Service 接收用户上传的植物图片，可选附带像素风参考图，返回像素风生成结果。

## 1. 目标

- 把真实植物图片转换为适合前端展示的像素风图片
- 保持植物主体和花盆轮廓可辨认
- 返回结构化结果，供后端落库和前端展示

## 2. 输入

```json
{
  "image": {
    "file_id": "file_source_xxx",
    "url": "https://example.com/source.png",
    "content_type": "image/png"
  },
  "style_references": [
    {
      "file_id": "file_style_001",
      "url": "https://example.com/style-1.png",
      "content_type": "image/png"
    }
  ],
  "prompt": "保留盆栽轮廓，偏暖色像素风",
  "variants": 2,
  "request_id": "req_xxx"
}
```

规则：

- `image` 必填
- `request_id` 必填
- `style_references` 可为空
- `variants` 范围建议 `1-4`
- 接 OpenRouter 时，`image.url` 与 `style_references[*].url` 必须可用

## 3. 输出

```json
{
  "status": "success",
  "request_id": "req_xxx",
  "data": {
    "source_image_id": "file_source_xxx",
    "style": "pixel_art",
    "images": [
      {
        "file_id": "generated_image_xxx",
        "url": "https://cdn.example.com/generated_image_xxx.png",
        "content_type": "image/png",
        "width": 512,
        "height": 512
      }
    ],
    "provider_metadata": {
      "model": "black-forest-labs/flux.2-pro",
      "prompt_version": "pixel-art-v1"
    }
  }
}
```

规则：

- `images` 至少返回 1 张
- 每张图片必须同时带 `file_id` 和 `url`
- `style` 首版固定为 `pixel_art`
- `provider_metadata` 必须原样保留模型与 prompt 版本

## 4. 失败路径

失败统一返回：

- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`

说明：

- OpenRouter 超时、上游返回异常、无生成图、落库存图失败都走统一失败 envelope
- 输入格式错误当前也走 `failed`

## 5. HTTP 接口建议

- `POST /v1/images/pixel-art:generate`

路由职责：

- 解析 JSON
- 调 `PlantAgent.generatePixelArt()`
- 返回统一 envelope

不要在路由层直接写 OpenRouter 调用或文件存储逻辑。
