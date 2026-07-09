# Lightweight Mock And Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize and enrich ted-sbrain mock data, fix the L1 detector dispatch button layout, and repair obvious Chinese text layout issues without changing the visual style.

**Architecture:** Keep API contracts and component styling intact. Update mock fixture generation in place, adjust affected tests to assert Chinese data variety, then make layout-only changes to the L1 header/control area and nearby overflow-prone CSS rules.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, existing CSS and ted-sbrain mock service.

---

## File Structure

- Modify `src/mocks/tedSbrain/fixtures.ts`: replace English fixture strings with Chinese business data and add more snapshots/templates.
- Modify `src/mocks/tedSbrain/http.ts`: localize response messages while preserving wrapper shape.
- Modify `src/mocks/tedSbrain/repository.test.ts`: assert expanded fixture count and Chinese fixture fields.
- Modify `src/mocks/tedSbrain/http.test.ts`: assert localized response messages and updated pagination totals.
- Modify `src/pages/L1DashboardPage.tsx`: wrap detector dispatch buttons and scan speed into separate layout regions.
- Modify `src/styles.css`: layout-only updates for L1 controls and obvious Chinese text overflow points.

### Task 1: Mock Data Localization And Variety

**Files:**
- Modify: `src/mocks/tedSbrain/fixtures.ts`
- Test: `src/mocks/tedSbrain/repository.test.ts`

- [ ] **Step 1: Update repository tests for Chinese fixtures and more data**

Add expectations that the repository exposes at least eight snapshots, Chinese system names, Chinese owners, and grouped metric names.

Run: `npm test -- src/mocks/tedSbrain/repository.test.ts`
Expected before implementation: FAIL because current fixtures are English and only four records exist.

- [ ] **Step 2: Localize fixture generation**

In `fixtures.ts`, change `makeSnapshot` generated fields to Chinese owner/test/dev labels and localized audit metadata. Replace metric names, phase names, dimension names, target names, descriptions, and features with Chinese wording.

- [ ] **Step 3: Add more snapshots and history variety**

Expand `scoreSnapshots` from four records to at least ten Chinese records covering `LOW`, `MEDIUM`, `HIGH`, and `UNKNOWN`, with varied systems, teams, statuses, release types, schedules, and owners. Keep `patchScores` generated from `scoreSnapshots`, and add multi-point history for at least two patch ids.

- [ ] **Step 4: Run repository tests**

Run: `npm test -- src/mocks/tedSbrain/repository.test.ts`
Expected: PASS.

### Task 2: Mock HTTP Message Localization

**Files:**
- Modify: `src/mocks/tedSbrain/http.ts`
- Test: `src/mocks/tedSbrain/http.test.ts`

- [ ] **Step 1: Update HTTP tests**

Assert success wrappers return `message: "请求成功"` and missing patch wrappers return `message: "未找到版本评分"`. Update pagination totals and expected page 2 records for the expanded dataset.

Run: `npm test -- src/mocks/tedSbrain/http.test.ts`
Expected before implementation: FAIL because messages and totals are still old.

- [ ] **Step 2: Localize HTTP response messages**

Change `successResponse` default message to Chinese. Replace missing patch, missing snapshot, and route-not-found messages with concise Chinese wording.

- [ ] **Step 3: Run HTTP tests**

Run: `npm test -- src/mocks/tedSbrain/http.test.ts`
Expected: PASS.

### Task 3: L1 Detector Dispatch Layout

**Files:**
- Modify: `src/pages/L1DashboardPage.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Separate L1 control regions**

In `L1DashboardPage.tsx`, wrap `.l1-risk-filter` and `.l1-speed-control` in a new `.l1-canvas-controls` container. Keep the existing button labels and classes.

- [ ] **Step 2: Update layout-only CSS**

In `styles.css`, change `.l1-canvas-header` to a two-column layout where the title owns the left column and `.l1-canvas-controls` owns the right column. Make `.l1-canvas-controls` wrap the detector group and speed control without overlap. Preserve existing button, border, background, color, radius, shadow, and transition rules.

- [ ] **Step 3: Update responsive rules**

At existing L1 breakpoints, make `.l1-canvas-controls`, `.l1-risk-filter`, and `.l1-speed-control` stretch to full width and stack naturally on narrow screens.

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: PASS.

### Task 4: Layout Audit Fixes

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Patch obvious overflow-prone layouts**

Apply layout-only improvements:

- Let `.l1-header-actions` wrap.
- Ensure `.l1-priority-row` text columns can shrink with `minmax(0, 1fr)`.
- Let `.row-meta-grid` and `.row-signal-line` wrap predictably for Chinese labels.
- Let `.identity-bar` and `.timeline-row` avoid squeezing long Chinese text.
- Let `.road-range-info` wrap instead of forcing controls apart.

- [ ] **Step 2: Run full tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Optional browser verification**

If the dev server starts successfully, inspect L1, version list, road page, and detail page at desktop and mobile widths. Confirm the L1 detector buttons do not collide with scan speed and Chinese text does not visibly overflow key panels.
