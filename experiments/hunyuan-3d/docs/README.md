# 混元 3D 本地控制台

## 文件

- 页面：`E:\code\guyu\experiments\hunyuan-3d\ui\hunyuan-3d-console.html`
- 后端：`E:\code\guyu\experiments\hunyuan-3d\tools\hunyuan_console_server.py`
- 启动脚本：`E:\code\guyu\experiments\hunyuan-3d\tools\start-hunyuan-console.ps1`
- 环境变量：`E:\code\guyu\.env`
- 运行时目录：`E:\code\guyu\experiments\hunyuan-3d\runtime\hunyuan`
- 示例素材：`E:\code\guyu\experiments\hunyuan-3d\samples`

## 能力

- 在本地浏览器里上传多张图片
- 调用腾讯混元 3D 提交任务
- 持续轮询任务状态
- 任务完成后自动下载结果文件
- 如果结果中存在 `GLB/GLTF`，会在浏览器中直接展示
- 页面为 Claymorphism 移动端风格，适合作为单任务测试台

## 启动

```powershell
.\experiments\hunyuan-3d\tools\start-hunyuan-console.ps1
```

默认打开：

- `http://127.0.0.1:8766/experiments/hunyuan-3d/ui/hunyuan-3d-console.html`

## 使用

1. 在 `.env` 中配置腾讯云凭证
2. 启动本地服务
3. 上传多张图片
4. 第一张作为主图，其他图可在页面里标记视角
5. 点击“提交生成”
6. 等待页面自动轮询并加载模型

## 说明

- 当前测试页默认使用 `Rapid + GLB + EnablePBR=true`。
- 后端会优先从 `E:\code\guyu\.env` 读取：
  - `TENCENT_SECRET_ID`
  - `TENCENT_SECRET_KEY`
  - `TENCENT_REGION`
- 第一张图会作为主图提交，后续图片会按页面中选择的视角映射到 `MultiViewImages`。
- 上传后的临时文件、任务信息和下载结果保存在：
  - `E:\code\guyu\experiments\hunyuan-3d\runtime\hunyuan`
- 目前页面通过 CDN 加载 `three.js` 和 `GLTFLoader`，因此浏览器需要联网。
- `samples/` 中保留了历史测试样例与输入素材，方便回看和复现实验。
