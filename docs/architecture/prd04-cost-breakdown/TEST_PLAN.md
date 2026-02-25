# Frontend Test Plan: Cost Breakdown for Custom Costs (Phase 1)

**PRD Reference:** [PRD04](https://github.com/project-koku/koku/blob/main/docs/architecture/prd04-cost-breakdown/README.md)
**Backend DD:** [DD04](https://github.com/project-koku/koku/blob/main/docs/architecture/prd04-cost-breakdown/DETAILED_DESIGN.md)
**Frontend Plan:** [FRONTEND_PLAN.md](FRONTEND_PLAN.md)
**Phase:** Phase 1 (COST-2105)
**Repository:** koku-ui
**Last updated:** 2026-02-16

---

## How to Read This Document

Tests are numbered `FT-<area>.<seq>` (Frontend Test). Each test specifies:

- **Test file** — Where the test lives (existing or new)
- **Preconditions** — Required mock data or setup
- **Action** — What is exercised
- **Expected result** — What to assert
- **PRD traceability** — Which acceptance criterion it validates

Mock data fixtures are defined in the [Mock Data Fixtures](#mock-data-fixtures) section at the end and referenced by name throughout.

**Type correctness:** TypeScript interfaces (`BreakdownEntry`, `ReportValue`, `Rate`, `RateRequest`) are validated by compilation (`npx tsc --noEmit`), not by dedicated runtime tests. This follows the codebase convention — no compile-time-only type tests exist in koku-ui.

---

## Test Conventions

Based on the existing koku-ui-hccm codebase:

| Convention | Value |
|---|---|
| **Framework** | Jest 30 + @testing-library/react 16 |
| **File naming** | `*.test.tsx` or `*.test.ts`, colocated with source |
| **Mocking** | `jest.mock('module')` for API/component mocks; inline fixtures for data |
| **Chart tests** | Snapshot tests via `toMatchSnapshot()` on `getByTestId` wrapper element |
| **Reducer tests** | Direct `reducer(state, action)` calls; assertions use `.toEqual()` |
| **Component tests** | `render()` + `screen` queries + `userEvent` interactions |
| **OUIA test IDs** | `configure({ testIdAttribute: 'data-ouia-component-id' })` for PatternFly components |
| **Fake timers** | Globally enabled; component tests must use `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })` |
| **i18n assertions** | `import messages from 'locales/messages'` + `const regExp = (msg) => new RegExp(msg.defaultMessage)` |
| **Redux store** | `configureStore({} as any)` with `<Provider>` wrapper for component tests |
| **E2E** | Cypress (in `koku-ui-onprem`; not currently used in hccm) |

---

## Table of Contents

1. [Part A: Rate Name Field Tests](#part-a-rate-name-field-tests)
2. [Part B: Sankey Diagram Tests](#part-b-sankey-diagram-tests)
3. [Part C: Cross-View Verification Tests](#part-c-cross-view-verification-tests)
4. [Part D: Cost Details Tree Table Tests](#part-d-cost-details-tree-table-tests)
5. [Mock Data Fixtures](#mock-data-fixtures)
6. [Traceability Matrix](#traceability-matrix)
7. [Summary](#summary)

---

## Part A: Rate Name Field Tests

### A1. Reducer — `UPDATE_NAME` action

**Test file:** `routes/settings/costModels/components/rateForm/useRateForm.test.tsx` (existing — add tests)

These follow the existing pattern of testing `rateFormReducer(state, action)` directly. Assertions use `.toEqual()` matching the existing test convention.

#### FT-A1.1 `UPDATE_NAME sets name and clears error`

```typescript
describe('UPDATE_NAME action', () => {
  test('UPDATE_NAME with valid name sets name and clears error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'CPU charge' }
    );
    expect(state.name).toEqual('CPU charge');
    expect(state.errors.name).toEqual(null);
  });
```

- **Preconditions:** Rate form in `set_rate` step
- **Expected:** `state.name` is set, `state.errors.name` is null
- **PRD:** AC-FE-1 (rate form includes name field)

#### FT-A1.2 `UPDATE_NAME with empty string sets required error`

```typescript
  test('UPDATE_NAME with empty string sets required error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate', name: 'previously set' },
      { type: 'UPDATE_NAME', value: '' }
    );
    expect(state.name).toEqual('');
    expect(state.errors.name).toBeTruthy(); // required error message
  });
```

- **Preconditions:** Rate form in `set_rate` step with existing name
- **Expected:** `state.errors.name` contains required error message
- **PRD:** AC-FE-1 (name field required)

#### FT-A1.3 `UPDATE_NAME with >50 chars sets too-long error`

```typescript
  test('UPDATE_NAME with >50 chars sets too-long error', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'X'.repeat(51) }
    );
    expect(state.name).toEqual('X'.repeat(51));
    expect(state.errors.name).toBeTruthy(); // max length error
  });
```

- **Preconditions:** Rate form in `set_rate` step
- **Expected:** `state.errors.name` contains max-length error message
- **PRD:** AC-FE-1 (max 50 chars)

#### FT-A1.4 `UPDATE_NAME with exactly 50 chars is valid`

```typescript
  test('UPDATE_NAME with exactly 50 chars is valid', () => {
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate' },
      { type: 'UPDATE_NAME', value: 'X'.repeat(50) }
    );
    expect(state.name).toEqual('X'.repeat(50));
    expect(state.errors.name).toEqual(null);
  });
```

- **Preconditions:** Rate form in `set_rate` step
- **Expected:** No error at boundary
- **PRD:** AC-FE-1 (max 50 chars — boundary)

#### FT-A1.5 `UPDATE_NAME with duplicate name sets uniqueness error`

```typescript
  test('UPDATE_NAME with duplicate name sets uniqueness error', () => {
    const otherTiers = [
      { name: 'CPU charge', metric: { name: 'cpu_core_usage_per_hour' }, cost_type: 'Infrastructure' },
    ] as Rate[];
    const state = rateFormReducer(
      { ...initialRateFormData, step: 'set_rate', otherTiers },
      { type: 'UPDATE_NAME', value: 'CPU charge' }
    );
    expect(state.errors.name).toBeTruthy(); // duplicate error message
  });
```

- **Preconditions:** `otherTiers` contains a rate with name "CPU charge"
- **Expected:** `state.errors.name` contains uniqueness error
- **PRD:** AC-FE-1 (unique within cost model)

#### FT-A1.6 `UPDATE_NAME discarded unless step is set_rate`

```typescript
  test('UPDATE_NAME is discarded unless step is set_rate', () => {
    const state = rateFormReducer(undefined, { type: 'UPDATE_NAME', value: 'test' });
    expect(state.name).toEqual(initialRateFormData.name);
  });
}); // end describe('UPDATE_NAME action')
```

- **Preconditions:** Default initial state (step is not `set_rate`)
- **Expected:** Name not updated (follows existing reducer guard pattern)

### A2. Form data utilities

**Test file:** `routes/settings/costModels/components/rateForm/useRateForm.test.tsx` (existing — add tests)

#### FT-A2.1 `transformFormDataToRequest includes name`

```typescript
describe('form data utilities with name', () => {
  test('transformFormDataToRequest includes name in output', () => {
    const metricsHash = {
      cpu_core_usage_per_hour: {
        Usage: {
          metric: 'cpu_core_usage_per_hour',
          label_metric: 'CPU',
          label_measurement: 'Usage',
          label_measurement_unit: 'core-hours',
        },
      },
    };
    const formData = {
      ...initialRateFormData,
      name: 'CPU charge',
      step: 'set_rate',
      rateKind: 'regular',
      metric: 'cpu_core_usage_per_hour',
      measurement: { value: 'Usage', isDirty: true },
      calculation: 'Infrastructure',
      tieredRates: [{ isDirty: true, value: '0.05' }],
    };
    const request = transformFormDataToRequest(formData, metricsHash, 'USD');
    expect(request.name).toEqual('CPU charge');
  });
```

- **Expected:** Output `RateRequest` includes `name: 'CPU charge'`
- **PRD:** AC-FE-1

#### FT-A2.2 `genFormDataFromRate populates name`

```typescript
  test('genFormDataFromRate populates name from rate', () => {
    const rate: Rate = {
      name: 'Memory charge',
      metric: { name: 'memory_gb_usage_per_hour', label_metric: 'Memory', label_measurement: 'Usage', label_measurement_unit: 'GB-hours' },
      tiered_rates: [{ value: 0.03, unit: 'USD', usage: { unit: 'GB-hours' } }],
      cost_type: 'Supplementary',
    };
    const formData = genFormDataFromRate(rate, '', []);
    expect(formData.name).toEqual('Memory charge');
  });
```

- **Expected:** Form data has name from rate
- **PRD:** AC-FE-1 (editing pre-existing rate)

#### FT-A2.3 `genFormDataFromRate with no name defaults to empty`

```typescript
  test('genFormDataFromRate with no name defaults to empty string', () => {
    const rate: Rate = {
      metric: { name: 'cpu_core_usage_per_hour', label_metric: 'CPU', label_measurement: 'Usage', label_measurement_unit: 'core-hours' },
      tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
      cost_type: 'Infrastructure',
    };
    const formData = genFormDataFromRate(rate, '', []);
    expect(formData.name).toEqual('');
  });
}); // end describe('form data utilities with name')
```

- **Expected:** Graceful fallback for legacy rates without name

### A3. Form submit validation — canSubmit

**Test file:** `routes/settings/costModels/components/rateForm/canSubmit.test.ts` (new — colocated with `canSubmit.tsx`)

This follows the codebase convention for pure utility functions (e.g., `format.test.ts`, `chartUtils.extra.test.ts`).

#### FT-A3.1 `canSubmit returns false when name has error`

```typescript
import { canSubmit } from './canSubmit';
import { initialRateFormData } from './utils';

describe('canSubmit with name field', () => {
  test('canSubmit returns false when name has an error', () => {
    const formData = {
      ...initialRateFormData,
      step: 'set_rate',
      rateKind: 'regular',
      errors: { ...initialRateFormData.errors, name: 'Rate name is required' },
      metric: 'cpu_core_usage_per_hour',
      measurement: { value: 'Usage', isDirty: true },
      calculation: 'Infrastructure',
    };
    expect(canSubmit(formData)).toEqual(false);
  });
```

- **Expected:** Form cannot submit with name error
- **PRD:** AC-FE-1 (required field enforcement)

#### FT-A3.2 `canSubmit returns true when name is valid`

```typescript
  test('canSubmit returns true when name and all other fields are valid', () => {
    const formData = {
      ...initialRateFormData,
      step: 'set_rate',
      rateKind: 'regular',
      name: 'CPU charge',
      errors: { ...initialRateFormData.errors, name: null, measurement: null, tieredRates: null },
      metric: 'cpu_core_usage_per_hour',
      measurement: { value: 'Usage', isDirty: true },
      calculation: 'Infrastructure',
      tieredRates: [{ isDirty: true, value: '0.05' }],
    };
    expect(canSubmit(formData)).toEqual(true);
  });
}); // end describe('canSubmit with name field')
```

- **Expected:** Valid form can submit
- **PRD:** AC-FE-1

### A4. Form UI — name input rendering

**Test file:** `routes/settings/costModels/components/addPriceList.test.tsx` (existing — add tests)

These follow the existing pattern: render `AddPriceList` wrapped in `RenderFormDataUI` (Redux `Provider` + `CostModelContext.Provider`), interact with `userEvent`. Uses `configure({ testIdAttribute: 'data-ouia-component-id' })` and `regExp()` for i18n messages.

#### FT-A4.1 `name input is rendered and required`

```typescript
describe('rate name field', () => {
  test('name input field is rendered', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RenderFormDataUI metricsHash={metricsHash} submit={jest.fn()} cancel={jest.fn()}>
        <AddPriceList {...defaultProps} />
      </RenderFormDataUI>
    );
    // Navigate to set_rate step (follow existing test pattern for step navigation)
    // ...
    const nameInput = screen.getByLabelText(regExp(messages.rateName));
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();
  });
```

- **Expected:** Name input visible and marked required
- **PRD:** AC-FE-1

#### FT-A4.2 `name input shows validation error on blur when empty`

```typescript
  test('name input shows error when blurred empty', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RenderFormDataUI metricsHash={metricsHash} submit={jest.fn()} cancel={jest.fn()}>
        <AddPriceList {...defaultProps} />
      </RenderFormDataUI>
    );
    // Navigate to rate step, focus then blur name field
    const nameInput = screen.getByLabelText(regExp(messages.rateName));
    await user.click(nameInput);
    await user.tab();
    expect(screen.getByText(regExp(messages.rateNameRequired))).toBeInTheDocument();
  });
```

- **Expected:** Error message displayed
- **PRD:** AC-FE-1

#### FT-A4.3 `submit button disabled when name is empty`

```typescript
  test('submit button is disabled when name is not filled', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <RenderFormDataUI metricsHash={metricsHash} submit={jest.fn()} cancel={jest.fn()}>
        <AddPriceList {...defaultProps} />
      </RenderFormDataUI>
    );
    // Fill all fields EXCEPT name, navigate to final step
    // ...
    expect(screen.getByRole('button', { name: regExp(messages.createRate) })).toBeDisabled();
  });
}); // end describe('rate name field')
```

- **Expected:** Cannot submit without name
- **PRD:** AC-FE-1

### A5. Rate table — name column

**Test file:** `routes/settings/costModels/components/rateTable.test.tsx` (existing — add tests to the 176-line file that has smoke, expand, and sort tests)

#### FT-A5.1 `rate table displays name column`

```typescript
describe('rate name column', () => {
  test('rate table includes Name column header', () => {
    configure({ testIdAttribute: 'data-ouia-component-id' });
    const tiers = [MOCK_RATE_CPU_CHARGE, MOCK_RATE_MEMORY_CHARGE];
    render(<RateTable tiers={tiers} />);
    expect(screen.getByText(regExp(messages.rateName))).toBeInTheDocument();
  });
```

- **Expected:** "Name" column header present
- **PRD:** AC-FE-1

#### FT-A5.2 `rate table displays rate names in rows`

```typescript
  test('rate table displays rate name values', () => {
    configure({ testIdAttribute: 'data-ouia-component-id' });
    const tiers = [MOCK_RATE_CPU_CHARGE, MOCK_RATE_MEMORY_CHARGE];
    render(<RateTable tiers={tiers} />);
    expect(screen.getByText('CPU charge')).toBeInTheDocument();
    expect(screen.getByText('Memory charge')).toBeInTheDocument();
  });
}); // end describe('rate name column')
```

- **Expected:** Rate names from fixture data visible in table rows
- **PRD:** AC-FE-1

### A6. API types — runtime smoke test

**Test file:** `api/rates.test.ts` (existing — add tests to the 10-line file that has one `fetchRate` test)

#### FT-A6.1 `RateRequest with name compiles and runs`

```typescript
test('RateRequest with name field is accepted', () => {
  const request: RateRequest = {
    name: 'CPU charge',
    metric: { name: 'cpu_core_usage_per_hour' },
    tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
    cost_type: 'Infrastructure',
  };
  expect(request.name).toEqual('CPU charge');
});
```

- **Expected:** TypeScript compiles; runtime assertion passes
- **PRD:** AC-FE-1

#### FT-A6.2 `Rate type includes name`

```typescript
test('Rate interface includes name field', () => {
  const rate: Rate = {
    name: 'Memory charge',
    metric: { name: 'memory_gb_usage_per_hour', label_metric: 'Memory', label_measurement: 'Usage', label_measurement_unit: 'GB-hours' },
    tiered_rates: [{ value: 0.03, unit: 'USD', usage: { unit: 'GB-hours' } }],
    cost_type: 'Supplementary',
  };
  expect(rate.name).toEqual('Memory charge');
});
```

- **Expected:** TypeScript compiles with `name` field
- **PRD:** AC-FE-1

---

## Part B: Sankey Diagram Tests

### Required test setup for CostBreakdownChart

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx` (new)

The `CostBreakdownChart` component uses ECharts (via `@patternfly/react-charts/echarts`), `getResizeObserver`, and `injectIntl`. All must be mocked in jsdom. The `__mocks__/react-intl.ts` handles `injectIntl` automatically.

**Implementation precondition:** Add `data-testid="cost-breakdown-chart-wrapper"` to the outer `<div>` in `costBreakdownChart.tsx` for snapshot targeting (matching the `usageChart` convention of `data-testid="usage-chart-wrapper"`).

```typescript
import { configure, render, screen } from '@testing-library/react';
import React from 'react';
import messages from 'locales/messages';

// Mock ECharts — prevents real SVG rendering in jsdom
jest.mock('@patternfly/react-charts/echarts', () => ({
  Charts: ({ id, option, height, width }: any) => (
    <div data-testid="echarts-chart" data-chart-id={id} data-width={width}>
      {JSON.stringify(option?.series)}
    </div>
  ),
  ThemeColor: { skeleton: 'skeleton', green: 'green' },
}));
jest.mock('echarts/core', () => ({ use: jest.fn() }));
jest.mock('echarts/charts', () => ({ SankeyChart: {} }));
jest.mock('echarts/components', () => ({ TitleComponent: {}, TooltipComponent: {} }));
jest.mock('echarts/renderers', () => ({ SVGRenderer: {} }));

// Mock getResizeObserver — sets width without real ResizeObserver/timers
jest.mock('routes/components/charts/common', () => ({
  ...jest.requireActual('routes/components/charts/common'),
  getResizeObserver: () => (_: any, cb: any) => {
    cb?.({ clientWidth: 400 });
    return () => {};
  },
}));
```

The mocked `Charts` component serializes `option.series` as JSON, allowing tests to assert on the Sankey data structure (nodes, links) without rendering real SVG. This follows the pattern from `costChart.test.tsx` (which mocks Victory charts similarly).

**Note on providers:** `CostBreakdownChart` uses `injectIntl` (mocked by `src/__mocks__/react-intl.ts` automatically) and does not use Redux, so no `<Provider>` wrapper is needed. Pass `report` as a prop directly.

### B1. Sankey chart — data transformation (initDatum)

These tests exercise the chart's data transformation logic. The component reads `report.meta.total.cost` and produces Sankey `nodes[]` and `links[]` for ECharts.

#### FT-B1.1 `renders without breakdown data (backward compatibility)`

```typescript
describe('CostBreakdownChart', () => {
  describe('backward compatibility', () => {
    test('renders chart with no breakdown arrays', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_NO_BREAKDOWN} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
      // Snapshot baseline — existing 4-layer Sankey
      expect(wrapper).toMatchSnapshot();
    });
  });
```

- **Preconditions:** `MOCK_REPORT_NO_BREAKDOWN` — report with usage/raw/markup values but no `breakdown` arrays
- **Expected:** Chart renders the existing 4-layer Sankey unchanged
- **PRD:** AC-FE-4 (backward compat)

#### FT-B1.2 `renders usage breakdown as additional leftmost nodes`

```typescript
  describe('usage breakdown', () => {
    test('renders usage breakdown entries as Sankey nodes on the left', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      // Verify rate name nodes exist in serialized series data
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      expect(screen.getByText(/Memory charge/)).toBeInTheDocument();
      // Snapshot — 5-layer Sankey
      expect(wrapper).toMatchSnapshot();
    });
```

- **Preconditions:** `MOCK_REPORT_WITH_BREAKDOWN` — report with `usage.breakdown` containing 2 rate entries
- **Expected:** Rate name nodes rendered; snapshot shows 5-layer structure
- **PRD:** AC-FE-2 (Sankey renders rate names)

#### FT-B1.3 `renders overhead breakdown entries`

```typescript
    test('renders overhead breakdown entries flowing to overhead nodes', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN} />);
      // Rate name nodes connected to overhead categories
      expect(screen.getByText(/Node monthly/)).toBeInTheDocument();
      // "Cloud cost" placeholder for non-attributed cloud cost
      expect(screen.getByText(/Cloud cost/)).toBeInTheDocument();
    });
```

- **Preconditions:** `MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN` — report with `platform_distributed.breakdown` and `worker_unallocated_distributed.breakdown`
- **Expected:** Overhead rate name nodes and "Cloud cost" node rendered
- **PRD:** AC-FE-3 (overhead types receive flow from rate names)

#### FT-B1.4 `rate name node has multiple outgoing links`

```typescript
    test('rate name node has outgoing links to multiple categories', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_MULTI_LINK} />);
      // "Node monthly" appears in both usage and platform_distributed breakdown
      // Should be rendered as ONE node with TWO outgoing links
      const nodeMonthlyElements = screen.getAllByText(/Node monthly/);
      // ECharts Sankey renders each node name once
      expect(nodeMonthlyElements).toHaveLength(1);
    });
```

- **Preconditions:** `MOCK_REPORT_MULTI_LINK` — "Node monthly" appears in both `usage.breakdown` and `platform_distributed.breakdown`
- **Expected:** Single node, multiple edges
- **PRD:** AC-FE-2, AC-FE-3

#### FT-B1.5 `raw, markup, and credit have no breakdown sub-layer`

```typescript
    test('raw, markup, and credit remain as leaf nodes without breakdown', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />);
      // raw and markup should be present as nodes (via serialized series JSON)
      // But they should NOT have rate-name sub-nodes linking into them
      // Verified via snapshot comparison against baseline
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toMatchSnapshot();
    });
  }); // end describe('usage breakdown')
```

- **Preconditions:** Report has `raw.value` and `markup.value` but no `raw.breakdown` or `markup.breakdown`
- **Expected:** Raw and markup are leaf nodes
- **PRD:** AC-FE-4

### B2. Sankey chart — edge cases

#### FT-B2.1 `handles empty breakdown arrays`

```typescript
  describe('edge cases', () => {
    test('handles empty breakdown array gracefully', () => {
      const report = {
        ...MOCK_REPORT_WITH_BREAKDOWN,
        meta: {
          ...MOCK_REPORT_WITH_BREAKDOWN.meta,
          total: {
            ...MOCK_REPORT_WITH_BREAKDOWN.meta.total,
            cost: {
              ...MOCK_REPORT_WITH_BREAKDOWN.meta.total.cost,
              usage: { value: 100, units: 'USD', breakdown: [] },
            },
          },
        },
      };
      render(<CostBreakdownChart report={report} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      // Should render usage node without rate-name sub-layer
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toMatchSnapshot();
    });
```

- **Expected:** Chart renders like the no-breakdown case; no crash
- **PRD:** D6 edge case

#### FT-B2.2 `handles zero-value breakdown entries`

```typescript
    test('handles zero-value breakdown entry', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.50,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 42.50, units: 'USD' },
            { name: 'Unused rate', source: 'rate', value: 0, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      // Zero-value entry may or may not be rendered (implementation decision)
      // But it must not crash
    });
```

- **Expected:** No crash; zero-value handling is graceful
- **PRD:** D6 edge case

#### FT-B2.3 `handles single-entry breakdown`

```typescript
    test('handles single-entry breakdown', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.50,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 42.50, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
    });
```

- **Expected:** Single rate-name node renders correctly
- **PRD:** D6 edge case

#### FT-B2.4 `handles "Other" aggregation entry`

```typescript
    test('renders "Other" aggregation entry from breakdown_limit', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 30, units: 'USD' },
            { name: 'Other', source: 'other', value: 10, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report} />);
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      expect(screen.getByText(/Memory charge/)).toBeInTheDocument();
      expect(screen.getByText(/Other/)).toBeInTheDocument();
    });
