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

---

## Test Conventions

Based on the existing koku-ui-hccm codebase:

| Convention | Value |
|---|---|
| **Framework** | Jest 30 + @testing-library/react 16 |
| **File naming** | `*.test.tsx` or `*.test.ts`, colocated with source |
| **Mocking** | `jest.mock('module')` for API/component mocks; inline fixtures for data |
| **Chart tests** | Snapshot tests via `toMatchSnapshot()` |
| **Reducer tests** | Direct `reducer(state, action)` calls |
| **Component tests** | `render()` + `screen` queries + `userEvent` interactions |
| **i18n** | `jest.mock('react-intl')` or `regExp(msg.defaultMessage)` assertions |
| **Redux store** | `createMockStoreCreator()` from `store/mockStore.ts` |
| **E2E** | Cypress (in `koku-ui-onprem`; not currently used in hccm) |

---

## Table of Contents

1. [Part A: Rate Name Field Tests](#part-a-rate-name-field-tests)
2. [Part B: Sankey Diagram Tests](#part-b-sankey-diagram-tests)
3. [Part C: Cross-View Verification Tests](#part-c-cross-view-verification-tests)
4. [Mock Data Fixtures](#mock-data-fixtures)
5. [Traceability Matrix](#traceability-matrix)
6. [Summary](#summary)

---

## Part A: Rate Name Field Tests

### A1. Reducer — `UPDATE_NAME` action

**Test file:** `routes/settings/costModels/components/rateForm/useRateForm.test.tsx` (existing — add tests)

These follow the existing pattern of testing `rateFormReducer(state, action)` directly.

#### FT-A1.1 `UPDATE_NAME sets name and clears error`

```typescript
test('UPDATE_NAME with valid name sets name and clears error', () => {
  const state = rateFormReducer(
    { ...initialRateFormData, step: 'set_rate' },
    { type: 'UPDATE_NAME', value: 'CPU charge' }
  );
  expect(state.name).toBe('CPU charge');
  expect(state.errors.name).toBeNull();
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
  expect(state.name).toBe('');
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
  expect(state.name).toBe('X'.repeat(51));
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
  expect(state.name).toBe('X'.repeat(50));
  expect(state.errors.name).toBeNull();
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
  expect(state.name).toBe(initialRateFormData.name);
});
```

- **Preconditions:** Default initial state (step is not `set_rate`)
- **Expected:** Name not updated (follows existing reducer guard pattern)

### A2. Form data utilities

**Test file:** `routes/settings/costModels/components/rateForm/useRateForm.test.tsx` (or new `utils.test.tsx`)

#### FT-A2.1 `transformFormDataToRequest includes name`

```typescript
test('transformFormDataToRequest includes name in output', () => {
  const formData = {
    ...initialRateFormData,
    name: 'CPU charge',
    step: 'set_rate',
    rateKind: 'regular',
    metric: 'cpu_core_usage_per_hour',
    measurement: 'Usage',
    calculation: 'Infrastructure',
    tieredRates: [{ value: '0.05' }],
  };
  const request = transformFormDataToRequest(formData);
  expect(request.name).toBe('CPU charge');
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
  expect(formData.name).toBe('Memory charge');
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
  expect(formData.name).toBe('');
});
```

- **Expected:** Graceful fallback for legacy rates without name

### A3. Form submit validation — canSubmit

**Test file:** `routes/settings/costModels/components/rateForm/canSubmit.test.tsx` (new, or extend existing)

#### FT-A3.1 `canSubmit returns false when name has error`

```typescript
test('canSubmit returns false when name has an error', () => {
  const formData = {
    ...initialRateFormData,
    step: 'set_rate',
    rateKind: 'regular',
    errors: { ...initialRateFormData.errors, name: 'Rate name is required' },
    metric: 'cpu_core_usage_per_hour',
    measurement: 'Usage',
    calculation: 'Infrastructure',
  };
  expect(canSubmit(formData)).toBe(false);
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
    errors: { ...initialRateFormData.errors, name: null, tieredRates: null },
    metric: 'cpu_core_usage_per_hour',
    measurement: 'Usage',
    calculation: 'Infrastructure',
    tieredRates: [{ value: '0.05' }],
  };
  expect(canSubmit(formData)).toBe(true);
});
```

- **Expected:** Valid form can submit
- **PRD:** AC-FE-1

### A4. Form UI — name input rendering

**Test file:** `routes/settings/costModels/components/addPriceList.test.tsx` (existing — add tests)

These follow the existing pattern: render `AddPriceList` with mocked metric/rate data, interact with `userEvent`.

#### FT-A4.1 `name input is rendered and required`

```typescript
test('name input field is rendered', async () => {
  render(<AddPriceList {...defaultProps} />);
  // Navigate to set_rate step
  await userEvent.click(screen.getByText(/Usage/i)); // select measurement
  // ...navigate to rate step...
  const nameInput = screen.getByLabelText(/rate name/i);
  expect(nameInput).toBeInTheDocument();
  expect(nameInput).toBeRequired();
});
```

- **Expected:** Name input visible and marked required
- **PRD:** AC-FE-1

#### FT-A4.2 `name input shows validation error on blur when empty`

```typescript
test('name input shows error when blurred empty', async () => {
  render(<AddPriceList {...defaultProps} />);
  // Navigate to rate step, focus then blur name field
  const nameInput = screen.getByLabelText(/rate name/i);
  await userEvent.click(nameInput);
  await userEvent.tab();
  expect(screen.getByText(/rate name is required/i)).toBeInTheDocument();
});
```

- **Expected:** Error message displayed
- **PRD:** AC-FE-1

#### FT-A4.3 `submit button disabled when name is empty`

```typescript
test('submit button is disabled when name is not filled', async () => {
  render(<AddPriceList {...defaultProps} />);
  // Fill all fields EXCEPT name, navigate to final step
  // ...
  expect(screen.getByRole('button', { name: /add rate/i })).toBeDisabled();
});
```

- **Expected:** Cannot submit without name
- **PRD:** AC-FE-1

### A5. Rate table — name column

**Test file:** `routes/settings/costModels/components/rateTable.test.tsx` (new)

#### FT-A5.1 `rate table displays name column`

```typescript
test('rate table includes Name column header', () => {
  const tiers = [MOCK_RATE_CPU_CHARGE, MOCK_RATE_MEMORY_CHARGE];
  render(<RateTable tiers={tiers} />);
  expect(screen.getByText(/name/i)).toBeInTheDocument();
});
```

- **Expected:** "Name" column header present
- **PRD:** AC-FE-1

#### FT-A5.2 `rate table displays rate names in rows`

```typescript
test('rate table displays rate name values', () => {
  const tiers = [MOCK_RATE_CPU_CHARGE, MOCK_RATE_MEMORY_CHARGE];
  render(<RateTable tiers={tiers} />);
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
  expect(screen.getByText('Memory charge')).toBeInTheDocument();
});
```

- **Expected:** Rate names from fixture data visible in table rows
- **PRD:** AC-FE-1

### A6. API types — compile-time validation

**Test file:** `api/rates.test.ts` (new)

#### FT-A6.1 `RateRequest type requires name`

```typescript
test('RateRequest with name compiles correctly', () => {
  const request: RateRequest = {
    name: 'CPU charge',
    metric: { name: 'cpu_core_usage_per_hour' },
    tiered_rates: [{ value: 0.05, unit: 'USD', usage: { unit: 'core-hours' } }],
    cost_type: 'Infrastructure',
  };
  expect(request.name).toBe('CPU charge');
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
  expect(rate.name).toBe('Memory charge');
});
```

- **Expected:** TypeScript compiles with `name` field
- **PRD:** AC-FE-1

---

## Part B: Sankey Diagram Tests

### B1. API types — BreakdownEntry and extended ReportValue

**Test file:** `api/reports/report.test.ts` (new)

#### FT-B1.1 `BreakdownEntry interface with rate source`

```typescript
test('BreakdownEntry with source rate is valid', () => {
  const entry: BreakdownEntry = {
    name: 'CPU charge',
    source: 'rate',
    value: 42.50,
    units: 'USD',
  };
  expect(entry.source).toBe('rate');
});
```

- **Expected:** Interface compiles and runtime check passes
- **PRD:** AC-BE-CB (breakdown entry shape)

#### FT-B1.2 `BreakdownEntry interface with cloud source`

```typescript
test('BreakdownEntry with source cloud is valid', () => {
  const entry: BreakdownEntry = {
    name: 'Cloud cost',
    source: 'cloud',
    value: 150.00,
    units: 'USD',
  };
  expect(entry.source).toBe('cloud');
});
```

- **Expected:** Cloud source compiles
- **PRD:** AC-BE-CB (overhead cloud placeholder)

#### FT-B1.3 `BreakdownEntry interface with other source`

```typescript
test('BreakdownEntry with source other is valid', () => {
  const entry: BreakdownEntry = {
    name: 'Other',
    source: 'other',
    value: 10.00,
    units: 'USD',
  };
  expect(entry.source).toBe('other');
});
```

- **Expected:** "Other" (top-N remainder) source compiles
- **PRD:** AC-BE-CB (top-N aggregation)

#### FT-B1.4 `ReportValue with optional breakdown`

```typescript
test('ReportValue can have optional breakdown array', () => {
  const value: ReportValue = {
    value: 100,
    units: 'USD',
    breakdown: [
      { name: 'CPU charge', source: 'rate', value: 60, units: 'USD' },
      { name: 'Memory charge', source: 'rate', value: 40, units: 'USD' },
    ],
  };
  expect(value.breakdown).toHaveLength(2);
});
```

- **Expected:** `breakdown` is optional and typed as `BreakdownEntry[]`
- **PRD:** AC-FE-2

#### FT-B1.5 `ReportValue without breakdown is valid`

```typescript
test('ReportValue without breakdown is valid (backward compat)', () => {
  const value: ReportValue = {
    value: 100,
    units: 'USD',
  };
  expect(value.breakdown).toBeUndefined();
});
```

- **Expected:** Existing code compiles without breakdown
- **PRD:** Backward compatibility

### B2. Sankey chart — data transformation (initDatum)

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx` (new)

These tests exercise the chart's data transformation logic. The component reads `report.meta.total.cost` and produces Sankey `nodes[]` and `links[]` for ECharts.

#### FT-B2.1 `renders without breakdown data (backward compatibility)`

```typescript
test('renders chart with no breakdown arrays', () => {
  const { container } = render(
    <CostBreakdownChart report={MOCK_REPORT_NO_BREAKDOWN} />
  );
  expect(container.querySelector('[data-testid="cost-breakdown-chart"]')).toBeInTheDocument();
  // Snapshot baseline — existing 4-layer Sankey
  expect(container).toMatchSnapshot();
});
```

- **Preconditions:** `MOCK_REPORT_NO_BREAKDOWN` — report with usage/raw/markup values but no `breakdown` arrays
- **Expected:** Chart renders the existing 4-layer Sankey unchanged
- **PRD:** AC-FE-4 (backward compat)

#### FT-B2.2 `renders usage breakdown as additional leftmost nodes`

```typescript
test('renders usage breakdown entries as Sankey nodes on the left', () => {
  const { container } = render(
    <CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />
  );
  // Verify rate name nodes exist
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
  expect(screen.getByText('Memory charge')).toBeInTheDocument();
  // Snapshot — 5-layer Sankey
  expect(container).toMatchSnapshot();
});
```

- **Preconditions:** `MOCK_REPORT_WITH_BREAKDOWN` — report with `usage.breakdown` containing 2 rate entries
- **Expected:** Rate name nodes rendered; snapshot shows 5-layer structure
- **PRD:** AC-FE-2 (Sankey renders rate names)

#### FT-B2.3 `renders overhead breakdown entries`

```typescript
test('renders overhead breakdown entries flowing to overhead nodes', () => {
  render(<CostBreakdownChart report={MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN} />);
  // Rate name nodes connected to overhead categories
  expect(screen.getByText('Node monthly')).toBeInTheDocument();
  // "Cloud cost" placeholder for non-attributed cloud cost
  expect(screen.getByText('Cloud cost')).toBeInTheDocument();
});
```

- **Preconditions:** `MOCK_REPORT_WITH_OVERHEAD_BREAKDOWN` — report with `platform_distributed.breakdown` and `worker_unallocated_distributed.breakdown`
- **Expected:** Overhead rate name nodes and "Cloud cost" node rendered
- **PRD:** AC-FE-3 (overhead types receive flow from rate names)

#### FT-B2.4 `rate name node has multiple outgoing links`

```typescript
test('rate name node has outgoing links to multiple categories', () => {
  render(<CostBreakdownChart report={MOCK_REPORT_MULTI_LINK} />);
  // "Node monthly" appears in both usage and platform_distributed breakdown
  // Should be rendered as ONE node with TWO outgoing links
  const nodeMonthlyElements = screen.getAllByText('Node monthly');
  // ECharts Sankey renders each node name once
  expect(nodeMonthlyElements).toHaveLength(1);
});
```

- **Preconditions:** `MOCK_REPORT_MULTI_LINK` — "Node monthly" appears in both `usage.breakdown` and `platform_distributed.breakdown`
- **Expected:** Single node, multiple edges
- **PRD:** AC-FE-2, AC-FE-3

#### FT-B2.5 `raw, markup, and credit have no breakdown sub-layer`

```typescript
test('raw, markup, and credit remain as leaf nodes without breakdown', () => {
  render(<CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />);
  // raw and markup should be present as nodes
  expect(screen.getByText(/raw cost/i)).toBeInTheDocument();
  expect(screen.getByText(/markup/i)).toBeInTheDocument();
  // But they should NOT have any child nodes on their left
  // Verify by checking the Sankey data structure (no links into raw/markup from rate nodes)
  // This is verified via snapshot comparison
  expect(screen.queryByText(/raw.*breakdown/i)).not.toBeInTheDocument();
});
```

- **Preconditions:** Report has `raw.value` and `markup.value` but no `raw.breakdown` or `markup.breakdown`
- **Expected:** Raw and markup are leaf nodes
- **PRD:** AC-FE-4

### B3. Sankey chart — edge cases

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx` (same as B2)

#### FT-B3.1 `handles empty breakdown arrays`

```typescript
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
  const { container } = render(<CostBreakdownChart report={report} />);
  // Should render usage node without rate-name sub-layer
  expect(container).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});
```

- **Expected:** Chart renders like the no-breakdown case; no crash
- **PRD:** D6 edge case

#### FT-B3.2 `handles zero-value breakdown entries`

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
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
  // Zero-value entry may or may not be rendered (implementation decision)
  // But it must not crash
});
```

- **Expected:** No crash; zero-value handling is graceful
- **PRD:** D6 edge case

#### FT-B3.3 `handles single-entry breakdown`

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
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
});
```

- **Expected:** Single rate-name node renders correctly
- **PRD:** D6 edge case

#### FT-B3.4 `handles "Other" aggregation entry`

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
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
  expect(screen.getByText('Memory charge')).toBeInTheDocument();
  expect(screen.getByText('Other')).toBeInTheDocument();
});
```

- **Expected:** "Other" node rendered alongside named rates
- **PRD:** PRD open question #1 (top-N with "Other")

#### FT-B3.5 `handles long rate names (50 chars)`

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

#### FT-B3.6 `on-prem OCP with no cloud cost in overhead`

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
  expect(screen.getByText('Node monthly')).toBeInTheDocument();
  expect(screen.queryByText('Cloud cost')).not.toBeInTheDocument();
});
```

- **Expected:** No "Cloud cost" node when on-prem only
- **PRD:** D6 edge case

### B4. Sankey chart — dynamic height and styles

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx`

#### FT-B4.1 `chart height increases with more breakdown nodes`

```typescript
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
  const { container } = render(<CostBreakdownChart report={report} />);
  // Chart container should have increased height
  const chartEl = container.querySelector('[data-testid="cost-breakdown-chart"]');
  // Implementation-specific: check style or computed height
  expect(chartEl).toBeInTheDocument();
});
```

- **Expected:** Chart accommodates many nodes without visual compression
- **PRD:** FRONTEND_PLAN B3 (dynamic height)

### B5. Report query — breakdown_limit parameter

**Test file:** `routes/details/ocpBreakdown/ocpBreakdown.test.tsx` (new or extend existing)

#### FT-B5.1 `report query includes breakdown_limit`

```typescript
test('OCP breakdown report query includes breakdown_limit', () => {
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
```

- **Expected:** API call includes `breakdown_limit=10` in query string
- **PRD:** FRONTEND_PLAN B4

### B6. Localization

**Test file:** `locales/messages.test.ts` (new or extend existing locale tests)

#### FT-B6.1 `localization keys for breakdown exist`

```typescript
test('breakdown localization messages are defined', () => {
  expect(messages.breakdownOther).toBeDefined();
  expect(messages.breakdownCloudCost).toBeDefined();
  expect(messages.rateName).toBeDefined();
  expect(messages.rateNameRequired).toBeDefined();
  expect(messages.rateNameTooLong).toBeDefined();
  expect(messages.rateNameDuplicate).toBeDefined();
});
```

- **Expected:** All new message keys exist
- **PRD:** FRONTEND_PLAN A7, B5

---

## Part C: Cross-View Verification Tests

### C1. Cloud breakdown views — absent breakdown arrays

**Test file:** `routes/details/components/costBreakdownChart/costBreakdownChart.test.tsx`

#### FT-C1.1 `AWS breakdown view renders without crash`

```typescript
test('chart renders AWS report (no breakdown arrays) without crash', () => {
  const { container } = render(
    <CostBreakdownChart report={MOCK_AWS_REPORT} />
  );
  expect(container).toBeInTheDocument();
  // Should render existing chart without rate-name layer
  expect(container).toMatchSnapshot();
});
```

- **Preconditions:** `MOCK_AWS_REPORT` — pure AWS report with no `breakdown` arrays
- **Expected:** Chart renders existing Sankey without breakdown layer
- **PRD:** FRONTEND_PLAN C (cloud views handle absent breakdown)

#### FT-C1.2 `Azure breakdown view renders without crash`

```typescript
test('chart renders Azure report (no breakdown arrays) without crash', () => {
  const { container } = render(
    <CostBreakdownChart report={MOCK_AZURE_REPORT} />
  );
  expect(container).toBeInTheDocument();
});
```

- **Preconditions:** Pure Azure report
- **Expected:** No crash, existing chart

#### FT-C1.3 `GCP breakdown view renders without crash`

```typescript
test('chart renders GCP report (no breakdown arrays) without crash', () => {
  const { container } = render(
    <CostBreakdownChart report={MOCK_GCP_REPORT} />
  );
  expect(container).toBeInTheDocument();
});
```

- **Preconditions:** Pure GCP report
- **Expected:** No crash, existing chart

### C2. OCP breakdown view — with and without breakdown

#### FT-C2.1 `OCP report with breakdown renders 5-layer Sankey`

```typescript
test('OCP report with breakdown renders 5-layer Sankey', () => {
  render(<CostBreakdownChart report={MOCK_REPORT_WITH_BREAKDOWN} />);
  // Rate name nodes (layer 0)
  expect(screen.getByText('CPU charge')).toBeInTheDocument();
  // Cost category nodes (layer 1)
  expect(screen.getByText(/usage cost/i)).toBeInTheDocument();
  // Workload/overhead nodes (layer 2)
  expect(screen.getByText(/overhead/i)).toBeInTheDocument();
  // Total cost node (layer 3)
  expect(screen.getByText(/total cost/i)).toBeInTheDocument();
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
  expect(screen.queryByText('CPU charge')).not.toBeInTheDocument();
  // Existing layers still present
  expect(screen.getByText(/usage cost/i)).toBeInTheDocument();
  expect(screen.getByText(/total cost/i)).toBeInTheDocument();
});
```

- **Preconditions:** `MOCK_REPORT_NO_BREAKDOWN`
- **Expected:** No rate-name layer; existing chart unchanged
- **PRD:** D5 backward compat

### C3. Non-distributed mode — credit view unaffected

#### FT-C3.1 `non-distributed mode does not show breakdown layer`

```typescript
test('non-distributed mode (simple Sankey) does not show breakdown', () => {
  render(<CostBreakdownChart report={MOCK_REPORT_NON_DISTRIBUTED} />);
  // Credit node should be visible (non-distributed only)
  // No breakdown nodes should appear
  expect(screen.queryByText('CPU charge')).not.toBeInTheDocument();
});
```

- **Preconditions:** Report without distributed overhead categories
- **Expected:** Credit/simple view unchanged; no breakdown layer
- **PRD:** D5 backward compat, Design Note about credit node

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
| Sankey renders rate names as new left-side nodes | AC-FE-2 | FT-B2.2, FT-B2.4, FT-C2.1 |
| Overhead types receive flow from rate name nodes | AC-FE-3 | FT-B2.3, FT-B2.4, FT-C2.1 |
| `raw`, `markup`, `credit` unchanged (no breakdown sub-layer) | AC-FE-4 | FT-B2.5, FT-C3.1 |
| Backward compat (no breakdown arrays → existing chart) | BC | FT-B1.5, FT-B2.1, FT-C1.1–C1.3, FT-C2.2, FT-C3.1 |
| Edge cases (empty, zero, single, top-N, long names, on-prem) | EDGE | FT-B3.1–B3.6 |
| API types match backend contract | TYPE | FT-B1.1–B1.5, FT-A6.1–A6.2 |
| Breakdown_limit query parameter | LIMIT | FT-B5.1, FT-B3.4 |
| Localization messages | L10N | FT-B6.1 |

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
| Part A: Rate Name Field | 16 | `canSubmit.test.tsx`, `rateTable.test.tsx`, `api/rates.test.ts` | `useRateForm.test.tsx`, `addPriceList.test.tsx` |
| Part B: Sankey Diagram | 15 | `costBreakdownChart.test.tsx`, `api/reports/report.test.ts`, `ocpBreakdown.test.tsx` | — |
| Part C: Cross-View | 6 | — | `costBreakdownChart.test.tsx` (same as B) |
| **Total** | **37** | **5 new** | **2 modified** |

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
