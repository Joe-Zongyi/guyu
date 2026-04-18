import { AssessStateInputSchema, } from "../schemas/inputs.js";
import { isProviderError } from "../providers/types.js";
const DEFAULT_THRESHOLDS = {
    confidentMin: 0.6,
    uncertainMin: 0.4,
};
const SIGNAL_WHITELIST = new Set([
    "slightly_wilted_leaves",
    "yellowing_tip",
    "leaf_droop",
    "new_growth_visible",
    "stable_appearance",
    "unknown",
]);
const STRESS_SIGNALS = new Set([
    "slightly_wilted_leaves",
    "yellowing_tip",
    "leaf_droop",
]);
const STATE_RANK = {
    stable: 0,
    slightly_stressed: 1,
    needs_attention: 2,
};
function deriveOverallState(signals) {
    const stressCount = signals.filter((s) => STRESS_SIGNALS.has(s)).length;
    if (stressCount >= 2)
        return "needs_attention";
    if (stressCount === 1)
        return "slightly_stressed";
    return "stable";
}
function compareToPrevious(current, recent) {
    if (recent.length === 0)
        return "unknown";
    const prev = [...recent].sort((a, b) => a.assessed_at < b.assessed_at ? 1 : -1)[0];
    const cur = STATE_RANK[current];
    const last = STATE_RANK[prev.overall_state];
    if (cur === last)
        return "same";
    if (cur < last)
        return "better";
    return "worse";
}
function buildSuggestions(signals) {
    const suggestions = [];
    const seen = new Set();
    const push = (s) => {
        if (!seen.has(s)) {
            seen.add(s);
            suggestions.push(s);
        }
    };
    if (signals.includes("slightly_wilted_leaves") || signals.includes("leaf_droop")) {
        push("检查盆土是否已经过干");
        push("先移动到更稳定的散射光环境");
    }
    if (signals.includes("yellowing_tip")) {
        push("观察是否近期换过位置或浇水规律有变化");
        push("先稳定环境，避免一次性大幅调整");
    }
    if (signals.includes("new_growth_visible")) {
        push("生长正常，保持当前养护节奏");
    }
    if (signals.includes("stable_appearance") && suggestions.length === 0) {
        push("继续按当前节奏养护，保持观察");
    }
    if (signals.includes("unknown") && suggestions.length === 0) {
        push("当前不易判断，建议补充更清晰的图片或继续观察 1-2 天");
    }
    if (suggestions.length === 0) {
        push("继续保持稳定养护并观察后续变化");
    }
    return suggestions;
}
function filterSignals(signals) {
    const dedup = new Map();
    for (const s of signals) {
        if (!SIGNAL_WHITELIST.has(s.signal))
            continue;
        const prev = dedup.get(s.signal);
        if (prev === undefined || s.confidence > prev) {
            dedup.set(s.signal, s.confidence);
        }
    }
    return [...dedup.entries()].map(([signal, confidence]) => ({
        signal,
        confidence,
    }));
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
export async function assessState(rawInput, deps) {
    const parsed = AssessStateInputSchema.safeParse(rawInput);
    if (!parsed.success) {
        return {
            status: "failed",
            error_code: "STATE_ASSESSMENT_UNCERTAIN",
            message: `invalid input: ${parsed.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ")}`,
            request_id: rawInput?.request_id ?? "unknown",
        };
    }
    const input = parsed.data;
    let outcome;
    try {
        outcome = await deps.visionProvider.assessPlantState({
            image: input.image,
            request_id: input.request_id,
            taxonomy_hint: input.profile.taxonomy_id,
        });
    }
    catch (err) {
        if (isProviderError(err)) {
            return {
                status: "failed",
                error_code: err.code,
                message: err.message,
                request_id: input.request_id,
            };
        }
        return {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: `provider error: ${err.message ?? "unknown"}`,
            request_id: input.request_id,
        };
    }
    if (outcome.image_quality === "blurry") {
        return {
            status: "failed",
            error_code: "IMAGE_TOO_BLURRY",
            message: "图片清晰度不足，请重新拍摄",
            request_id: input.request_id,
        };
    }
    if (!outcome.detected_plant) {
        return {
            status: "failed",
            error_code: "NO_PLANT_DETECTED",
            message: "未在图片中检测到植物，请重新拍摄",
            request_id: input.request_id,
        };
    }
    const thresholds = { ...DEFAULT_THRESHOLDS, ...(deps.thresholds ?? {}) };
    const filtered = filterSignals(outcome.signals);
    const overallConfidence = filtered.length === 0
        ? 0
        : Math.min(...filtered.map((s) => s.confidence));
    if (filtered.length === 0 ||
        overallConfidence < thresholds.uncertainMin) {
        const conservative = {
            overall_state: "stable",
            signals: ["unknown"],
            confidence: round2(Math.max(overallConfidence, 0.3)),
            suggestions: buildSuggestions(["unknown"]),
            compare_to_previous: compareToPrevious("stable", input.recent_assessments),
            escalation_flag: false,
        };
        return {
            status: "success",
            data: conservative,
            request_id: input.request_id,
        };
    }
    // Conservative path: medium confidence is treated as observable but not alarming.
    const conservative = overallConfidence < thresholds.confidentMin;
    const signals = conservative
        ? filtered.length > 0
            ? ["unknown"]
            : ["unknown"]
        : filtered.map((s) => s.signal);
    const overall = conservative ? "stable" : deriveOverallState(signals);
    const compare = compareToPrevious(overall, input.recent_assessments);
    const escalation = overall === "needs_attention" ||
        (overall === "slightly_stressed" && compare === "worse");
    const data = {
        overall_state: overall,
        signals: signals.length > 0 ? signals : ["unknown"],
        confidence: round2(overallConfidence),
        suggestions: buildSuggestions(signals),
        compare_to_previous: compare,
        escalation_flag: escalation,
    };
    return {
        status: "success",
        data,
        request_id: input.request_id,
    };
}
//# sourceMappingURL=assessState.js.map