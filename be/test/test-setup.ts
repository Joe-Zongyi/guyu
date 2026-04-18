// Jest setup file — runs before all test suites.
// Forces agent-layer to use fake providers so integration tests are fast,
// deterministic, and free of external API rate limits.

process.env.PLANT_AGENT_VISION_PROVIDER = 'fake';
process.env.PLANT_AGENT_IMAGE_GENERATION_PROVIDER = 'fake';

// Ensure no real API keys leak into test processes
process.env.ANTHROPIC_API_KEY = '';
process.env.GOOGLE_API_KEY = '';
process.env.OPENAI_API_KEY = '';
process.env.PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY = '';
process.env.OPENROUTER_API_KEY = '';