```

- **Expected:** "Other" node rendered alongside named rates
- **PRD:** PRD open question #1 (top-N with "Other")

#### FT-B2.5 `handles long rate names (50 chars)`

```typescript
    test('handles long rate name (50 chars)', () => {
      const longName = 'A'.repeat(50);
      const report = createReportWithBreakdown({
        usage: {
          value: 42.50,
          units: 'USD',
          breakdown: [
            { name: longName, source: 'rate', value: 42.50, units: 'USD' },
          ],
        },
      });
      render(<CostBreakdownChart report={report} />);
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
```

- **Expected:** Long name renders without overflow or crash
- **PRD:** D6 edge case

#### FT-B2.6 `on-prem OCP with no cloud cost in overhead`

```typescript
    test('overhead breakdown with only rate entries (no cloud)', () => {
      const report = createReportWithBreakdown({
        usage: {
          value: 42.50,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 42.50, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 20.00,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 20.00, units: 'USD' },
            // No "cloud" entry — pure on-prem
          ],
        },
      });
      render(<CostBreakdownChart report={report} />);
      expect(screen.getByText(/Node monthly/)).toBeInTheDocument();
      expect(screen.queryByText(/Cloud cost/)).not.toBeInTheDocument();
    });
  }); // end describe('edge cases')
