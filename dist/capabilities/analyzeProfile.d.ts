import type { ProfileResponse } from "../schemas/envelopes.js";
import type { VisionProvider } from "../providers/types.js";
import { getTaxonomyById } from "../taxonomy/catalog.js";
export interface AnalyzeProfileDeps {
    visionProvider: VisionProvider;
    thresholds?: {
        identifiedMin?: number;
        ambiguousMin?: number;
    };
    generateDraftId?: () => string;
}
export declare function analyzeProfile(rawInput: unknown, deps: AnalyzeProfileDeps): Promise<ProfileResponse>;
export { getTaxonomyById };
//# sourceMappingURL=analyzeProfile.d.ts.map