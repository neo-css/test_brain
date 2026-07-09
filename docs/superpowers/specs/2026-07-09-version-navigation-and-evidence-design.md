# Version Navigation And Evidence Interaction Design

## Goal

Reshape the current L1/L2/L3 wording and page ownership into a clearer product information architecture while preserving the existing aircraft-style topology page, version list, road visualization, and version detail visual style.

## Scope

In scope:

- Keep `/` as the temporary home page using the current situation-awareness view.
- Add the current situation-awareness view as one of the version module views.
- Rename user-facing L1/L2/L3 wording:
  - L2 becomes `版本列表`, the version module.
  - The current aircraft/topology view becomes `态势感知`.
  - The current list view remains `版本列表`.
  - The current snake-road view becomes `版本轨迹`.
  - L3 becomes `版本详情`.
- Change the home/situation-awareness risk control from detector-dispatch buttons to a risk filter dropdown with `全部风险`, `高风险`, `中风险`, `低风险`, and `未知风险`.
- Change version detail evidence from a bottom EVIDENCE list to metric-specific evidence shown by clicking a dimension in the hexagon/radar chart.
- Change `返回 L1` labels to `返回首页`.

Out of scope:

- Designing the final real home page.
- Redesigning the aircraft/topology visualization.
- Redesigning the snake-road visualization.
- Changing the visual theme, color palette, or major layout style.
- Replacing the current mock/API data model.

## Route And Navigation Design

The temporary home page remains:

- `/`: temporary home, renders the current situation-awareness aircraft/topology page.

The version module has three views:

- `/versions/overview`: `态势感知`, reuses the current aircraft/topology page.
- `/versions`: `版本列表`, keeps the current searchable/sortable version list page.
- `/versions/road`: `版本轨迹`, keeps the current snake-road page.

The detail page remains:

- `/versions/:patchId`: `版本详情`.

The version view switch should become a three-option switch: `态势感知`, `版本列表`, `版本轨迹`. The existing icon/button vocabulary should be reused. Existing links that say `返回 L1` should say `返回首页`.

## Situation-Awareness Risk Filter

The current detector-dispatch button group should be replaced with a standard select control. It should filter the topology by risk level using the same state currently used by the buttons.

Options:

- `ALL`: `全部风险`
- `HIGH`: `高风险`
- `MEDIUM`: `中风险`
- `LOW`: `低风险`
- `UNKNOWN`: `未知风险`

The language should stop implying command dispatch. The control label should communicate filtering, such as `风险筛选`.

## Version Detail Evidence Interaction

The metric hexagon/radar chart should become the primary evidence entry point.

Expected behavior:

- Each metric dimension in the chart is clickable and keyboard accessible.
- Clicking a metric selects it and reveals that metric's evidence details near the radar chart.
- Enter and Space activate the focused metric.
- A selected state is visible but should use the existing visual vocabulary.
- The details reuse the existing EVIDENCE content: metric name, phase/dimension/target metadata, actual score, calculated score, and fact values.
- The default selected metric should be the first highest-risk metric, falling back to the first metric.
- The bottom EVIDENCE list should no longer be the primary display. It can be removed or replaced by the metric-specific evidence panel, as long as the evidence remains accessible.

## Naming And Copy Design

Avoid exposing L1/L2/L3 as user-facing labels except where legacy code names remain internal.

Preferred user-facing names:

- `首页`
- `版本列表`
- `态势感知`
- `版本轨迹`
- `版本详情`

The snake-road view should use `版本轨迹` because it communicates a time/path-based release progression and avoids confusion with `态势感知`.

## Implementation Constraints

- Preserve current aircraft/topology visuals.
- Preserve current snake-road visuals.
- Keep changes focused on routing, labels, controls, and detail interaction.
- Reuse existing components and CSS classes where practical.
- Add small local components only when they clarify responsibilities, such as a metric evidence panel or selectable radar metric control.

## Testing And Verification

Implementation should include focused tests for:

- The three-option version view switch.
- The risk dropdown including `未知风险`.
- Route availability for `/`, `/versions/overview`, `/versions`, `/versions/road`, and `/versions/:patchId`.
- Version detail metric evidence selection and keyboard activation.
- User-facing copy changes from `返回 L1` to `返回首页`.

Run the full test suite and build after implementation. If possible, visually inspect the temporary home, all three version views, and version detail to confirm the aircraft and snake-road styles are preserved.

## Success Criteria

- Users see `版本列表` as the module, with three clear views: `态势感知`, `版本列表`, and `版本轨迹`.
- The temporary home remains usable and can be replaced later.
- The topology risk control behaves like a familiar filter dropdown and supports unknown risk.
- Version detail evidence is discovered through the hexagon/radar chart instead of a long bottom list.
- Existing visual identity is preserved.
