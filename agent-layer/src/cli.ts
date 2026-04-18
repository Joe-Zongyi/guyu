#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { PlantAgent } from "./agent.js";

type Capability = "analyze-profile" | "daily-advice" | "assess-state";

const CAPABILITIES: readonly Capability[] = [
  "analyze-profile",
  "daily-advice",
  "assess-state",
];

interface ParsedArgs {
  capability: Capability;
  inputPath: string;
}

function printHelp(): void {
  process.stdout.write(
    [
      "plant-agent <capability> --input <file.json>",
      "",
      "Capabilities:",
      "  analyze-profile   Run analyze_profile on a JSON input file",
      "  daily-advice      Run generate_daily_advice on a JSON input file",
      "  assess-state      Run assess_state on a JSON input file",
      "",
      "Examples:",
      "  plant-agent analyze-profile --input ./request.json",
      "  cat request.json | plant-agent daily-advice --input -",
      "",
    ].join("\n"),
  );
}

function parseArgs(argv: string[]): ParsedArgs | null {
  if (argv.length === 0) return null;
  const capability = argv[0] as Capability;
  if (!CAPABILITIES.includes(capability)) return null;

  let inputPath: string | undefined;
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" || arg === "-i") {
      inputPath = argv[i + 1];
      i++;
    }
  }
  if (!inputPath) return null;
  return { capability, inputPath };
}

async function readInput(path: string): Promise<unknown> {
  const raw =
    path === "-"
      ? await readStdin()
      : await readFile(path, "utf8");
  return JSON.parse(raw);
}

function readStdin(): Promise<string> {
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    printHelp();
    process.exit(args === null ? 2 : 0);
  }

  const input = await readInput(args.inputPath);
  const agent = new PlantAgent();

  let response: unknown;
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
  }

  process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);

  if (
    response !== null &&
    typeof response === "object" &&
    "status" in response &&
    (response as { status: string }).status === "failed"
  ) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(`error: ${(err as Error).message ?? String(err)}\n`);
  process.exit(1);
});
