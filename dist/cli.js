#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { PlantAgent } from "./agent.js";
import { createImageGenerationProviderFromEnv, createVisionProviderFromEnv, } from "./providers/factory.js";
const CAPABILITIES = [
    "analyze-profile",
    "daily-advice",
    "assess-state",
    "pixel-art",
];
function printHelp() {
    process.stdout.write([
        "plant-agent <capability> --input <file.json>",
        "",
        "Capabilities:",
        "  analyze-profile   Run analyze_profile on a JSON input file",
        "  daily-advice      Run generate_daily_advice on a JSON input file",
        "  assess-state      Run assess_state on a JSON input file",
        "  pixel-art         Run pixel-art image generation on a JSON input file",
        "",
        "Examples:",
        "  plant-agent analyze-profile --input ./request.json",
        "  cat request.json | plant-agent daily-advice --input -",
        "  cat request.json | plant-agent pixel-art --input -",
        "",
    ].join("\n"));
}
function parseArgs(argv) {
    if (argv.length === 0)
        return null;
    const capability = argv[0];
    if (!CAPABILITIES.includes(capability))
        return null;
    let inputPath;
    for (let i = 1; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--input" || arg === "-i") {
            inputPath = argv[i + 1];
            i++;
        }
    }
    if (!inputPath)
        return null;
    return { capability, inputPath };
}
async function readInput(path) {
    const raw = path === "-"
        ? await readStdin()
        : await readFile(path, "utf8");
    return JSON.parse(raw);
}
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => {
            data += chunk;
        });
        process.stdin.on("end", () => resolve(data));
        process.stdin.on("error", reject);
    });
}
async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args) {
        printHelp();
        process.exit(args === null ? 2 : 0);
    }
    const input = await readInput(args.inputPath);
    const agent = new PlantAgent({
        visionProvider: args.capability === "daily-advice" || args.capability === "pixel-art"
            ? undefined
            : createVisionProviderFromEnv(),
        imageGenerationProvider: args.capability === "pixel-art"
            ? createImageGenerationProviderFromEnv(process.env)
            : undefined,
    });
    let response;
    switch (args.capability) {
        case "analyze-profile":
            response = await agent.analyzeProfile(input);
            break;
        case "daily-advice":
            response = await agent.generateDailyAdvice(input);
            break;
        case "assess-state":
            response = await agent.assessState(input);
            break;
        case "pixel-art":
            response = await agent.generatePixelArt(input);
            break;
    }
    process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
    if (response !== null &&
        typeof response === "object" &&
        "status" in response &&
        response.status === "failed") {
        process.exitCode = 1;
    }
}
main().catch((err) => {
    process.stderr.write(`error: ${err.message ?? String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map