# Lightweight Mock And Layout Fix Design

## Goal

Use the lightweight precise fix path approved by the user: improve the ted-sbrain mock experience for Chinese product review, increase mock data variety, fix the L1 detector dispatch button layout, and repair obvious layout issues caused by Chinese text or dense controls.

## Scope

In scope:

- Localize mock service data and user-facing mock messages into Chinese business wording.
- Add more mock fixture/template variety so list, topology, road, and detail views do not look repetitive.
- Fix the L1 detector dispatch controls: "下发全部探测器", "下发高风险探测器", "下发中风险探测器", and "下发低风险探测器".
- Inspect current L1, L2 list, L2 road, and L3 detail pages for obvious layout problems.
- Adjust layout structure, grid/flex behavior, wrapping, minimum widths, and overflow handling.

Out of scope:

- Redesigning the visual language.
- Changing theme tokens, colors, shadows, radii, typography style, or component visual treatment.
- Changing public API contracts for the mock service.
- Reworking unrelated page behavior.

## Approach

The implementation should stay small and local. Data changes belong in the existing mock fixtures/repository layer and shared fixture generation helpers. Layout changes should preserve existing class names where practical and change only structure or layout properties needed to stop controls and Chinese text from crowding each other.

## Data Design

The mock service should keep the same response shapes and endpoint behavior. Existing consumers should not need API changes.

The fixture set should include more Chinese systems, teams, owners, statuses, release types, metric descriptions, history points, and page-level data. Generated records should vary enough to produce different risk, phase, schedule, and ownership combinations across L1/L2/L3.

Any remaining English placeholder strings in mock responses should be replaced with concise Chinese product wording. Technical identifiers such as enum values, metric codes, route names, and account ids can remain English when they are part of the API contract.

## L1 Layout Design

The L1 canvas header should separate title, detector dispatch buttons, and scan speed controls into clear layout regions. The detector dispatch buttons are the primary fix target.

Expected behavior:

- Wide screens: title remains readable; detector buttons have their own stable area; scan speed does not overlap or squeeze the buttons.
- Medium screens: controls can wrap or move to a second row while preserving current visual styling.
- Narrow screens: controls stack naturally, button group uses full width, and long Chinese labels remain readable.

The button visual treatment should stay the same. Only placement, flow, and responsive behavior should change.

## Layout Audit Design

Review likely pressure points for Chinese text and dense controls:

- L1 command header and canvas header.
- L1 priority rows and topology footer.
- L2 overview toolbar, search/select controls, and summary cards.
- L2 version row metadata and score columns.
- L2 road range controls and legend.
- L3 detail header, identity bar, owner stack, timeline rows, focus items, and evidence rows.

Fixes should use existing classes and layout-only CSS where possible:

- `minmax(0, 1fr)` for text-bearing grid columns.
- `flex-wrap` for dense inline groups.
- Stable control widths only where needed.
- Overflow and text wrapping rules for long Chinese labels.
- Responsive stacking in existing media queries.

## Testing And Verification

Run the existing unit tests and build after implementation. If the dev server can run, visually inspect L1/L2/L3 at desktop and mobile widths, with special attention to the L1 detector buttons and text overflow in rows/panels.

Success criteria:

- Mock service responses no longer feel English-first.
- Mock data has visibly more variety.
- L1 detector dispatch buttons are no longer crowded by the scan speed control.
- Obvious Chinese text layout issues are fixed without changing the visual style.
- Existing tests and build pass, or any remaining failures are reported with clear cause.
