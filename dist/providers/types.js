export function isProviderError(err) {
    return (err instanceof Error &&
        "code" in err &&
        (err.code === "PROVIDER_TIMEOUT" || err.code === "PROVIDER_UNAVAILABLE"));
}
export function makeProviderError(code, message) {
    const err = new Error(message);
    err.code = code;
    return err;
}
//# sourceMappingURL=types.js.map