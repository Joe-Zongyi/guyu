import type { CareBaseline, WeatherLinkFields } from "../schemas/profile.js";
export interface TaxonomyEntry {
    taxonomy_id: string;
    common_name: string;
    scientific_name: string;
    aliases: string[];
    plant_type_tags: string[];
    care_baseline: CareBaseline;
    risk_flags: string[];
    weather_link_fields: WeatherLinkFields;
}
export declare const TAXONOMY_CATALOG_VERSION = "v1";
export declare const TAXONOMY_CATALOG: readonly TaxonomyEntry[];
export declare function getTaxonomyById(taxonomyId: string): TaxonomyEntry | undefined;
export declare function resolveTaxonomy(input: string): TaxonomyEntry | undefined;
export declare function listTaxonomyIds(): string[];
//# sourceMappingURL=catalog.d.ts.map