```

- **Expected:** No "Cloud cost" node when on-prem only
- **PRD:** D6 edge case

### B3. Sankey chart — dynamic height and styles

#### FT-B3.1 `chart height increases with more breakdown nodes`

```typescript
  describe('dynamic height', () => {
    test('chart height scales with number of breakdown entries', () => {
      const manyEntries = Array.from({ length: 10 }, (_, i) => ({
        name: `Rate ${i}`,
        source: 'rate' as const,
        value: 10,
        units: 'USD',
      }));
      const report = createReportWithBreakdown({
        usage: { value: 100, units: 'USD', breakdown: manyEntries },
      });
      render(<CostBreakdownChart report={report} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      // Implementation-specific: check style or computed height
      expect(wrapper).toBeInTheDocument();
    });
  }); // end describe('dynamic height')
```

- **Expected:** Chart accommodates many nodes without visual compression
- **PRD:** FRONTEND_PLAN B3 (dynamic height)

### B4. Report query — breakdown_limit parameter

**Test file:** `routes/details/ocpBreakdown/ocpBreakdown.test.tsx` (new or extend existing)

#### FT-B4.1 `report query includes breakdown_limit`

```typescript
describe('OCP breakdown report query', () => {
  test('report query includes breakdown_limit', () => {
    // Mock store with OCP breakdown state
    const store = createMockStoreCreator(rootReducer)({ /* ... */ });
    // The mapStateToProps builds reportQuery that should include breakdown_limit
    // Verify the query string passed to fetchReport includes breakdown_limit=10
    expect(mockFetchReport).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('breakdown_limit=10'),
      expect.anything()
    );
  });
}); // end describe('OCP breakdown report query')
```

- **Expected:** API call includes `breakdown_limit=10` in query string
- **PRD:** FRONTEND_PLAN B4

### B5. Localization

**Test file:** `locales/messages.test.ts` (new or extend existing locale tests)

#### FT-B5.1 `localization keys for breakdown exist`

```typescript
describe('breakdown localization', () => {
  test('breakdown localization messages are defined', () => {
    expect(messages.breakdownOther).toBeDefined();
    expect(messages.breakdownCloudCost).toBeDefined();
    expect(messages.rateName).toBeDefined();
    expect(messages.rateNameRequired).toBeDefined();
    expect(messages.rateNameTooLong).toBeDefined();
    expect(messages.rateNameDuplicate).toBeDefined();
  });
}); // end describe('breakdown localization')
```

- **Expected:** All new message keys exist
- **PRD:** FRONTEND_PLAN A7, B5

---

## Part C: Cross-View Verification Tests

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx` (same file as Part B — uses the same ECharts mock setup)

