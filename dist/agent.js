import { analyzeProfile, } from "./capabilities/analyzeProfile.js";
import { generateDailyAdvice, } from "./capabilities/generateDailyAdvice.js";
import { assessState, } from "./capabilities/assessState.js";
import { generatePixelArt, } from "./capabilities/generatePixelArt.js";
import { FakeVisionProvider } from "./providers/fake.js";
import { FakeImageGenerationProvider } from "./providers/fakeImageGeneration.js";
import { PassthroughGeneratedImageStore } from "./assets/passthrough.js";
export class PlantAgent {
    vision;
    imageGeneration;
    generatedImageStore;
    profileExtras;
    assessExtras;
    adviceDeps;
    constructor(options = {}) {
        this.vision = options.visionProvider ?? new FakeVisionProvider();
        this.imageGeneration =
            options.imageGenerationProvider ?? new FakeImageGenerationProvider();
        this.generatedImageStore =
            options.generatedImageStore ?? new PassthroughGeneratedImageStore();
        this.profileExtras = options.analyzeProfileDeps ?? {};
        this.assessExtras = options.assessStateDeps ?? {};
        this.adviceDeps = options.generateDailyAdviceDeps ?? {};
    }
    analyzeProfile(input) {
        return analyzeProfile(input, {
            visionProvider: this.vision,
            ...this.profileExtras,
        });
    }
    generateDailyAdvice(input) {
        return generateDailyAdvice(input, this.adviceDeps);
    }
    assessState(input) {
        return assessState(input, {
            visionProvider: this.vision,
            ...this.assessExtras,
        });
    }
    generatePixelArt(input) {
        return generatePixelArt(input, {
            imageGenerationProvider: this.imageGeneration,
            generatedImageStore: this.generatedImageStore,
        });
    }
}
//# sourceMappingURL=agent.js.map