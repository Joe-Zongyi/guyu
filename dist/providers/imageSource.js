export async function resolveImageSource(image, options = {}) {
    if (image.url) {
        return {
            kind: "url",
            url: image.url,
            ...(image.content_type ? { mimeType: image.content_type } : {}),
        };
    }
    const resolved = await options.resolveImage?.(image);
    if (resolved) {
        return resolved;
    }
    throw new Error(`image source unavailable for file_id ${image.file_id}: provide image.url or resolveImage`);
}
//# sourceMappingURL=imageSource.js.map