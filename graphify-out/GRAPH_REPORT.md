# Graph Report - .  (2026-06-03)

## Corpus Check
- 29 files · ~17,476 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 225 nodes · 405 edges · 19 communities (9 shown, 10 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.91)
- Token cost: 185,105 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Pilates App UI Tabs|Pilates App UI Tabs]]
- [[_COMMUNITY_App Shell & Camera Capture|App Shell & Camera Capture]]
- [[_COMMUNITY_NPM Dependencies Manifest|NPM Dependencies Manifest]]
- [[_COMMUNITY_Finance & Telegram Backend|Finance & Telegram Backend]]
- [[_COMMUNITY_Layout, Cache & PWA Theme|Layout, Cache & PWA Theme]]
- [[_COMMUNITY_TypeScript Compiler Options|TypeScript Compiler Options]]
- [[_COMMUNITY_API Routes & Domain Concepts|API Routes & Domain Concepts]]
- [[_COMMUNITY_Supabase Persistence & PWA Wrapper|Supabase Persistence & PWA Wrapper]]
- [[_COMMUNITY_PWA Manifest Metadata|PWA Manifest Metadata]]
- [[_COMMUNITY_Claude Code Permissions|Claude Code Permissions]]
- [[_COMMUNITY_Next.js PWA Config|Next.js PWA Config]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_TailwindPostCSS Integration|Tailwind/PostCSS Integration]]
- [[_COMMUNITY_Tailwind Configuration|Tailwind Configuration]]
- [[_COMMUNITY_Claude Permissions Allowlist|Claude Permissions Allowlist]]
- [[_COMMUNITY_Next.js ESLint Preset|Next.js ESLint Preset]]
- [[_COMMUNITY_Project README|Project README]]
- [[_COMMUNITY_TS Compiler Settings|TS Compiler Settings]]

## God Nodes (most connected - your core abstractions)
1. `PilatesApp root component` - 17 edges
2. `compilerOptions` - 15 edges
3. `mixAlpha()` - 12 edges
4. `PatientDetailView()` - 9 edges
5. `B` - 9 edges
6. `PostureTab (AI posture analysis)` - 9 edges
7. `uid()` - 8 edges
8. `POST()` - 7 edges
9. `FinancialTab()` - 7 edges
10. `CameraPhotoModal()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `pilates-studio package manifest` --references--> `supabase client`  [INFERRED]
  package.json → lib/supabase.ts
- `POST()` --calls--> `loadStudioPatients()`  [EXTRACTED]
  app/api/telegram/webhook/route.ts → lib/studio-server.ts
- `daysUntilBirthday()` --semantically_similar_to--> `ReportsView (monthly KPIs)`  [INFERRED] [semantically similar]
  app/api/telegram/webhook/telegram-utils.ts → app/components/pilates/ReportsView.jsx
- `isBirthdayWeek()` --calls--> `daysUntilBirthday()`  [EXTRACTED]
  app/components/PilatesApp.jsx → lib/pilates-utils.js
- `generateReceipt()` --semantically_similar_to--> `generatePosturePDF()`  [INFERRED] [semantically similar]
  app/components/PilatesApp.jsx → app/components/pilates/PostureTab.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Claude AI consultation flow (UI -> proxy -> Anthropic)** — components_pilatesapp_chattab, components_pilatesapp_evaluationtab, pilates_posturetab_analyzephotodataurl, claude_route_post [INFERRED 0.85]
- **Offline-first persistence layer (cache + cloud + subscription)** — components_pilatesapp_readcache, components_pilatesapp_writecache, components_pilatesapp_pushtocloud, concept_offline_first_sync [INFERRED 0.90]
- **Posture capture & analysis pipeline** — pilates_posturetab_default, pilates_posturecameramodals_cameraphotomodal, pilates_posturecameramodals_cameravideomodal, pilates_posturetab_analyzephotodataurl, pilates_posturetab_generateposturepdf [INFERRED 0.90]
- **studio_data Key-Value Store Access Pattern** — lib_supabase_savedb, lib_supabase_loaddb, lib_supabase_subscribedb, lib_supabase_studio_data_table [INFERRED 0.90]
- **Telegram Pending-Cancel Lifecycle** — lib_telegram_pending_getpendingcancel, lib_telegram_pending_setpendingcancel, lib_telegram_pending_deletependingcancel, lib_telegram_pending_loadpruned, lib_telegram_pending_pruneexpired [INFERRED 0.85]

## Communities (19 total, 10 thin omitted)

### Community 0 - "Pilates App UI Tabs"
Cohesion: 0.09
Nodes (34): AnamnesisTab, CalendarView, ChatTab(), CostsView(), EvaluationTab(), FinancialTab(), fmtDate(), generateReceipt() (+26 more)

### Community 1 - "App Shell & Camera Capture"
Cohesion: 0.12
Nodes (29): PilatesApp(), Sidebar(), Pink/Teal brand palette, getCameraStream, getCameraStream(), getFacingModeForDefault(), pickRecorderMime, pickRecorderMime() (+21 more)

### Community 2 - "NPM Dependencies Manifest"
Cohesion: 0.08
Nodes (23): dependencies, next, next-pwa, react, react-dom, @supabase/supabase-js, devDependencies, eslint (+15 more)

### Community 3 - "Finance & Telegram Backend"
Cohesion: 0.20
Nodes (18): PatientsView(), getCurrentMonthFinancialSummary(), getMonthlyRevenueLast6Months(), isOverdue30Days(), Patient Financial Payments Shape, deletePendingCancel(), getClient(), getPendingCancel() (+10 more)

### Community 4 - "Layout, Cache & PWA Theme"
Cohesion: 0.15
Nodes (17): metadata, RootLayout(), viewport, Home(), PilatesApp root component, LS_KEY(), pushToCloud helper, readCache() (+9 more)

### Community 5 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "API Routes & Domain Concepts"
Cohesion: 0.14
Nodes (15): ClaudeBody, POST(), FinancialView, Claude API proxy pattern, Patient record data shape, AnamnesisTab (clinical intake form), getFacingModeForDefault, preferRearCamera heuristic (+7 more)

### Community 7 - "Supabase Persistence & PWA Wrapper"
Cohesion: 0.26
Nodes (11): getSupabase(), loadStudioAppointments(), loadStudioPatients(), loadDB(), saveDB(), studio_data key-value table, subscribeDB(), supabase (+3 more)

### Community 8 - "PWA Manifest Metadata"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+4 more)

## Knowledge Gaps
- **75 isolated node(s):** `allow`, `extends`, `ClaudeBody`, `AnamnesisTab`, `PostureTab` (+70 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `studio_data key-value table` connect `Supabase Persistence & PWA Wrapper` to `Finance & Telegram Backend`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `mixAlpha()` connect `App Shell & Camera Capture` to `Pilates App UI Tabs`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `PostureTab (AI posture analysis)` connect `API Routes & Domain Concepts` to `Pilates App UI Tabs`, `App Shell & Camera Capture`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PilatesApp root component` (e.g. with `Appointment data shape` and `Patient record data shape`) actually correct?**
  _`PilatesApp root component` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `B` (e.g. with `PwaTheme()` and `Pink/Teal brand palette`) actually correct?**
  _`B` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `allow`, `extends`, `ClaudeBody` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pilates App UI Tabs` be split into smaller, more focused modules?**
  _Cohesion score 0.08773784355179703 - nodes in this community are weakly interconnected._