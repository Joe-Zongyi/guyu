import { resolveTaxonomy, TAXONOMY_CATALOG } from "../taxonomy/catalog.js";
import {
  makeProviderError,
  type VisionAssessOutcome,
  type VisionAssessRequest,
  type VisionIdentifyOutcome,
  type VisionIdentifyRequest,
  type VisionProvider,
  type VisionProviderMetadata,
} from "./types.js";
import type { StateSignal } from "../schemas/enums.js";

const DEFAULT_METADATA: VisionProviderMetadata = {
  model: "fake-vision-v1",
  identify_prompt_version: "profile-v1",
  assess_prompt_version: "state-v1",
};

const SIGNAL_HINTS: Array<{ key: string; signal: StateSignal }> = [
  { key: "wilt", signal: "slightly_wilted_leaves" },
  { key: "yellow", signal: "yellowing_tip" },
  { key: "droop", signal: "leaf_droop" },
  { key: "growth", signal: "new_growth_visible" },
  { key: "stable", signal: "stable_appearance" },
];

function hint(input: string): string {
  return input.toLowerCase();
}

function findTaxonomyByHint(input: string) {
  const lc = hint(input);
  for (const entry of TAXONOMY_CATALOG) {
    if (lc.includes(entry.taxonomy_id)) return entry;
    if (lc.includes(entry.common_name.toLowerCase())) return entry;
    if (lc.includes(entry.scientific_name.toLowerCase().split(" ")[0]!))
      return entry;
    for (const alias of entry.aliases) {
      if (lc.includes(alias.toLowerCase())) return entry;
    }
  }
  return undefined;
}

export interface FakeVisionProviderOptions {
  metadata?: Partial<VisionProviderMetadata>;
  defaultIdentified?: string;
}

export class FakeVisionProvider implements VisionProvider {
  private readonly meta: VisionProviderMetadata;
  private readonly defaultIdentified: string;

  constructor(options: FakeVisionProviderOptions = {}) {
    this.meta = { ...DEFAULT_METADATA, ...options.metadata };
    this.defaultIdentified =
      options.defaultIdentified ?? "monstera_deliciosa";
  }

  metadata(): VisionProviderMetadata {
    return this.meta;
  }

  async identifyPlant(
    req: VisionIdentifyRequest,
  ): Promise<VisionIdentifyOutcome> {
    const tag = hint(req.image.file_id);

    if (tag.includes("timeout"))
      throw makeProviderError("PROVIDER_TIMEOUT", "fake provider timeout");
    if (tag.includes("unavailable"))
      throw makeProviderError(
        "PROVIDER_UNAVAILABLE",
        "fake provider unavailable",
      );
    if (tag.includes("blurry")) return { kind: "blurry" };
    if (tag.includes("noplant") || tag.includes("no_plant"))
      return { kind: "no_plant" };
    if (tag.includes("multi")) return { kind: "multiple_plants" };

    if (tag.includes("ambiguous")) {
      const a = findTaxonomyByHint(tag) ?? TAXONOMY_CATALOG[0]!;
      const b =
        TAXONOMY_CATALOG.find((e) => e.taxonomy_id !== a.taxonomy_id) ??
        TAXONOMY_CATALOG[1]!;
      return {
        kind: "identified",
        candidates: [
          { taxonomy_hint: a.taxonomy_id, confidence: 0.55 },
          { taxonomy_hint: b.taxonomy_id, confidence: 0.42 },
        ],
        image_quality: "ok",
        detected_plant_count: 1,
      };
    }

    if (tag.includes("lowconf") || tag.includes("low_conf")) {
      const guess = findTaxonomyByHint(tag) ?? TAXONOMY_CATALOG[0]!;
      return {
        kind: "identified",
        candidates: [{ taxonomy_hint: guess.taxonomy_id, confidence: 0.32 }],
        image_quality: "ok",
        detected_plant_count: 1,
      };
    }

    const matched = findTaxonomyByHint(tag);
    const top = matched ?? resolveTaxonomy(this.defaultIdentified)!;
    return {
      kind: "identified",
      candidates: [{ taxonomy_hint: top.taxonomy_id, confidence: 0.92 }],
      image_quality: "ok",
      detected_plant_count: 1,
    };
  }

  async assessPlantState(
    req: VisionAssessRequest,
  ): Promise<VisionAssessOutcome> {
    const tag = hint(req.image.file_id);

    if (tag.includes("timeout"))
      throw makeProviderError("PROVIDER_TIMEOUT", "fake provider timeout");
    if (tag.includes("unavailable"))
      throw makeProviderError(
        "PROVIDER_UNAVAILABLE",
        "fake provider unavailable",
      );
    if (tag.includes("blurry")) {
      return {
        signals: [{ signal: "unknown", confidence: 0.2 }],
        overall_confidence: 0.2,
        image_quality: "blurry",
        detected_plant: true,
      };
    }
    if (tag.includes("noplant") || tag.includes("no_plant")) {
      return {
        signals: [{ signal: "unknown", confidence: 0.0 }],
        overall_confidence: 0.0,
        image_quality: "ok",
        detected_plant: false,
      };
    }

    const matchedSignals = SIGNAL_HINTS.filter((h) => tag.includes(h.key)).map(
      (h) => ({ signal: h.signal, confidence: 0.8 }),
    );

    if (tag.includes("lowconf") || tag.includes("low_conf")) {
      return {
        signals: [{ signal: "unknown", confidence: 0.35 }],
        overall_confidence: 0.35,
        image_quality: "ok",
        detected_plant: true,
      };
    }

    if (matchedSignals.length === 0) {
      return {
        signals: [{ signal: "stable_appearance", confidence: 0.85 }],
        overall_confidence: 0.85,
        image_quality: "ok",
        detected_plant: true,
      };
    }

    return {
      signals: matchedSignals,
      overall_confidence: Math.min(
        ...matchedSignals.map((s) => s.confidence),
      ),
      image_quality: "ok",
      detected_plant: true,
    };
  }
}
