import type { StateAssessmentResponse } from "../schemas/envelopes.js";
import type { VisionProvider } from "../providers/types.js";
export interface AssessStateDeps {
    visionProvider: VisionProvider;
    thresholds?: {
        confidentMin?: number;
        uncertainMin?: number;
    };
}
export declare function assessState(rawInput: unknown, deps: AssessStateDeps): Promise<StateAssessmentResponse>;
//# sourceMappingURL=assessState.d.ts.map