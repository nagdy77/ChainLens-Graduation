# CHAINLENS

**LLM-Assisted Vulnerability Chain Reasoner** — a frontend-only prototype for a cybersecurity graduation project.

CHAINLENS models a laboratory environment as a graph of assets, trust boundaries, confirmed
vulnerabilities, identities, privileges, and dependencies. It connects individually low-severity
findings into possible multi-stage attack paths, applies deterministic feasibility checks, and
simulates an LLM layer that explains and ranks the surviving paths.

> **Laboratory demonstration · Simulated analysis.** All data is predefined and fictional. There is
> no backend, scanning, exploitation, or live LLM call. Findings are *confirmed observations*; attack
> paths are *inferred possibilities*. The project combines existing findings — it does not predict
> undiscovered vulnerabilities.

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

### Other scripts

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run typecheck  # type-check only
```

## Tech stack

- **React 18 + TypeScript**
- **Vite 6**
- **Tailwind CSS 4**
- **React Flow (@xyflow/react)** — interactive environment graph
- **Lucide** — line icons
- Local mock data + React context for state; `localStorage` remembers the last-opened view

## Screens

1. **Overview** — summary cards, miniature graph, top-ranked paths, severity & source charts, activity.
2. **Environment Graph** — the centerpiece: pan/zoom canvas, trust-zone containers, entity/zone
   filters, inferred-relationship and boundary toggles, path highlighting with boundary-crossing
   detail, and a node inspector.
3. **Findings & Evidence** — searchable/filterable/sortable table, evidence drawer, and a local-only
   JSON import modal with a sample dataset.
4. **Attack Paths** — ranked cards with a transparent *Demo priority score*, rich filters, a
   per-path detail workspace (steps, deterministic checks, simulated LLM explanation, mitigations),
   and a **Simulate mitigation** panel that visually breaks relationships and blocks dependent paths.
5. **Reasoning Comparison** — deterministic graph analysis vs simulated LLM analysis side by side,
   with a worked example of a path rejected because no network relationship exists. The LLM never
   overrides a failed hard constraint.
6. **Reports** — a printable report preview (Print / Save as PDF via a print stylesheet) plus
   Download JSON.

## Data model

Everything renders from a single source of truth in [`src/data/mockData.ts`](src/data/mockData.ts):
12 assets, 4 identities, 3 privilege roles, 2 dependencies, 10 findings, 5 trust zones, and 8
candidate paths (5 feasible, 3 rejected). Every entity, edge, finding, and path has a stable ID
(`AS-xx`, `ID-xx`, `PR-xx`, `VF-xx`, `AP-xx`, `MIT-xx`, `E-xx`) referenced consistently across screens.

The demo priority score is defined transparently in [`src/data/scoring.ts`](src/data/scoring.ts)
and its weighting is exposed in the UI. It is an illustrative ranking aid, not a validated metric.
