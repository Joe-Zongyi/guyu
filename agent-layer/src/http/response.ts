export function respondJson(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export function respondHtml(
  html: string,
  statusCode = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(html, {
    status: statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...headers,
    },
  });
}
