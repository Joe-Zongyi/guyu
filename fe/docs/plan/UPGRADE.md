# Frontend upgrade note — Guyu (Guyu)

This document clarifies the **baseline frontend scope** from the product PRD, optional **experience and rendering upgrades** inspired by the hackathon research doc (`docs/research/谷雨项目优化方案.md`), and how they relate to [agent-handoff.md](./agent-handoff.md). It does not replace the PRD or contracts.

---

## 1. Current frontend plan (baseline)

Aligned with [docs/plans/2026-04-18-guyu-prd.md](../../docs/plans/2026-04-18-guyu-prd.md) §4.1 and §3.

| Area | Scope |
|------|--------|
| **Pages** | Home (calendar / today, weather, plant status, daily care), identify (upload, recognition result, profile creation), growth (timeline, 3D or pseudo-3D, reward cards), video (care videos related to species / weather / task). |
| **Data** | All product flows call the **backend HTTP APIs**; clients do **not** call PlantAgent directly. Use structured fields from backend responses that map to Agent capabilities per handoff. |
| **Consumption rules** | Drive UI from **`actions`** (daily advice), not by parsing `today_summary`. Use `warnings` as soft alerts. On `ambiguous` / `unknown` recognition, show candidate or “pending confirmation” states — see handoff §3.1 / §6. |

**3D / growth (PRD §3.3, §4.3)**  
MVP: single-plant 3D or pseudo-3D, or timeline + lightweight 3D; if reconstruction is unstable, fall back to single-model swap or animation. Implementation is owned by the frontend / 3D track; backend supplies URLs, metadata, and non-Agent assets as product APIs define.

---

## 2. Boundary: online product vs hackathon “offline”

The research doc targets a **pure offline** Douyin mini-game (no `fetch` / WebSocket, &lt;8MB package). **Guyu’s main app does not adopt that constraint.** Networking, upload, weather, and video remain as in the PRD.

Optional visuals (L-system, shaders, Tone.js) are **in-app or bundled assets** loaded like normal web assets — not a second “zero-network” product unless you ship a separate demo build.

---

## 3. Optional new designs (from research — additive only)

These are **optional layers** on the growth / marketing / easter-egg surfaces. Use **feature flags** or separate routes so they never replace the main identify → care → calendar flow.

### 3.1 L-system + deterministic seed

- **Idea**: Map a stable string (e.g. user note, plant nickname + created_at, or marketing copy) to a **seed**, drive an **L-system** for branch topology, then turtle graphics → meshes. Same input → same tree (good for “emotional footprint” and shareability).
- **Fit**: PRD allows pseudo-3D when full reconstruction is heavy — this is a **procedural stand-in** for the growth view or a “digital twin” mode, not a replacement for species identification.

### 3.2 Wind system (GPU)

- **Idea**: Vertex shader uses `uTime` and low-frequency noise or sine composite; displacement scales with height so roots stay fixed and foliage sways (“wind field”).
- **Fit**: Ambient motion for growth scene; pairs with merged or instanced geometry for performance.

### 3.3 Emotional value (no extra backend dependency)

- **Product copy / Agent**: Align `mood_copy` and onboarding copy with **tree-hole**, **solstice Guyu**, **workspace** metaphors — still generated or curated server-side per handoff.
- **UX**: **No punishment** — avoid “plant died” failure states; align with conservative `assess_state` and handoff’s non-diagnostic rules.

### 3.4 Ghibli-inspired art direction (math-first, lightweight assets)

- **Stepped toon shading**: Fragment shader quantizes N·L into bands (`smoothstep` bands) for cel / watercolor-like tiers without large texture budgets.
- **Spherical normal manipulation**: For foliage clusters, bias normals toward a spherical direction from center for fluffy, soft lighting (reduces “faceted” noise).
- **Procedural ground cover**: **InstancedMesh** for grass blades; **merge** L-system branches into fewer draw calls where possible.

### 3.5 Ambient audio (optional)

- **Idea**: Synthetic wind (filtered noise + slow LFO) and pentatonic / safe-scale generative notes keyed off the same seed — **Tone.js** or Web Audio.  
- **Note**: Not in the baseline PRD; ship only if PM/design approves bundle size and autoplay policies.

### 3.6 Performance checklist (mobile WebView)

- Cap `pixelRatio` (e.g. `Math.min(devicePixelRatio, 2)`).
- `frustumCulled`, reasonable LOD; **dispose** materials and geometries when regenerating trees.
- Prefer **mergeGeometries** / **InstancedMesh** over thousands of loose meshes.

---

## 4. Suggested integration order (frontend vertical slices)

1. **API-driven pages** — home, identify, growth shell, video list; correct loading / empty / error states.  
2. **Structured rendering** — `actions`, `warnings`, recognition states per handoff.  
3. **Growth visuals** — choose one path: lightweight 3D placeholder, L-system branch, or image timeline; add wind + toon shading only after baseline is stable.  
4. **Polish** — optional audio, stronger Ghibli direction, share/capture.

---

## 5. References

| Doc | Role |
|-----|------|
| [2026-04-18-guyu-prd.md](../../docs/plans/2026-04-18-guyu-prd.md) | Page list and product scope |
| [2026-04-18-guyu-prd-research-alignment.md](../../docs/plans/2026-04-18-guyu-prd-research-alignment.md) | PRD vs research mapping |
| [agent-handoff.md](./agent-handoff.md) | Agent JSON behavior and UI rules |
| [contracts/](./contracts/) | Stable field shapes where present |
| `docs/research/谷雨项目优化方案.md` | Offline hackathon deep-dive (optional tech ideas) |

---

## One-line summary

Baseline Guyu frontend is **PRD pages + backend APIs + handoff field rules**; research-driven upgrades (L-system, wind, Ghibli-style shaders, emotion-forward copy) are **optional, layered, and must not replace** the main connected AI-care experience.