### C1. Cloud breakdown views — absent breakdown arrays

#### FT-C1.1 `AWS breakdown view renders without crash`

```typescript
  describe('cloud views backward compatibility', () => {
    test('chart renders AWS report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_AWS_REPORT} />);
      const wrapper = screen.getByTestId('cost-breakdown-chart-wrapper');
      expect(wrapper).toBeInTheDocument();
      // Should render existing chart without rate-name layer
      expect(wrapper).toMatchSnapshot();
    });
```

- **Preconditions:** `MOCK_AWS_REPORT` — pure AWS report with no `breakdown` arrays
- **Expected:** Chart renders existing Sankey without breakdown layer
- **PRD:** FRONTEND_PLAN C (cloud views handle absent breakdown)

#### FT-C1.2 `Azure breakdown view renders without crash`

```typescript
    test('chart renders Azure report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_AZURE_REPORT} />);
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toBeInTheDocument();
    });
```

- **Preconditions:** Pure Azure report
- **Expected:** No crash, existing chart

#### FT-C1.3 `GCP breakdown view renders without crash`

```typescript
    test('chart renders GCP report (no breakdown arrays) without crash', () => {
      render(<CostBreakdownChart report={MOCK_GCP_REPORT} />);
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toBeInTheDocument();
    });
  }); // end describe('cloud views backward compatibility')
```

