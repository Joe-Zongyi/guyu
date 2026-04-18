import { newId } from "../util/id.js";
export class PassthroughGeneratedImageStore {
    generateId;
    constructor(options = {}) {
        this.generateId = options.generateId ?? (() => newId("generated_image"));
    }
    async saveGeneratedImage(req) {
        return {
            file_id: this.generateId(req),
            url: req.image.url,
            ...(req.image.content_type !== undefined
                ? { content_type: req.image.content_type }
                : {}),
            ...(req.image.width !== undefined ? { width: req.image.width } : {}),
            ...(req.image.height !== undefined ? { height: req.image.height } : {}),
        };
    }
}
//# sourceMappingURL=passthrough.js.map