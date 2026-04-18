import type { DailyAdviceResponse } from "../schemas/envelopes.js";
export interface GenerateDailyAdviceDeps {
    /**
     * Optional clock injection in tests; default uses today_context.date so the
     * function stays deterministic even without it.
     */
    now?: () => Date;
}
export declare function generateDailyAdvice(rawInput: unknown, _deps?: GenerateDailyAdviceDeps): Promise<DailyAdviceResponse>;
//# sourceMappingURL=generateDailyAdvice.d.ts.map