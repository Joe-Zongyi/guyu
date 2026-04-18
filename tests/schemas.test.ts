import { describe, expect, it } from "vitest";
import {
  CareEventSchema,
  FileRefSchema,
  GeneratedImageSchema,
  PixelArtGenerationSchema,
  PlantProfileDraftSchema,
  PlantProfileSchema,
  PlantStateAssessmentSchema,
  WeatherSnapshotSchema,
} from "../src/schemas/index.js";

describe("shared schemas", () => {
  it("FileRef requires file_id", () => {
    expect(() => FileRefSchema.parse({})).toThrow();
    expect(FileRefSchema.parse({ file_id: "file_x" }).file_id).toBe("file_x");
  });

  it("GeneratedImage requires both file_id and url", () => {
    expect(() => GeneratedImageSchema.parse({ file_id: "generated_x" })).toThrow();
    expect(() => GeneratedImageSchema.parse({ url: "https://example.com/x.png" })).toThrow();
    expect(
      GeneratedImageSchema.parse({
        file_id: "generated_x",
        url: "https://example.com/x.png",
      }),
    ).toBeTruthy();
  });

  it("PixelArtGeneration requires at least one generated image", () => {
    expect(() =>
      PixelArtGenerationSchema.parse({
        source_image_id: "file_x",
        style: "pixel_art",
        images: [],
        provider_metadata: { model: "m", prompt_version: "p" },
      }),
    ).toThrow();
  });

  it("WeatherSnapshot enforces enum values", () => {
    expect(() =>
      WeatherSnapshotSchema.parse({
        condition: "drizzle",
        temperature_c: 20,
        humidity: 60,
        light_level: "medium",
      }),
    ).toThrow();
  });

  it("CareEvent requires occurred_at to be ISO 8601", () => {
    expect(() =>
      CareEventSchema.parse({ type: "watered", occurred_at: "not-a-date" }),
    ).toThrow();
  });

  it("PlantProfileDraft rejects identified without taxonomy_id", () => {
    expect(() =>
      PlantProfileDraftSchema.parse({
        draft_id: "d",
        source_image_id: "f",
        recognition_status: "identified",
        confidence: 0.9,
        candidates: [],
        plant_type_tags: [],
        care_baseline: { watering_rule: "x", light_rule: "y" },
        risk_flags: [],
        weather_link_fields: {
          heat_sensitivity: "medium",
          cold_sensitivity: "medium",
          humidity_sensitivity: "medium",
          light_sensitivity: "medium",
        },
        provider_metadata: { model: "m", prompt_version: "p" },
        profile_version: "v1",
      }),
    ).toThrow(/taxonomy_id/);
  });

  it("PlantProfileDraft rejects unknown that carries species fields", () => {
    expect(() =>
      PlantProfileDraftSchema.parse({
        draft_id: "d",
        source_image_id: "f",
        recognition_status: "unknown",
        taxonomy_id: "monstera_deliciosa",
        confidence: 0.1,
        candidates: [],
        plant_type_tags: [],
        care_baseline: { watering_rule: "x", light_rule: "y" },
        risk_flags: [],
        weather_link_fields: {
          heat_sensitivity: "medium",
          cold_sensitivity: "medium",
          humidity_sensitivity: "medium",
          light_sensitivity: "medium",
        },
        provider_metadata: { model: "m", prompt_version: "p" },
        profile_version: "v1",
      }),
    ).toThrow();
  });

  it("PlantProfileDraft rejects ambiguous with <2 candidates", () => {
    expect(() =>
      PlantProfileDraftSchema.parse({
        draft_id: "d",
        source_image_id: "f",
        recognition_status: "ambiguous",
        confidence: 0.5,
        candidates: [
          { taxonomy_id: "a", common_name: "A", confidence: 0.5 },
        ],
        plant_type_tags: [],
        care_baseline: { watering_rule: "x", light_rule: "y" },
        risk_flags: [],
        weather_link_fields: {
          heat_sensitivity: "medium",
          cold_sensitivity: "medium",
          humidity_sensitivity: "medium",
          light_sensitivity: "medium",
        },
        provider_metadata: { model: "m", prompt_version: "p" },
        profile_version: "v1",
      }),
    ).toThrow();
  });

  it("PlantProfile requires taxonomy fields", () => {
    expect(() => PlantProfileSchema.parse({ plant_id: "p" })).toThrow();
  });

  it("PlantStateAssessment enforces overall_state enum", () => {
    expect(() =>
      PlantStateAssessmentSchema.parse({
        overall_state: "dying",
        signals: ["stable_appearance"],
        confidence: 0.5,
        suggestions: ["x"],
        compare_to_previous: "same",
        escalation_flag: false,
      }),
    ).toThrow();
  });

  it("PlantStateAssessment rejects non-whitelisted signals", () => {
    expect(() =>
      PlantStateAssessmentSchema.parse({
        overall_state: "stable",
        signals: ["root_rot"],
        confidence: 0.5,
        suggestions: ["x"],
        compare_to_previous: "same",
        escalation_flag: false,
      }),
    ).toThrow();
  });
});