- **Preconditions:** Pure GCP report
- **Expected:** No crash, existing chart

### C2. OCP breakdown view — with and without breakdown

#### FT-C2.1 `OCP report with breakdown renders 5-layer Sankey`

```typescript
  describe('OCP views', () => {
    test('OCP report with breakdown renders 5-layer Sankey', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />);
      // Rate name nodes (layer 0) — in serialized series JSON
      expect(screen.getByText(/CPU charge/)).toBeInTheDocument();
      // Snapshot captures the full 5-layer structure
      expect(screen.getByTestId('cost-breakdown-chart-wrapper')).toMatchSnapshot();
    });
```

- **Preconditions:** `MOCK_REPORT_WITH_BREAKDOWN`
- **Expected:** All 5 layers visible
- **PRD:** AC-FE-2, AC-FE-3

#### FT-C2.2 `OCP report without cost model renders 4-layer Sankey`

```typescript
    test('OCP report without cost model (no breakdown) renders 4-layer Sankey', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_NO_BREAKDOWN} />);
      // No rate name nodes
      expect(screen.queryByText(/CPU charge/)).not.toBeInTheDocument();
    });
  }); // end describe('OCP views')
```

- **Preconditions:** `MOCK_REPORT_NO_BREAKDOWN`
- **Expected:** No rate-name layer; existing chart unchanged
- **PRD:** D5 backward compat

