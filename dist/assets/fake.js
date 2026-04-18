import { newId } from "../util/id.js";
export class FakeGeneratedImageStore {
    baseUrl;
    generateId;
    constructor(options = {}) {
        this.baseUrl = options.baseUrl ?? "https://assets.example.com/generated";
        this.generateId =
            options.generateId ?? (() => newId("generated_image"));
    }
    async saveGeneratedImage(req) {
        const fileId = this.generateId(req);
        return {
            file_id: fileId,
            url: `${this.baseUrl}/${fileId}.png`,
            ...(req.image.content_type !== undefined
                ? { content_type: req.image.content_type }
                : {}),
            ...(req.image.width !== undefined ? { width: req.image.width } : {}),
            ...(req.image.height !== undefined ? { height: req.image.height } : {}),
        };
    }
}
//# sourceMappingURL=fake.js.map