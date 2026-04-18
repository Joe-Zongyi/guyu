export function respondJson(statusCode, body, headers = {}) {
    return new Response(JSON.stringify(body, null, 2), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...headers,
        },
    });
}
export function respondHtml(html, statusCode = 200, headers = {}) {
    return new Response(html, {
        status: statusCode,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...headers,
        },
    });
}
//# sourceMappingURL=response.js.map