### C3. Non-distributed mode — credit view unaffected

#### FT-C3.1 `non-distributed mode does not show breakdown layer`

```typescript
  describe('non-distributed mode', () => {
    test('non-distributed mode (simple Sankey) does not show breakdown', () => {
      render(<CostBreakdownChart report={MOCK_REPORT_NON_DISTRIBUTED} />);
      // Credit node should be visible (non-distributed only)
      // No breakdown nodes should appear
      expect(screen.queryByText(/CPU charge/)).not.toBeInTheDocument();
    });
  }); // end describe('non-distributed mode')
}); // end describe('CostBreakdownChart')
```

- **Preconditions:** Report without distributed overhead categories
- **Expected:** Credit/simple view unchanged; no breakdown layer
- **PRD:** D5 backward compat, Design Note about credit node

---

## Part D: Cost Details Tree Table Tests

**Test file:** `routes/details/ocpBreakdown/costDetails.test.tsx` (new)

The `CostDetails` component uses PatternFly's `Table`, `TreeRowWrapper`, and `injectIntl`. Tests pass a `mockIntl` prop directly to the component (same pattern as `costBreakdownChart.test.tsx`), avoiding the need for `IntlProvider` context.

### D1. Loading state

#### FT-D1.1 `renders skeleton when fetch is in progress`

```typescript
test('renders skeleton when fetch is in progress', () => {
  const { container } = render(
    <CostDetails reportFetchStatus={FetchStatus.inProgress} intl={mockIntl} />
  );
  const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
  expect(skeletons.length).toBeGreaterThan(0);
});
```

- **Expected:** Skeleton elements rendered during loading
- **PRD:** AC-FE-5 (loading skeleton while data is fetched)

#### FT-D1.2 `renders skeleton when report is undefined`

```typescript
test('renders skeleton when report is undefined', () => {
  const { container } = render(
    <CostDetails reportFetchStatus={FetchStatus.complete} intl={mockIntl} />
  );
  const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
  expect(skeletons.length).toBeGreaterThan(0);
});
```

- **Expected:** Skeleton shown even after fetch completes if report data is missing
- **PRD:** AC-FE-5

### D2. Tree structure

#### FT-D2.1 `renders table when data is loaded`

```typescript
test('renders table when data is loaded', () => {
  render(
    <CostDetails
      report={MOCK_REPORT_DISTRIBUTED as any}
      reportFetchStatus={FetchStatus.complete}
      intl={mockIntl}
    />
  );
  expect(screen.getByRole('treegrid')).toBeInTheDocument();
});
```

- **Expected:** PatternFly tree table (`role="treegrid"`) rendered
- **PRD:** AC-FE-5

#### FT-D2.2 `renders Total cost root node`

- **Expected:** "Total cost" text visible as root
- **PRD:** AC-FE-5 (hierarchy mirrors Sankey structure)

#### FT-D2.3 `renders workload and overhead grouping nodes`

- **Expected:** "Project (All other costs)" and "Overhead cost" visible
- **PRD:** AC-FE-5

#### FT-D2.4 `renders cost category nodes`

- **Expected:** All 8 cost category nodes visible: Raw cost, Markup, Usage cost, GPU unallocated, Network unattributed, Platform distributed, Storage unattributed, Worker unallocated
- **PRD:** AC-FE-5

#### FT-D2.5 `renders per-rate breakdown entries`

- **Expected:** Rate names from `breakdown` arrays visible (e.g., "CPU charge", "Memory charge", "Node monthly", "Cloud cost", "Worker rate")
- **PRD:** AC-FE-5

#### FT-D2.6 `renders Credit node when credit is present`

- **Expected:** "Credit" row visible when `cost.credit` exists in report
- **PRD:** AC-FE-5

#### FT-D2.7 `does not render Credit node when credit is absent`

- **Expected:** No "Credit" row when `cost.credit` is not in report
- **PRD:** AC-FE-5

### D3. Zero-value rows

#### FT-D3.1 `renders rows with zero values`

- **Expected:** GPU unallocated, Storage unattributed, Network unattributed visible even with `value: 0`
- **PRD:** AC-FE-5 (all rows shown including zero-value)

### D4. Percentage column

#### FT-D4.1 `displays 100.00% for total cost row`

- **Expected:** "100.00%" text present for the root Total cost row
- **PRD:** AC-FE-5 (% of cost column)

#### FT-D4.2 `displays 0.00% when total cost is zero`

- **Expected:** "0.00%" for all rows when total cost is zero (no division-by-zero crash)
- **PRD:** AC-FE-5

### D5. Expand and collapse

#### FT-D5.1 `all parent nodes are expanded by default`

- **Expected:** All leaf breakdown entries (e.g., "CPU charge") visible without any user interaction
- **PRD:** AC-FE-5 (fully expanded by default)

#### FT-D5.2 `collapsing a parent hides its children`

```typescript
test('collapsing a parent hides its children', () => {
  render(
    <CostDetails
      report={MOCK_REPORT_DISTRIBUTED as any}
      reportFetchStatus={FetchStatus.complete}
      intl={mockIntl}
    />
  );
  const usageToggle = screen.getByLabelText('Usage cost');
  fireEvent.click(usageToggle);
  const cpuRow = screen.getByText('CPU charge').closest('tr');
  expect(cpuRow).toHaveAttribute('hidden');
});
```

