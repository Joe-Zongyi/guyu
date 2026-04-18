import { randomBytes } from "node:crypto";
export function newId(prefix) {
    const slug = randomBytes(8).toString("hex");
    return `${prefix}_${slug}`;
}
//# sourceMappingURL=id.js.map