- **Expected:** Children rows get `hidden` attribute after collapsing parent
- **PRD:** AC-FE-5 (expand/collapse functionality)

#### FT-D5.3 `re-expanding a collapsed parent shows its children`

- **Expected:** Children rows lose `hidden` attribute after re-expanding
- **PRD:** AC-FE-5

### D6. No breakdown entries

#### FT-D6.1 `renders without breakdown leaf nodes when no breakdown data`

- **Expected:** Cost category nodes render without children; no crash
- **PRD:** AC-FE-5 (graceful fallback)

### D7. Duplicate rate names across categories

#### FT-D7.1 `same rate name under different categories renders as separate rows`

```typescript
test('same rate name under different categories renders as separate rows', () => {
  // "Node monthly" appears in usage, platform_distributed, and worker_unallocated_distributed
  render(
    <CostDetails report={duplicateReport as any} reportFetchStatus={FetchStatus.complete} intl={mockIntl} />
  );
  const nodeMonthlyElements = screen.getAllByText('Node monthly');
  expect(nodeMonthlyElements).toHaveLength(3);
});
```

- **Expected:** Three separate "Node monthly" rows (one per parent category), each with unique React keys
- **PRD:** AC-FE-5 (tree hierarchy mirrors Sankey: per-rate breakdown under each category)

---

## Mock Data Fixtures

All mock data is defined as TypeScript constants in test files. The shapes match the backend API contract from the PRD.

### `MOCK_RATE_CPU_CHARGE`

```typescript
const MOCK_RATE_CPU_CHARGE: Rate = {
  name: 'CPU charge',
  metric: {
    name: 'cpu_core_usage_per_hour',
    label_metric: 'CPU',
    label_measurement: 'Usage',
    label_measurement_unit: 'core-hours',
  },
  tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
  cost_type: 'Infrastructure',
};
```

### `MOCK_RATE_MEMORY_CHARGE`

```typescript
const MOCK_RATE_MEMORY_CHARGE: Rate = {
  name: 'Memory charge',
  metric: {
    name: 'memory_gb_usage_per_hour',
    label_metric: 'Memory',
    label_measurement: 'Usage',
    label_measurement_unit: 'GB-hours',
  },
  tiered_rates: [{ value: 0.03, unit: 'USD', usage: { unit: 'GB-hours' } }],
  cost_type: 'Supplementary',
};
```

### `MOCK_REPORT_NO_BREAKDOWN`

A report matching the existing (pre-feature) API response. No `breakdown` field on any cost value.

```typescript
const MOCK_REPORT_NO_BREAKDOWN = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 50, units: 'USD' },
        markup: { value: 5, units: 'USD' },
        usage: { value: 100, units: 'USD' },
        platform_distributed: { value: 30, units: 'USD' },
        worker_unallocated_distributed: { value: 15, units: 'USD' },
      },
    },
  },
  data: [],
};
```

### `MOCK_REPORT_WITH_BREAKDOWN`

A report with `breakdown` arrays on `usage` and overhead types. Represents an on-prem OCP cluster with a cost model.

```typescript
const MOCK_REPORT_WITH_BREAKDOWN = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 0, units: 'USD' },     // on-prem: no raw cloud cost
        markup: { value: 0, units: 'USD' },   // on-prem: no markup
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 40, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 60,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 60, units: 'USD' },
          ],
        },
        worker_unallocated_distributed: {
          value: 40,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 40, units: 'USD' },
          ],
        },
        storage_unattributed_distributed: { value: 0, units: 'USD' },
        network_unattributed_distributed: { value: 0, units: 'USD' },
        gpu_unallocated_distributed: { value: 0, units: 'USD' },
      },
    },
  },
  data: [],
};
```

### `MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN`

An OCP-on-cloud report with both rate-sourced and cloud-sourced entries in overhead.

```typescript
const MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 500, units: 'USD' },
        raw: { value: 150, units: 'USD' },    // cloud raw cost — no breakdown in Phase 1
        markup: { value: 15, units: 'USD' },   // markup — no breakdown in Phase 1
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
            { name: 'Memory charge', source: 'rate', value: 40, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 130,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 80, units: 'USD' },
            { name: 'Cloud cost', source: 'cloud', value: 50, units: 'USD' },
          ],
        },
        worker_unallocated_distributed: {
          value: 70,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 40, units: 'USD' },
            { name: 'Cloud cost', source: 'cloud', value: 30, units: 'USD' },
          ],
        },
        storage_unattributed_distributed: { value: 20, units: 'USD' },
        network_unattributed_distributed: { value: 10, units: 'USD' },
        gpu_unallocated_distributed: { value: 5, units: 'USD' },
      },
    },
  },
  data: [],
};
```

### `MOCK_REPORT_MULTI_LINK`

A report where a single rate name appears in both `usage.breakdown` and `platform_distributed.breakdown` — verifying multi-edge rendering.

```typescript
const MOCK_REPORT_MULTI_LINK = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 300, units: 'USD' },
        raw: { value: 0, units: 'USD' },
        markup: { value: 0, units: 'USD' },
        usage: {
          value: 100,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 50, units: 'USD' },
            { name: 'CPU charge', source: 'rate', value: 50, units: 'USD' },
          ],
        },
        platform_distributed: {
          value: 120,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 120, units: 'USD' },
          ],
        },
        worker_unallocated_distributed: {
          value: 80,
          units: 'USD',
          breakdown: [
            { name: 'Node monthly', source: 'rate', value: 80, units: 'USD' },
          ],
        },
        storage_unattributed_distributed: { value: 0, units: 'USD' },
        network_unattributed_distributed: { value: 0, units: 'USD' },
        gpu_unallocated_distributed: { value: 0, units: 'USD' },
      },
    },
  },
  data: [],
};
```

### `MOCK_AWS_REPORT`, `MOCK_AZURE_REPORT`, `MOCK_GCP_REPORT`

Pure cloud reports with no `breakdown` arrays on any cost value. Same shape as `MOCK_REPORT_NO_BREAKDOWN` but with cloud-specific cost values.

```typescript
const MOCK_AWS_REPORT = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 500, units: 'USD' },
        raw: { value: 400, units: 'USD' },
        markup: { value: 40, units: 'USD' },
        usage: { value: 60, units: 'USD' },
      },
    },
  },
  data: [],
};

// MOCK_AZURE_REPORT and MOCK_GCP_REPORT follow the same shape
```

### `MOCK_REPORT_NON_DISTRIBUTED`

A report for non-distributed mode (credit node visible, no overhead distribution categories).

```typescript
const MOCK_REPORT_NON_DISTRIBUTED = {
  meta: {
    count: 1,
    total: {
      cost: {
        total: { value: 200, units: 'USD' },
        raw: { value: 50, units: 'USD' },
        markup: { value: 5, units: 'USD' },
        usage: { value: 100, units: 'USD' },
        credit: { value: -10, units: 'USD' },
        // No platform_distributed, worker_unallocated_distributed, etc.
      },
    },
  },
  data: [],
};
```

### `createReportWithBreakdown` helper

A helper function to create report fixtures with custom breakdown data, reducing boilerplate:

```typescript
function createReportWithBreakdown(
  costOverrides: Partial<Record<string, ReportValue>>
): Report {
  return {
    meta: {
      count: 1,
      total: {
        cost: {
          total: { value: 200, units: 'USD' },
          raw: { value: 0, units: 'USD' },
          markup: { value: 0, units: 'USD' },
          usage: { value: 100, units: 'USD' },
          platform_distributed: { value: 0, units: 'USD' },
          worker_unallocated_distributed: { value: 0, units: 'USD' },
          storage_unattributed_distributed: { value: 0, units: 'USD' },
          network_unattributed_distributed: { value: 0, units: 'USD' },
          gpu_unallocated_distributed: { value: 0, units: 'USD' },
          ...costOverrides,
        },
      },
    },
    data: [],
  };
}
```

---

## Traceability Matrix

Maps PRD acceptance criteria to specific tests.

| PRD Acceptance Criterion | ID | Tests |
|---|---|---|
| Rate form includes `name` field (required, max 50 chars) | AC-FE-1 | FT-A1.1–A1.6, FT-A2.1–A2.3, FT-A3.1–A3.2, FT-A4.1–A4.3, FT-A5.1–A5.2, FT-A6.1–A6.2 |
| Sankey renders rate names as new left-side nodes | AC-FE-2 | FT-B1.2, FT-B1.4, FT-C2.1 |
| Overhead types receive flow from rate name nodes | AC-FE-3 | FT-B1.3, FT-B1.4, FT-C2.1 |
| `raw`, `markup`, `credit` unchanged (no breakdown sub-layer) | AC-FE-4 | FT-B1.5, FT-C3.1 |
| Cost details tree table with full hierarchy, icons, columns, expand/collapse, loading skeleton, zero-value rows | AC-FE-5 | FT-D1.1–D1.2, FT-D2.1–D2.7, FT-D3.1, FT-D4.1–D4.2, FT-D5.1–D5.3, FT-D6.1, FT-D7.1 |
| Backward compat (no breakdown arrays → existing chart) | BC | FT-B1.1, FT-C1.1–C1.3, FT-C2.2, FT-C3.1, FT-D6.1 |
| Edge cases (empty, zero, single, top-N, long names, on-prem) | EDGE | FT-B2.1–B2.6, FT-D3.1, FT-D4.2, FT-D7.1 |
| API types match backend contract | TYPE | FT-A6.1–A6.2 + `npx tsc --noEmit` |
| Breakdown_limit query parameter | LIMIT | FT-B4.1, FT-B2.4 |
| Localization messages | L10N | FT-B5.1 |

---

## Negative / Error Path Tests

These are not covered by the main happy-path tests above and should be added as appropriate during implementation.

| Scenario | Expected behavior | Priority |
|---|---|---|
| API returns malformed `breakdown` (missing `name` field) | Chart falls back to no-breakdown rendering; console warning | Medium |
| API returns `breakdown` with negative `value` | Chart renders or skips entry gracefully; no crash | Low |
| API returns 500 error on report fetch | Existing error handling applies; chart shows error state | Existing |
| Rate name API `POST` fails (network error) | Form shows error toast; data not lost | Existing |
| Rate form `name` field with XSS attempt (`<script>`) | Value is escaped by React; no execution | Existing (React default) |
| Very large number of breakdown entries (>100) | Chart renders with reasonable performance; `breakdown_limit` should prevent this server-side | Low |

---

## Summary

| Area | Test Count | New Files | Modified Files |
|---|---|---|---|
| Part A: Rate Name Field | 16 | `canSubmit.test.ts` | `useRateForm.test.tsx`, `addPriceList.test.tsx`, `rateTable.test.tsx`, `api/rates.test.ts` |
| Part B: Sankey Diagram | 10 | `costBreakdownChart.test.tsx` | — |
| Part C: Cross-View | 6 | — | `costBreakdownChart.test.tsx` (same as B) |
| Part D: Cost Details Tree Table | 17 | `costDetails.test.tsx` | — |
| **Total** | **49** | **3 new** | **4 modified** |

### Type validation

TypeScript interface correctness (`BreakdownEntry`, `ReportValue`, `Rate`, `RateRequest`) is verified by:

```bash
cd apps/koku-ui-hccm
npx tsc --noEmit
```

### Test execution

All tests run via:

```bash
cd apps/koku-ui-hccm
npx jest --no-cache
```

Individual test files:

```bash
npx jest routes/settings/costModels/components/rateForm/useRateForm.test.tsx
npx jest routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx
```

Snapshot updates after intentional visual changes:

```bash
npx jest --updateSnapshot
```
