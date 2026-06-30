import { defineMessages } from 'react-intl';

export default defineMessages({
  actualUsage: {
    defaultMessage: 'Actual usage ({dateRange})',
    description: 'Actual usage (Jan 1-31)',
    id: 'actualUsage',
  },
  breakdownBackToOptimizations: {
    defaultMessage: 'Back to optimizations',
    description: 'Back to optimizations',
    id: 'breakdownBackToOptimizations',
  },
  breakdownBackToOptimizationsProject: {
    defaultMessage: 'Back to optimizations for project {value}',
    description: 'Back to optimizations for project {value}',
    id: 'breakdownBackToOptimizationsProject',
  },
  breakdownTotalCostDate: {
    defaultMessage: '{value} total cost ({dateRange})',
    description: '{value} total cost (January 1-31)',
    id: 'breakdownTotalCostDate',
  },
  chartCostForecastConeTooltip: {
    defaultMessage: '{value0} - {value1}',
    description: 'Cost forecast confidence min/max tooltip',
    id: 'chartCostForecastConeTooltip',
  },
  chartNoData: {
    defaultMessage: 'no data',
    description: 'no data',
    id: 'chartNoData',
  },
  chartOthers: {
    defaultMessage: '{count, plural, one {{count} Other} other {{count} Others}}',
    description: 'Others category for top costliest',
    id: 'chartOthers',
  },
  chartUsageTooltip: {
    defaultMessage: 'P50: {p50} {units}{br}P95: {p95} {units}{br}P99: {p99} {units}{br}Max: {max} {units}',
    description: 'P50: {p50} {units}, P95: {p95} {units}, P99: {p99} {units}, Max: {max} {units}',
    id: 'chartUsageTooltip',
  },
  chartUsageMaxLegend: {
    defaultMessage: 'Daily max',
    description: 'Daily max',
    id: 'chartUsageMaxLegend',
  },
  chartUsageMedianLegend: {
    defaultMessage: 'Median (P50)',
    description: 'Median (P50)',
    id: 'chartUsageMedianLegend',
  },
  chartUsageP50P95Legend: {
    defaultMessage: 'P50-P95 (normal range)',
    description: 'P50-P95 (normal range)',
    id: 'chartUsageP50P95Legend',
  },
  chartUsageP95P99Legend: {
    defaultMessage: 'P95-P99 (peak range)',
    description: 'P95-P99 (peak range)',
    id: 'chartUsageP95P99Legend',
  },
  chartBhP50Legend: {
    defaultMessage: 'Business hours median (P50)',
    description: 'Business hours median (P50)',
    id: 'chartBhP50Legend',
  },
  chartBhP50P95Legend: {
    defaultMessage: 'Business hours P50-P95',
    description: 'Business hours P50-P95 range',
    id: 'chartBhP50P95Legend',
  },
  chooseKeyPlaceholder: {
    defaultMessage: 'Choose key',
    description: 'Choose key',
    id: 'chooseKeyPlaceholder',
  },
  chooseValuePlaceholder: {
    defaultMessage: 'Choose value',
    description: 'Choose value',
    id: 'chooseValuePlaceholder',
  },
  copyToClipboard: {
    defaultMessage: 'Copy to clipboard',
    description: 'Copy to clipboard',
    id: 'copyToClipboard',
  },
  copyToClipboardSuccessfull: {
    defaultMessage: 'Successfully copied to clipboard!',
    description: 'Successfully copied to clipboard!',
    id: 'copyToClipboardSuccessfull',
  },
  cost: {
    defaultMessage: 'Cost',
    description: 'Cost',
    id: 'cost',
  },
  costManagement: {
    defaultMessage: 'Cost Management ROS',
    description: 'Cost Management ROS',
    id: 'costManagement',
  },
  cpu: {
    defaultMessage: 'CPU',
    description: 'CPU',
    id: 'cpu',
  },
  cpuUtilization: {
    defaultMessage: 'CPU utilization',
    description: 'CPU utilization',
    id: 'cpuUtilization',
  },
  currencyAbbreviations: {
    defaultMessage:
      '{symbol, select, ' +
      'billion {{value} B} ' +
      'million {{value} M} ' +
      'quadrillion {{value} q} ' +
      'thousand {{value} K} ' +
      'trillion {{value} t} ' +
      'other {}}',
    description: 'str.match(/([\\D]*)([\\d.,]+)([\\D]*)/)',
    id: 'currencyAbbreviations',
  },
  change: {
    defaultMessage: 'Change',
    description: 'Column header for difference between current and recommended values',
    id: 'change',
  },
  current: {
    defaultMessage: 'Current',
    description: 'Column header for current values',
    id: 'current',
  },
  currentConfiguration: {
    defaultMessage: 'Current configuration',
    description: 'Current configuration',
    id: 'currentConfiguration',
  },
  dataTableAriaLabel: {
    defaultMessage: 'Details table',
    description: 'Details table',
    id: 'dataTableAriaLabel',
  },
  detailsEmptyState: {
    defaultMessage: 'Processing data to generate a list of all services that sums to a total cost...',
    description: 'Processing data to generate a list of all services that sums to a total cost...',
    id: 'detailsEmptyState',
  },
  docsOptimizations: {
    defaultMessage:
      'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/getting_started_with_resource_optimization_for_openshift/optimizations-ros',
    description: 'Resource optimization for OpenShift optimization reports',
    id: 'docsOptimizations',
  },
  emptyFilterStateSubtitle: {
    defaultMessage: 'Sorry, no data with the given filter was found.',
    description: 'Sorry, no data with the given filter was found.',
    id: 'emptyFilterStateSubtitle',
  },
  emptyFilterStateTitle: {
    defaultMessage: 'No match found',
    description: 'No match found',
    id: 'emptyFilterStateTitle',
  },
  errorStateNotAuthorizedDesc: {
    defaultMessage: 'Contact the cost management administrator to provide access to this application',
    description: 'Contact the cost management administrator to provide access to this application',
    id: 'errorStateNotAuthorizedDesc',
  },
  errorStateNotAuthorizedTitle: {
    defaultMessage: "You don't have access to the Cost management application",
    description: "You don't have access to the Cost management application",
    id: 'errorStateNotAuthorizedTitle',
  },
  errorStateUnexpectedDesc: {
    defaultMessage: 'We encountered an unexpected error. Contact your administrator.',
    description: 'We encountered an unexpected error. Contact your administrator.',
    id: 'errorStateUnexpectedDesc',
  },
  errorStateUnexpectedTitle: {
    defaultMessage: 'Oops!',
    description: 'Oops!',
    id: 'errorStateUnexpectedTitle',
  },
  excludeLabel: {
    defaultMessage: 'Excludes: {value}',
    description: 'Excludes filter label',
    id: 'excludeLabel',
  },
  excludeValues: {
    defaultMessage: '{value, select, ' + 'excludes {excludes} ' + 'includes {includes} ' + 'other {}}',
    description: 'Exclude filter values',
    id: 'excludeValues',
  },
  filterByInputAriaLabel: {
    defaultMessage:
      '{value, select, ' +
      'account {Input for account name} ' +
      'aws_category {Input for cost category name} ' +
      'cluster {Input for cluster name} ' +
      'gcp_project {Input for GCP project name} ' +
      'name {Input for name} ' +
      'node {Input for node name} ' +
      'org_unit_id {Input for organizational unit name} ' +
      'payer_tenant_id {Input for account name} ' +
      'product_service {Input for service_name} ' +
      'project {Input for project name} ' +
      'region {Input for region name} ' +
      'resource_location {Input for region name} ' +
      'service {Input for service name} ' +
      'service_name {Input for service_name} ' +
      'subscription_guid {Input for account name} ' +
      'status {Input for status value} ' +
      'tag {Input for tag name} ' +
      'other {}}',
    description: 'Input for {value} name',
    id: 'filterByInputAriaLabel',
  },
  filterByPlaceholder: {
    defaultMessage:
      '{value, select, ' +
      'account {Filter by account} ' +
      'aws_category {Filter by cost category} ' +
      'cluster {Filter by cluster} ' +
      'container {Filter by container} ' +
      'description {Filter by description} ' +
      'gcp_project {Filter by GCP project} ' +
      'group {Filter by group} ' +
      'name {Filter by name} ' +
      'node {Filter by node} ' +
      'org_unit_id {Filter by organizational unit} ' +
      'payer_tenant_id {Filter by account} ' +
      'persistent_volume_claim {Filter by persistent volume claim} ' +
      'product_service {Filter by service} ' +
      'project {Filter by project} ' +
      'region {Filter by region} ' +
      'resource_location {Filter by region} ' +
      'service {Filter by service} ' +
      'service_name {Filter by service} ' +
      'source_type {Filter by source type} ' +
      'status {Filter by status} ' +
      'storage_class {Filter by StorageClass} ' +
      'subscription_guid {Filter by account} ' +
      'workload {Filter by workload name} ' +
      'workload_type {Filter by workload type} ' +
      'tag {Filter by tag} ' +
      'tag_key_value {Filter by tag (key=value)} ' +
      'other {}}',
    description: 'Filter by "value"',
    id: 'filterByPlaceholder',
  },
  filterByValues: {
    defaultMessage:
      '{value, select, ' +
      'account {Account} ' +
      'aws_category {Cost category} ' +
      'classification {Classification} ' +
      'cluster {Cluster} ' +
      'container {Container} ' +
      'gcp_project {GCP project} ' +
      'gpu_model {GPU model} ' +
      'group {Group} ' +
      'idle_state {Idle state} ' +
      'name {Name} ' +
      'node {Node} ' +
      'org_unit_id {Organizational unit} ' +
      'payer_tenant_id {Account} ' +
      'persistent_volume_claim {Persistent volume claim} ' +
      'product_service {Service} ' +
      'project {Project} ' +
      'region {Region} ' +
      'resource_location {Region} ' +
      'service {Service} ' +
      'service_name {Service} ' +
      'source_type {Source type} ' +
      'status {Status} ' +
      'storage_class {StorageClass} ' +
      'subscription_guid {Account} ' +
      'tag {Tag} ' +
      'vm_name {VM name} ' +
      'workload {Workload name} ' +
      'workload_type {Workload type} ' +
      'namespace {Namespace} ' +
      'other {}}',
    description: 'Filter by values',
    id: 'filterByValues',
  },
  filterByTagKeyAriaLabel: {
    defaultMessage: 'Tag keys',
    description: 'Tag keys',
    id: 'filterByTagKeyAriaLabel',
  },
  filterByTagValueAriaLabel: {
    defaultMessage: 'Tag values',
    description: 'Tag values',
    id: 'filterByTagValueAriaLabel',
  },
  filterByValuePlaceholder: {
    defaultMessage: 'Filter by value',
    description: 'Filter by value',
    id: 'filterByValuePlaceholder',
  },
  filterByValuesAriaLabel: {
    defaultMessage: 'Values',
    description: 'Values',
    id: 'filterByValuesAriaLabel',
  },
  fleetSummaryAbandonedContainers: {
    defaultMessage: 'Abandoned containers',
    description: 'Fleet summary card title for abandoned containers',
    id: 'fleetSummaryAbandonedContainers',
  },
  fleetSummaryClusters: {
    defaultMessage: 'Clusters',
    description: 'Fleet summary card title for cluster count',
    id: 'fleetSummaryClusters',
  },
  fleetSummaryIdleContainers: {
    defaultMessage: 'Idle containers',
    description: 'Fleet summary card title for idle containers',
    id: 'fleetSummaryIdleContainers',
  },
  fleetSummaryNoData: {
    defaultMessage: 'No fleet data available',
    description: 'Fleet summary empty state message',
    id: 'fleetSummaryNoData',
  },
  fleetSummaryPercentOfTotal: {
    defaultMessage: '{percent}% of total',
    description: 'Percentage of total containers',
    id: 'fleetSummaryPercentOfTotal',
  },
  fleetSummaryPotentialSavings: {
    defaultMessage: 'Potential monthly savings',
    description: 'Fleet summary card title for potential savings',
    id: 'fleetSummaryPotentialSavings',
  },
  fleetSummaryTitle: {
    defaultMessage: 'Fleet overview',
    description: 'Fleet summary section title',
    id: 'fleetSummaryTitle',
  },
  fleetSummaryTotalContainers: {
    defaultMessage: 'Total containers',
    description: 'Fleet summary card title for total containers',
    id: 'fleetSummaryTotalContainers',
  },
  fleetHeatmapTitle: {
    defaultMessage: 'Node fleet utilization',
    description: 'Fleet heatmap section title',
    id: 'fleetHeatmapTitle',
  },
  fleetHeatmapBandIdle: {
    defaultMessage: 'Idle',
    description: 'Fleet heatmap band label for idle nodes',
    id: 'fleetHeatmapBandIdle',
  },
  fleetHeatmapBandLow: {
    defaultMessage: 'Low',
    description: 'Fleet heatmap band label for low utilization',
    id: 'fleetHeatmapBandLow',
  },
  fleetHeatmapBandModerate: {
    defaultMessage: 'Moderate',
    description: 'Fleet heatmap band label for moderate utilization',
    id: 'fleetHeatmapBandModerate',
  },
  fleetHeatmapBandHealthy: {
    defaultMessage: 'Healthy',
    description: 'Fleet heatmap band label for healthy utilization',
    id: 'fleetHeatmapBandHealthy',
  },
  fleetHeatmapBandHot: {
    defaultMessage: 'Hot',
    description: 'Fleet heatmap band label for hot utilization',
    id: 'fleetHeatmapBandHot',
  },
  fleetHeatmapMetricCpu: {
    defaultMessage: 'CPU utilization',
    description: 'Fleet heatmap metric toggle label for CPU',
    id: 'fleetHeatmapMetricCpu',
  },
  fleetHeatmapMetricMemory: {
    defaultMessage: 'Memory utilization',
    description: 'Fleet heatmap metric toggle label for memory',
    id: 'fleetHeatmapMetricMemory',
  },
  fleetHeatmapMetricToggleLabel: {
    defaultMessage: 'Select utilization metric',
    description: 'Aria label for the metric toggle group',
    id: 'fleetHeatmapMetricToggleLabel',
  },
  fleetHeatmapTooltip: {
    defaultMessage: '{node} — {utilization} ({band})\nMachineSet: {machineSet}\nInstance: {instanceType}',
    description: 'Tooltip content for a heatmap cell',
    id: 'fleetHeatmapTooltip',
  },
  fleetHeatmapUngrouped: {
    defaultMessage: 'Ungrouped',
    description: 'Label for nodes without a MachineSet',
    id: 'fleetHeatmapUngrouped',
  },
  fleetHeatmapNoData: {
    defaultMessage: 'No node data available',
    description: 'Fleet heatmap empty state title',
    id: 'fleetHeatmapNoData',
  },
  fleetHeatmapNoDataDesc: {
    defaultMessage: 'Node utilization data has not been collected yet. Data will appear after the operator reports node metrics.',
    description: 'Fleet heatmap empty state description',
    id: 'fleetHeatmapNoDataDesc',
  },
  fleetHeatmapShowAll: {
    defaultMessage: 'Show all {count} nodes',
    description: 'Link to show all nodes in the heatmap',
    id: 'fleetHeatmapShowAll',
  },
  fleetHeatmapShowTop: {
    defaultMessage: 'Show top {count} nodes',
    description: 'Link to show only the top N nodes in the heatmap',
    id: 'fleetHeatmapShowTop',
  },
  fleetHeatmapLegendLabel: {
    defaultMessage: 'Utilization band legend',
    description: 'Aria label for the heatmap legend',
    id: 'fleetHeatmapLegendLabel',
  },
  fleetHeatmapAccessibilityCaption: {
    defaultMessage: 'Node fleet utilization data',
    description: 'Screen reader caption for the accessible heatmap data table',
    id: 'fleetHeatmapAccessibilityCaption',
  },
  forDate: {
    defaultMessage: '{value} for {dateRange}',
    description: '{value} for {Jan 1-31}',
    id: 'forDate',
  },
  gpuMig: {
    defaultMessage: 'MIG',
    description: 'GPU MIG sub-tab label',
    id: 'gpuMig',
  },
  gpuMigColumnClassification: {
    defaultMessage: 'Classification',
    description: 'GPU MIG table classification column',
    id: 'gpuMigColumnClassification',
  },
  gpuMigColumnCluster: {
    defaultMessage: 'Cluster',
    description: 'GPU MIG table cluster column',
    id: 'gpuMigColumnCluster',
  },
  gpuMigColumnConfidence: {
    defaultMessage: 'Confidence',
    description: 'GPU MIG table confidence column',
    id: 'gpuMigColumnConfidence',
  },
  gpuMigColumnContainer: {
    defaultMessage: 'Container',
    description: 'GPU MIG table container column',
    id: 'gpuMigColumnContainer',
  },
  gpuMigColumnCurrentProfile: {
    defaultMessage: 'Current profile',
    description: 'GPU MIG table current profile column',
    id: 'gpuMigColumnCurrentProfile',
  },
  gpuMigColumnGpuModel: {
    defaultMessage: 'GPU model',
    description: 'GPU MIG table GPU model column',
    id: 'gpuMigColumnGpuModel',
  },
  gpuMigColumnNamespace: {
    defaultMessage: 'Namespace',
    description: 'GPU MIG table namespace column',
    id: 'gpuMigColumnNamespace',
  },
  gpuMigColumnRecommendedProfile: {
    defaultMessage: 'Recommended profile',
    description: 'GPU MIG table recommended profile column',
    id: 'gpuMigColumnRecommendedProfile',
  },
  gpuMigColumnTerm: {
    defaultMessage: 'Term',
    description: 'GPU MIG table term column',
    id: 'gpuMigColumnTerm',
  },
  gpuMigColumnWorkload: {
    defaultMessage: 'Workload',
    description: 'GPU MIG table workload column',
    id: 'gpuMigColumnWorkload',
  },
  gpuTimeslicing: {
    defaultMessage: 'Time-Slicing',
    description: 'GPU Time-Slicing sub-tab label',
    id: 'gpuTimeslicing',
  },
  gpuTimeslicingColumnClassification: {
    defaultMessage: 'Classification',
    description: 'GPU timeslicing table classification column',
    id: 'gpuTimeslicingColumnClassification',
  },
  gpuTimeslicingColumnCluster: {
    defaultMessage: 'Cluster',
    description: 'GPU timeslicing table cluster column',
    id: 'gpuTimeslicingColumnCluster',
  },
  gpuTimeslicingColumnCurrentReplicas: {
    defaultMessage: 'Current replicas',
    description: 'GPU timeslicing table current replicas column',
    id: 'gpuTimeslicingColumnCurrentReplicas',
  },
  gpuTimeslicingColumnGpuCount: {
    defaultMessage: 'GPU count',
    description: 'GPU timeslicing table GPU count column',
    id: 'gpuTimeslicingColumnGpuCount',
  },
  gpuTimeslicingColumnGpuModel: {
    defaultMessage: 'GPU model',
    description: 'GPU timeslicing table GPU model column',
    id: 'gpuTimeslicingColumnGpuModel',
  },
  gpuTimeslicingColumnNode: {
    defaultMessage: 'Node',
    description: 'GPU timeslicing table node column',
    id: 'gpuTimeslicingColumnNode',
  },
  gpuTimeslicingColumnRecommendedReplicas: {
    defaultMessage: 'Recommended replicas',
    description: 'GPU timeslicing table recommended replicas column',
    id: 'gpuTimeslicingColumnRecommendedReplicas',
  },
  gpuTimeslicingColumnSavings: {
    defaultMessage: 'Estimated monthly savings',
    description: 'GPU timeslicing table estimated monthly savings column',
    id: 'gpuTimeslicingColumnSavings',
  },
  gpuTimeslicingCandidateContainers: {
    defaultMessage: 'Candidate containers',
    description: 'GPU timeslicing breakdown candidate containers section title',
    id: 'gpuTimeslicingCandidateContainers',
  },
  gpuTimeslicingNoCandidates: {
    defaultMessage: 'No candidate containers found for this node',
    description: 'GPU timeslicing breakdown empty candidates message',
    id: 'gpuTimeslicingNoCandidates',
  },
  gpuTimeslicingSmActiveAvg: {
    defaultMessage: 'SM active avg',
    description: 'GPU timeslicing breakdown SM active average column',
    id: 'gpuTimeslicingSmActiveAvg',
  },
  gpuMigProfileRecommendations: {
    defaultMessage: 'MIG profile recommendations by term',
    description: 'GPU MIG breakdown term table section title',
    id: 'gpuMigProfileRecommendations',
  },
  kokuAppUrl: {
    defaultMessage: 'https://github.com/project-koku/koku-ui/tree/main/apps/koku-ui-ros',
    description: 'https://github.com/project-koku/koku-ui/tree/main/apps/koku-ui-ros',
    id: 'kokuAppUrl',
  },
  learnMore: {
    defaultMessage: 'Learn more',
    description: 'Learn more',
    id: 'learnMore',
  },
  limit: {
    defaultMessage: 'Limit',
    description: 'Limit',
    id: 'limit',
  },
  loadingStateDesc: {
    defaultMessage: 'Searching for your sources. Do not refresh the browser',
    description: 'Searching for your sources. Do not refresh the browser',
    id: 'loadingStateDesc',
  },
  loadingStateTitle: {
    defaultMessage: 'Looking for sources...',
    description: 'Looking for sources',
    id: 'loadingStateTitle',
  },
  memory: {
    defaultMessage: 'Memory',
    description: 'Memory',
    id: 'memory',
  },
  memoryUtilization: {
    defaultMessage: 'Memory utilization',
    description: 'Memory utilization',
    id: 'memoryUtilization',
  },
  metric: {
    defaultMessage: 'Metric',
    description: 'Column header for metric name',
    id: 'metric',
  },
  names: {
    defaultMessage: '{count, plural, one {Name} other {Names}}',
    description: 'Name plural or singular',
    id: 'names',
  },
  noDataForDate: {
    defaultMessage: 'No data available for {dateRange}',
    description: 'No data available for Jan 1-31',
    id: 'noDataForDate',
  },
  noOptimizationsDesc: {
    defaultMessage:
      'Resource Optimization is now available in preview for select customers. If your organization wants to participate, tell us through the Feedback button, which is purple and located on the right. Otherwise, there is not enough data available to generate an optimization.',
    description:
      'Resource Optimization is now available in preview for select customers. If your organization wants to participate, tell us through the Feedback button, which is purple and located on the right. Otherwise, there is not enough data available to generate an optimization.',
    id: 'noOptimizationsDesc',
  },
  noOptimizationsTitle: {
    defaultMessage: 'No optimizations available',
    description: 'No optimizations available',
    id: 'noOptimizationsTitle',
  },
  namespaceContainerInventoryTitle: {
    defaultMessage: 'Container recommendations in this namespace',
    description: 'Title for the container inventory table on the namespace breakdown page',
    id: 'namespaceContainerInventoryTitle',
  },
  namespaceContainerInventoryHelperText: {
    defaultMessage:
      'Container recommendations are computed independently from aggregated container-level data, not derived from the namespace-level recommendation above. Values may differ because each uses a different data source and methodology.',
    description: 'Helper text explaining namespace vs container recommendation independence',
    id: 'namespaceContainerInventoryHelperText',
  },
  namespaceContainerInventoryEmpty: {
    defaultMessage: 'No container recommendations are available for this namespace.',
    description: 'Empty state when no container recommendations exist in the namespace',
    id: 'namespaceContainerInventoryEmpty',
  },
  noResultsFound: {
    defaultMessage: 'No results found',
    description: 'No results found',
    id: 'noResultsFound',
  },
  notConfiguredChanges: {
    defaultMessage: 'Changes will be reflected within 24 hours. {learnMore}',
    description: 'Changes will be reflected within 24 hours. {learnMore}',
    id: 'notConfiguredChanges',
  },
  notConfiguredCli: {
    defaultMessage: 'In the CLI, run {clipboard}',
    description: 'In the CLI, run {clipboard}',
    id: 'notConfiguredCli',
  },
  notConfiguredDesc: {
    defaultMessage:
      'To receive resource optimization recommendations for your namespaces, you must first enable each namespace.',
    description:
      'To receive resource optimization recommendations for your namespaces, you must first enable each namespace.',
    id: 'notConfiguredDesc',
  },
  notConfiguredNamespace: {
    defaultMessage: 'To enable a namespace, label it with {clipboard}',
    description: 'To enable a namespace, label it with {clipboard}',
    id: 'notConfiguredNamespace',
  },
  notConfiguredTitle: {
    defaultMessage: 'Optimizations may not be configured',
    description: 'Optimizations may not be configured',
    id: 'notConfiguredTitle',
  },
  notificationsAlertTitle: {
    defaultMessage: 'Duration based notifications',
    description: 'Duration based notifications',
    id: 'notificationsAlertTitle',
  },
  openShift: {
    defaultMessage: 'OpenShift',
    description: 'OpenShift',
    id: 'openShift',
  },
  optimizableContainers: {
    defaultMessage: 'Optimizable containers on this project',
    description: 'Optimizable containers on this project',
    id: 'optimizableContainers',
  },
  optimizations: {
    defaultMessage: 'Optimizations',
    description: 'Optimizations',
    id: 'optimizations',
  },
  optimizationsCost: {
    defaultMessage: 'Cost optimizations',
    description: 'Cost optimizations',
    id: 'optimizationsCost',
  },
  optimizationsDetails: {
    defaultMessage: '{count, plural, =0 {No optimizations} =1 {{count} optimization} other {{count} optimizations}}',
    description: 'Optimization details',
    id: 'optimizationsDetails',
  },
  optimizationsTabSummaryCount: {
    defaultMessage: '{count, plural, =0 {No recommendations} =1 {1 recommendation} other {{count} recommendations}}',
    description: 'Summary banner when savings are unavailable',
    id: 'optimizationsTabSummaryCount',
  },
  optimizationsTabSummarySavings: {
    defaultMessage:
      'Total potential savings: {amount}/month across {count, plural, =1 {1 recommendation} other {{count} recommendations}}',
    description: 'Summary banner with savings total for an optimizations tab',
    id: 'optimizationsTabSummarySavings',
  },
  optimizationsTabSummaryWaste: {
    defaultMessage:
      'Total monthly waste: {amount}/month across {count, plural, =1 {1 recommendation} other {{count} recommendations}}',
    description: 'Summary banner with waste total for snapshot recommendations',
    id: 'optimizationsTabSummaryWaste',
  },
  storageSubPvc: {
    defaultMessage: 'PVC',
    description: 'Storage tab PVC sub-view toggle label',
    id: 'storageSubPvc',
  },
  storageSubSnapshot: {
    defaultMessage: 'Snapshots',
    description: 'Storage tab snapshot sub-view toggle label',
    id: 'storageSubSnapshot',
  },
  quotaSubNamespace: {
    defaultMessage: 'Namespace ResourceQuota',
    description: 'Quota tab namespace ResourceQuota sub-view toggle label',
    id: 'quotaSubNamespace',
  },
  quotaSubCluster: {
    defaultMessage: 'ClusterResourceQuota',
    description: 'Quota tab ClusterResourceQuota sub-view toggle label',
    id: 'quotaSubCluster',
  },
  quotaName: {
    defaultMessage: 'ResourceQuota',
    description: 'Column header for Kubernetes ResourceQuota object name',
    id: 'quotaName',
  },
  clusterQuotaName: {
    defaultMessage: 'ClusterResourceQuota',
    description: 'Column header for ClusterResourceQuota name',
    id: 'clusterQuotaName',
  },
  quotaMaxUtilization: {
    defaultMessage: 'Max utilization',
    description: 'Highest quota utilization percent across resource dimensions',
    id: 'quotaMaxUtilization',
  },
  quotaRiskLevel: {
    defaultMessage: 'Risk level',
    description: 'Quota recommendation risk level column and filter label',
    id: 'quotaRiskLevel',
  },
  quotaRiskLevelHigh: {
    defaultMessage: 'High',
    description: 'Quota risk level high',
    id: 'quotaRiskLevelHigh',
  },
  quotaRiskLevelMedium: {
    defaultMessage: 'Medium',
    description: 'Quota risk level medium',
    id: 'quotaRiskLevelMedium',
  },
  quotaRiskLevelLow: {
    defaultMessage: 'Low',
    description: 'Quota risk level low',
    id: 'quotaRiskLevelLow',
  },
  quotaRiskLevelNone: {
    defaultMessage: 'None',
    description: 'Quota risk level none',
    id: 'quotaRiskLevelNone',
  },
  quotaRecommendationTypeTighten: {
    defaultMessage: 'Tighten',
    description: 'Quota recommendation type tighten — reduce over-provisioned quota',
    id: 'quotaRecommendationTypeTighten',
  },
  quotaRecommendationTypeRaise: {
    defaultMessage: 'Raise',
    description: 'Quota recommendation type raise — usage approaching limits',
    id: 'quotaRecommendationTypeRaise',
  },
  quotaRecommendationTypeOptimal: {
    defaultMessage: 'Optimal',
    description: 'Quota recommendation type optimal',
    id: 'quotaRecommendationTypeOptimal',
  },
  quotaRecommendationTypeNone: {
    defaultMessage: 'None',
    description: 'Quota recommendation type none',
    id: 'quotaRecommendationTypeNone',
  },
  quotaNamespaces: {
    defaultMessage: 'Namespaces',
    description: 'ClusterResourceQuota matched namespace list column',
    id: 'quotaNamespaces',
  },
  quotaNamespaceCount: {
    defaultMessage: '{count} namespaces',
    description: 'Summary when CRQ matches more namespaces than shown inline',
    id: 'quotaNamespaceCount',
  },
  quotaDetailTitle: {
    defaultMessage: 'ResourceQuota recommendation',
    description: 'Detail modal title fallback for namespace quota',
    id: 'quotaDetailTitle',
  },
  clusterQuotaDetailTitle: {
    defaultMessage: 'ClusterResourceQuota recommendation',
    description: 'Detail modal title fallback for cluster quota',
    id: 'clusterQuotaDetailTitle',
  },
  quotaDetailLoadError: {
    defaultMessage: 'Unable to load quota recommendation details.',
    description: 'Error when quota detail API fetch fails',
    id: 'quotaDetailLoadError',
  },
  quotaResourceBreakdown: {
    defaultMessage: 'Quota resources',
    description: 'Section title for hard/used/recommended quota breakdown',
    id: 'quotaResourceBreakdown',
  },
  quotaResourceDimension: {
    defaultMessage: 'Resource',
    description: 'Quota resource dimension column header',
    id: 'quotaResourceDimension',
  },
  quotaHardLimit: {
    defaultMessage: 'Hard limit',
    description: 'Quota hard limit column',
    id: 'quotaHardLimit',
  },
  quotaUsed: {
    defaultMessage: 'Used',
    description: 'Quota used column',
    id: 'quotaUsed',
  },
  quotaRecommended: {
    defaultMessage: 'Recommended',
    description: 'Quota recommended hard limit column',
    id: 'quotaRecommended',
  },
  quotaResourceCpuRequest: {
    defaultMessage: 'CPU request',
    description: 'Quota CPU request resource row',
    id: 'quotaResourceCpuRequest',
  },
  quotaResourceMemoryRequest: {
    defaultMessage: 'Memory request',
    description: 'Quota memory request resource row',
    id: 'quotaResourceMemoryRequest',
  },
  quotaResourceStorageRequest: {
    defaultMessage: 'Storage request',
    description: 'Quota storage request resource row',
    id: 'quotaResourceStorageRequest',
  },
  quotaResourcePods: {
    defaultMessage: 'Pods',
    description: 'Quota pods resource row',
    id: 'quotaResourcePods',
  },
  quotaHistorySectionTitle: {
    defaultMessage: 'Historical trends',
    description: 'Section title for quota recommendation history charts on breakdown page',
    id: 'quotaHistorySectionTitle',
  },
  quotaHistoryUtilizationTitle: {
    defaultMessage: 'Utilization over time',
    description: 'Chart title for quota utilization percent history',
    id: 'quotaHistoryUtilizationTitle',
  },
  quotaHistoryUtilization: {
    defaultMessage: 'Utilization',
    description: 'Legend label for quota utilization percent series',
    id: 'quotaHistoryUtilization',
  },
  quotaHistoryEmpty: {
    defaultMessage: 'No historical data is available yet for this quota recommendation.',
    description: 'Empty state when quota breakdown has no history entries',
    id: 'quotaHistoryEmpty',
  },
  quotaExplanationTitle: {
    defaultMessage: 'Why this recommendation',
    description: 'Title for quota recommendation explanation on breakdown page',
    id: 'quotaExplanationTitle',
  },
  quotaExplanationTechnicalDetails: {
    defaultMessage: 'Technical details',
    description: 'Expandable section label for quota explanation metrics',
    id: 'quotaExplanationTechnicalDetails',
  },
  quotaExplanationHeadroom: {
    defaultMessage: 'Headroom',
    description: 'Quota explanation field for configured headroom percentage',
    id: 'quotaExplanationHeadroom',
  },
  quotaExplanationContainerCpuSum: {
    defaultMessage: 'Container CPU sum',
    description: 'Quota explanation field for summed container CPU recommendations',
    id: 'quotaExplanationContainerCpuSum',
  },
  quotaExplanationContainerMemSum: {
    defaultMessage: 'Container memory sum',
    description: 'Quota explanation field for summed container memory recommendations',
    id: 'quotaExplanationContainerMemSum',
  },
  quotaExplanationSignalCpu: {
    defaultMessage: 'Signal C CPU used',
    description: 'Quota explanation field for utilization signal CPU',
    id: 'quotaExplanationSignalCpu',
  },
  quotaExplanationMaxUtilization: {
    defaultMessage: 'Max utilization',
    description: 'Quota explanation field for peak utilization across resources',
    id: 'quotaExplanationMaxUtilization',
  },
  quotaExplanationNsQuotaCpuSum: {
    defaultMessage: 'Namespace quota CPU sum',
    description: 'Cluster quota explanation field for summed namespace quota CPU',
    id: 'quotaExplanationNsQuotaCpuSum',
  },
  quotaExplanationNsQuotaMemSum: {
    defaultMessage: 'Namespace quota memory sum',
    description: 'Cluster quota explanation field for summed namespace quota memory',
    id: 'quotaExplanationNsQuotaMemSum',
  },
  quotaExplanationBaseCpu: {
    defaultMessage: 'Base CPU',
    description: 'Cluster quota explanation field for base CPU before headroom',
    id: 'quotaExplanationBaseCpu',
  },
  storageGroupBy: {
    defaultMessage: 'Group by',
    description: 'Storage list group-by toolbar label',
    id: 'storageGroupBy',
  },
  storageGroupByNone: {
    defaultMessage: 'None',
    description: 'Storage list group-by option for ungrouped rows',
    id: 'storageGroupByNone',
  },
  storageGroupByCluster: {
    defaultMessage: 'Cluster',
    description: 'Storage list group-by cluster option',
    id: 'storageGroupByCluster',
  },
  storageGroupByProject: {
    defaultMessage: 'Project',
    description: 'Storage list group-by namespace/project option',
    id: 'storageGroupByProject',
  },
  storageRecommendationCount: {
    defaultMessage: 'Recommendations',
    description: 'Grouped storage table column for row count in a group',
    id: 'storageRecommendationCount',
  },
  storageTotalCapacity: {
    defaultMessage: 'Total capacity',
    description: 'Grouped PVC table column for summed capacity',
    id: 'storageTotalCapacity',
  },
  storageTotalRestoreSize: {
    defaultMessage: 'Total restore size',
    description: 'Grouped snapshot table column for summed restore size',
    id: 'storageTotalRestoreSize',
  },
  pvcClassificationOversized: {
    defaultMessage: 'Oversized',
    description: 'PVC recommendation classification badge',
    id: 'pvcClassificationOversized',
  },
  pvcClassificationNearFull: {
    defaultMessage: 'Near full',
    description: 'PVC recommendation classification badge',
    id: 'pvcClassificationNearFull',
  },
  pvcClassificationOrphaned: {
    defaultMessage: 'Orphaned',
    description: 'PVC recommendation classification badge',
    id: 'pvcClassificationOrphaned',
  },
  pvcClassificationHealthy: {
    defaultMessage: 'Healthy',
    description: 'PVC recommendation classification badge',
    id: 'pvcClassificationHealthy',
  },
  snapshotClassificationOrphaned: {
    defaultMessage: 'Orphaned',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationOrphaned',
  },
  snapshotClassificationStale: {
    defaultMessage: 'Stale',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationStale',
  },
  snapshotClassificationNeverRestored: {
    defaultMessage: 'Never restored',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationNeverRestored',
  },
  snapshotClassificationRedundant: {
    defaultMessage: 'Redundant',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationRedundant',
  },
  snapshotClassificationManaged: {
    defaultMessage: 'Managed',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationManaged',
  },
  snapshotClassificationActive: {
    defaultMessage: 'Active',
    description: 'Snapshot recommendation classification badge',
    id: 'snapshotClassificationActive',
  },
  monthlyHoldingCost: {
    defaultMessage: 'Monthly holding cost',
    description: 'Snapshot monthly holding cost column header',
    id: 'monthlyHoldingCost',
  },
  pvcCapacity: {
    defaultMessage: 'Capacity',
    description: 'PVC capacity column header',
    id: 'pvcCapacity',
  },
  pvcUsagePercent: {
    defaultMessage: 'Usage %',
    description: 'PVC usage percentage column header',
    id: 'pvcUsagePercent',
  },
  snapshotAgeDays: {
    defaultMessage: 'Age (days)',
    description: 'Snapshot age column header',
    id: 'snapshotAgeDays',
  },
  sourcePvc: {
    defaultMessage: 'Source PVC',
    description: 'Snapshot source PVC column header',
    id: 'sourcePvc',
  },
  pvcActiveTerm: {
    defaultMessage: 'Selected',
    description: 'Label for the PVC breakdown term matching list projection',
    id: 'pvcActiveTerm',
  },
  recommendationTermWindowDays: {
    defaultMessage: 'Last {windowDays, number} {windowDays, plural, one {day} other {days}}',
    description: 'Recommendation projection window label from settings API window_days',
    id: 'recommendationTermWindowDays',
  },
  pvcMountedBy: {
    defaultMessage: 'Mounted by',
    description: 'PVC breakdown mounted-by pod label',
    id: 'pvcMountedBy',
  },
  pvcVmName: {
    defaultMessage: 'VM name',
    description: 'PVC breakdown KubeVirt VM label',
    id: 'pvcVmName',
  },
  pvcDaysToFull: {
    defaultMessage: 'Days to full',
    description: 'PVC projected days until capacity is exhausted',
    id: 'pvcDaysToFull',
  },
  pvcGrowthPerDay: {
    defaultMessage: 'Growth',
    description: 'PVC estimated daily growth rate',
    id: 'pvcGrowthPerDay',
  },
  pvcTrendUnavailable: {
    defaultMessage:
      'Trend unavailable — need at least {requiredDays, number} days of usage data for this term ({dataDays, number} available)',
    description: 'PVC growth projection withheld until min digest count is met',
    id: 'pvcTrendUnavailable',
  },
  pvcTrendNoGrowth: {
    defaultMessage: 'No growth detected',
    description: 'PVC has enough history but WLS slope is flat or declining',
    id: 'pvcTrendNoGrowth',
  },
  pvcUsageMax: {
    defaultMessage: 'Peak usage',
    description: 'PVC historical usage chart peak series',
    id: 'pvcUsageMax',
  },
  pvcUsageAvg: {
    defaultMessage: 'Average usage',
    description: 'PVC historical usage chart average series',
    id: 'pvcUsageAvg',
  },
  pvcUsageHistoryTitle: {
    defaultMessage: 'Usage history',
    description: 'PVC breakdown historical usage chart title',
    id: 'pvcUsageHistoryTitle',
  },
  pvcUsageHistoryCaption: {
    defaultMessage: 'Latest capacity: {capacity}',
    description: 'PVC usage history chart caption',
    id: 'pvcUsageHistoryCaption',
  },
  pvcProjectionLine: {
    defaultMessage: 'Projected usage',
    description: 'PVC usage chart projection line legend label',
    id: 'pvcProjectionLine',
  },
  pvcProjectionExhaustionDate: {
    defaultMessage: 'Projected full: {date}',
    description: 'PVC usage chart annotation for projected capacity exhaustion date',
    id: 'pvcProjectionExhaustionDate',
  },
  pvcClassificationReason: {
    defaultMessage: 'Classification reason',
    description: 'PVC explanation classification reason label',
    id: 'pvcClassificationReason',
  },
  pvcExplanationTitle: {
    defaultMessage: 'Recommendation explanation',
    description: 'PVC breakdown expandable explanation section title',
    id: 'pvcExplanationTitle',
  },
  pvcResizeNoteTitle: {
    defaultMessage: 'Resize guidance',
    description: 'PVC operational resize note alert title',
    id: 'pvcResizeNoteTitle',
  },
  snapshotDetailTitle: {
    defaultMessage: 'Snapshot details',
    description: 'Snapshot detail modal title fallback',
    id: 'snapshotDetailTitle',
  },
  snapshotSourcePvcMissing: {
    defaultMessage: 'The source PVC no longer exists in this namespace.',
    description: 'Snapshot detail warning when source PVC was deleted',
    id: 'snapshotSourcePvcMissing',
  },
  snapshotManagedBy: {
    defaultMessage: 'Managed by',
    description: 'Snapshot backup tool label',
    id: 'snapshotManagedBy',
  },
  snapshotViewSourcePvc: {
    defaultMessage: 'View source PVC recommendations',
    description: 'Navigate from snapshot detail to PVC list filtered by source PVC',
    id: 'snapshotViewSourcePvc',
  },
  modalClose: {
    defaultMessage: 'Close',
    description: 'Generic modal close button',
    id: 'modalClose',
  },
  optimizationsDesc: {
    defaultMessage: 'Get detailed recommendations for how to optimize your Red Hat OpenShift cost and performance.',
    description: 'Get detailed recommendations for how to optimize your Red Hat OpenShift cost and performance.',
    id: 'optimizationsDesc',
  },
  optimizationsInfoArialLabel: {
    defaultMessage: 'A description of optimizations',
    description: 'A description of optimizations',
    id: 'optimizationsInfoArialLabel',
  },
  optimizationsInfoButtonArialLabel: {
    defaultMessage: 'A dialog with a description of optimizations',
    description: 'A dialog with a description of optimizations',
    id: 'optimizationsInfoButtonArialLabel',
  },
  optimizationsInfoDesc: {
    defaultMessage: 'To receive these recommendations, you must first enable your namespaces. {learnMore}',
    description: 'To receive these recommendations, you must first enable your namespaces. {learnMore}',
    id: 'optimizationsInfoDesc',
  },
  optimizationsInfoTitle: {
    defaultMessage: 'Assess and monitor usage from all of your clusters and provides optimization recommendations.',
    description: 'Assess and monitor usage from all of your clusters and provides optimization recommendations.',
    id: 'optimizationsInfoTitle',
  },
  optimizationsLoadingStateDesc: {
    defaultMessage: 'Searching for your optimizations. Do not refresh the browser',
    description: 'Searching for your optimizations. Do not refresh the browser',
    id: 'optimizationsLoadingStateDesc',
  },
  optimizationsLoadingStateTitle: {
    defaultMessage: 'Looking for optimizations...',
    description: 'Looking for optimizations',
    id: 'optimizationsLoadingStateTitle',
  },
  optimizationsLongTerm: {
    defaultMessage: 'Last 15 days (360h)',
    description: 'Last 15 days (360h)',
    id: 'optimizationsLongTerm',
  },
  optimizationsMediumTerm: {
    defaultMessage: 'Last 7 days (168h)',
    description: 'Last 7 days (168h)',
    id: 'optimizationsMediumTerm',
  },
  optimizationsNames: {
    defaultMessage:
      '{value, select, ' +
      'cluster {Cluster names} ' +
      'change  {Change} ' +
      'container {Container names} ' +
      'cpu  {CPU requests} ' +
      'current  {Current} ' +
      'last_reported {Last reported} ' +
      'memory  {Memory requests} ' +
      'instance_type {Instance type} ' +
      'namespace {Namespace} ' +
      'node {Node} ' +
      'node_classification {Classification} ' +
      'node_cpu_util {CPU util P50/P95} ' +
      'node_mem_util {Mem util P50/P95} ' +
      'node_fleet_reduction {Fleet reduction} ' +
      'machineset_name {Machine set} ' +
      'node_pod_count {Pod count} ' +
      'project {Project names} ' +
      'project_type {Project types} ' +
      'potential_savings {Potential savings} ' +
      'pvc_name {PVC name} ' +
      'snapshot_name {Snapshot name} ' +
      'classification {Classification} ' +
      'state {State} ' +
      'tags {Tags} ' +
      'vm_name {VM name} ' +
      'vm_guest_os {Guest OS} ' +
      'vm_current_vcpu {Current vCPU} ' +
      'vm_current_memory {Current memory} ' +
      'vm_recommended_vcpu {Rec. vCPU} ' +
      'vm_recommended_memory {Rec. memory} ' +
      'vm_status {Status} ' +
      'vm_recommended_series {Recommended series} ' +
      'vm_confidence {Confidence} ' +
      'vm_preference {Preference} ' +
      'workload {Workload names} ' +
      'workload_type {Workload types} ' +
      'other {}}',
    description: 'Optimization table column names',
    id: 'optimizationsNames',
  },
  optimizationsNoRecommendations: {
    defaultMessage: 'No recommendations available for this term.',
    description: 'Message when no recommendation data is available for the selected term',
    id: 'optimizationsNoRecommendations',
  },
  optimizationsPerformance: {
    defaultMessage: 'Performance optimizations',
    description: 'Performance optimizations',
    id: 'optimizationsPerformance',
  },
  optimizationsShortTerm: {
    defaultMessage: 'Last 24 hrs (24h)',
    description: 'Last 24 hrs (24h)',
    id: 'optimizationsShortTerm',
  },
  optimizationsProject: {
    defaultMessage: 'Optimization for this project',
    description: 'Optimization for this project',
    id: 'optimizationsProject',
  },
  optimizationsType: {
    defaultMessage: 'View optimizations based on',
    description: 'View optimizations based on',
    id: 'optimizationsType',
  },
  optimizationsValue: {
    defaultMessage: '{count, plural, =1 {{value} {units}} other {{value}{units}}}',
    description: '2 GiB',
    id: 'optimizationsValue',
  },
  optimizationsValues: {
    defaultMessage:
      '{value, select, ' +
      'cluster {Cluster name} ' +
      'container {Container name} ' +
      'last_reported {Last reported} ' +
      'recommendation_id {Recommendation id} ' +
      'project {Project name} ' +
      'workload {Workload name} ' +
      'workload_type {Workload type} ' +
      'other {}}',
    description: 'Selected items for export',
    id: 'optimizationsValues',
  },
  optimizationsViewAll: {
    defaultMessage: 'View all optimizations for this project',
    description: 'View all optimizations for this project',
    id: 'optimizationsViewAll',
  },
  optimizationsViewAllDisabled: {
    defaultMessage: 'This project has not reported data this month.',
    description: 'This project has not reported data this month.',
    id: 'optimizationsViewAllDisabled',
  },
  optimizedStateDesc: {
    defaultMessage: 'Good job optimizing the current configuration.',
    description: 'Good job optimizing the current configuration.',
    id: 'optimizedStateDesc',
  },
  optimizedStateTitle: {
    defaultMessage: 'You have reached recommended state!',
    description: 'You have reached recommended state!',
    id: 'optimizedStateTitle',
  },
  optimizeFor: {
    defaultMessage: 'Optimize for',
    description: 'Optimize for',
    id: 'optimizeFor',
  },
  pageTitleDefault: {
    defaultMessage: 'Cost Management ROS | OpenShift',
    description: 'Cost Management ROS | OpenShift',
    id: 'pageTitleDefault',
  },
  pageTitleOptimizations: {
    defaultMessage: 'Optimizations - Cost Management | OpenShift',
    description: 'Optimizations - Cost Management | OpenShift',
    id: 'pageTitleOptimizations',
  },
  paginationTitle: {
    defaultMessage:
      '{placement, select, ' +
      'top {{title} top pagination} ' +
      'bottom {{title} bottom pagination} ' +
      'other {{title} pagination}}',
    description: 'title for pagination aria',
    id: 'paginationTitle',
  },
  percentPlus: {
    defaultMessage: '{count, plural, one {+{value}%} other {{value}%}}',
    description: 'Percent value with plus symbol',
    id: 'percentPlus',
  },
  performance: {
    defaultMessage: 'Performance',
    description: 'Performance',
    id: 'performance',
  },
  perspective: {
    defaultMessage: 'Perspective',
    description: 'Perspective dropdown label',
    id: 'perspective',
  },
  perspectiveValues: {
    defaultMessage:
      '{value, select, ' +
      'aws {Amazon Web Services} ' +
      'aws_ocp {Amazon Web Services filtered by OpenShift} ' +
      'azure {Microsoft Azure} ' +
      'azure_ocp {Microsoft Azure filtered by OpenShift} ' +
      'gcp {Google Cloud Platform} ' +
      'gcp_ocp {Google Cloud Platform filtered by OpenShift} ' +
      'ibm {IBM Cloud} ' +
      'ibm_ocp {IBM filtered by OpenShift} ' +
      'oci {Oracle Cloud Infrastructure} ' +
      'ocp {All OpenShift} ' +
      'ocp_cloud {All cloud filtered by OpenShift} ' +
      'rhel {All RHEL} ' +
      'other {}}',
    description: 'Perspective values',
    id: 'perspectiveValues',
  },
  recommendedConfiguration: {
    defaultMessage: 'Recommended configuration',
    description: 'Recommended configuration',
    id: 'recommendedConfiguration',
  },
  recommendedLimit: {
    defaultMessage: 'Recommended limit ({dateRange})',
    description: 'Recommended limit (Jan 1-31)',
    id: 'recommendedLimit',
  },
  recommendedRequest: {
    defaultMessage: 'Recommended request ({dateRange})',
    description: 'Recommended request (Jan 1-31)',
    id: 'recommendedRequest',
  },
  request: {
    defaultMessage: 'Request',
    description: 'Request',
    id: 'request',
  },
  selectClearAriaLabel: {
    defaultMessage: 'Clear input value',
    description: 'Clear input value',
    id: 'selectClearAriaLabel',
  },
  selectableTableAriaLabel: {
    defaultMessage: 'Selectable table',
    description: 'Selectable table',
    id: 'selectableTableAriaLabel',
  },
  selectableTableHeaderAriaLabel: {
    defaultMessage: 'Select to open the optimizations drawer',
    description: 'Select to open the optimizations drawer',
    id: 'selectableTableHeaderAriaLabel',
  },
  selectableTableRowAriaLabel: {
    defaultMessage: 'Selectable table row',
    description: 'Selectable table row',
    id: 'selectableTableRowAriaLabel',
  },
  settingsErrorDesc: {
    defaultMessage: 'Failed to update settings',
    description: 'Failed to update settings',
    id: 'settingsErrorDesc',
  },
  settingsErrorTitle: {
    defaultMessage: 'Unable to save application settings',
    description: 'Unable to save application settings',
    id: 'settingsErrorTitle',
  },
  settingsSuccessDesc: {
    defaultMessage: 'Settings for Cost Management were replaced with new values',
    description: 'Settings for Cost Management were replaced with new values',
    id: 'settingsSuccessDesc',
  },
  settingsSuccessTitle: {
    defaultMessage: 'Application settings saved',
    description: 'Application settings saved',
    id: 'settingsSuccessTitle',
  },
  sinceDate: {
    defaultMessage: '{dateRange}',
    description: 'Jan 1-31',
    id: 'sinceDate',
  },
  suggestions: {
    defaultMessage: 'Suggestions',
    description: 'Suggestions',
    id: 'suggestions',
  },
  typeaheadAriaClear: {
    defaultMessage: 'Clear button and input',
    description: 'Clear button and input',
    id: 'typeaheadAriaClear',
  },
  unitTooltips: {
    defaultMessage:
      '{units, select, ' +
      'byte_ms {{value} Byte-ms} ' +
      'core_hours {{value} core-hours} ' +
      'gb {{value} GB} ' +
      'gb_hours {{value} GB-hours} ' +
      'gb_mo {{value} GB-month} ' +
      'gb_ms {{value} GB-ms} ' +
      'gibibyte_month {{value} GiB-month} ' +
      'hour {{value} hours} ' +
      'hrs {{value} hours} ' +
      'ms {{value} milliseconds} ' +
      'vm_hours {{value} VM-hours} ' +
      'other {{value}}}',
    description: 'return value and unit based on key: "units"',
    id: 'unitTooltips',
  },
  units: {
    defaultMessage:
      '{units, select, ' +
      'bytes {bytes} ' +
      'cores {cores} ' +
      'ei {Ei} ' +
      'eib {EiB} ' +
      'gi {Gi} ' +
      'gib {GiB} ' +
      'ki {Ki} ' +
      'kib {KiB} ' +
      'mi {Mi} ' +
      'mib {MiB} ' +
      'm {m} ' +
      'millicores {millicores} ' +
      'other {}}',
    description: 'return the proper unit label based on key: "units"',
    id: 'units',
  },
  unitsK8: {
    defaultMessage:
      '{units, select, ' +
      'bytes {bytes} ' +
      'cores {} ' +
      'ei {Ei} ' +
      'eib {Ei} ' +
      'gi {Gi} ' +
      'gib {Gi} ' +
      'ki {Ki} ' +
      'kib {Ki} ' +
      'mi {Mi} ' +
      'mib {Mi} ' +
      'm {m} ' +
      'millicores {m} ' +
      'other {}}',
    description: 'return the Kubernetes unit label based on key: "units"',
    id: 'unitsK8',
  },
  usage: {
    defaultMessage: 'Usage',
    description: 'Usage',
    id: 'usage',
  },
  valueUnits: {
    defaultMessage: '{value} {units}',
    description: '{value} {units}',
    id: 'valueUnits',
  },
  explanationConfidenceLevel: {
    defaultMessage: 'Confidence level',
    description: 'Label for recommendation confidence level',
    id: 'explanationConfidenceLevel',
  },
  explanationCostPercentileCpu: {
    defaultMessage: 'CPU cost percentile',
    description: 'Label for CPU cost percentile in millicores',
    id: 'explanationCostPercentileCpu',
  },
  explanationCostPercentileMem: {
    defaultMessage: 'Memory cost percentile',
    description: 'Label for memory cost percentile in KiB',
    id: 'explanationCostPercentileMem',
  },
  explanationDecayHalfLife: {
    defaultMessage: 'Decay half-life',
    description: 'Label for exponential decay half-life in hours',
    id: 'explanationDecayHalfLife',
  },
  explanationPerfPercentileCpu: {
    defaultMessage: 'CPU performance percentile',
    description: 'Label for CPU performance percentile in millicores',
    id: 'explanationPerfPercentileCpu',
  },
  explanationPerfPercentileMem: {
    defaultMessage: 'Memory performance percentile',
    description: 'Label for memory performance percentile in KiB',
    id: 'explanationPerfPercentileMem',
  },
  explanationTitle: {
    defaultMessage: 'Why this recommendation?',
    description: 'Expandable section title for recommendation explanation factors',
    id: 'explanationTitle',
  },
  explanationDataDays: {
    defaultMessage: 'Data days analyzed',
    description: 'Label for number of days of data used',
    id: 'explanationDataDays',
  },
  explanationCpuP95: {
    defaultMessage: 'CPU usage P95',
    description: 'Label for 95th percentile CPU usage',
    id: 'explanationCpuP95',
  },
  explanationCpuP50: {
    defaultMessage: 'CPU usage P50',
    description: 'Label for 50th percentile CPU usage',
    id: 'explanationCpuP50',
  },
  explanationCpuMean: {
    defaultMessage: 'CPU usage mean',
    description: 'Label for mean CPU usage',
    id: 'explanationCpuMean',
  },
  explanationCpuMargin: {
    defaultMessage: 'CPU adaptive margin',
    description: 'Label for CPU adaptive margin in basis points',
    id: 'explanationCpuMargin',
  },
  explanationCpuTrend: {
    defaultMessage: 'CPU trend slope',
    description: 'Label for CPU usage trend slope',
    id: 'explanationCpuTrend',
  },
  explanationMemP95: {
    defaultMessage: 'Memory usage P95',
    description: 'Label for 95th percentile memory usage',
    id: 'explanationMemP95',
  },
  explanationMemP50: {
    defaultMessage: 'Memory usage P50',
    description: 'Label for 50th percentile memory usage',
    id: 'explanationMemP50',
  },
  explanationMemMean: {
    defaultMessage: 'Memory usage mean',
    description: 'Label for mean memory usage',
    id: 'explanationMemMean',
  },
  explanationMemMargin: {
    defaultMessage: 'Memory adaptive margin',
    description: 'Label for memory adaptive margin in basis points',
    id: 'explanationMemMargin',
  },
  explanationMemTrend: {
    defaultMessage: 'Memory trend slope',
    description: 'Label for memory usage trend slope',
    id: 'explanationMemTrend',
  },
  explanationOomBump: {
    defaultMessage: 'OOM bump applied',
    description: 'Label indicating OOM kill buffer was applied',
    id: 'explanationOomBump',
  },
  explanationOomCount: {
    defaultMessage: 'OOM kill count',
    description: 'Label for total OOM kill events observed',
    id: 'explanationOomCount',
  },
  explanationCpuFloor: {
    defaultMessage: 'CPU floor applied',
    description: 'Label indicating minimum CPU floor was applied',
    id: 'explanationCpuFloor',
  },
  explanationIdle: {
    defaultMessage: 'Idle workload detected',
    description: 'Label indicating the workload was classified as idle',
    id: 'explanationIdle',
  },
  explanationNotAvailable: {
    defaultMessage: 'Explanation data will be available after the next data ingestion.',
    description: 'Message shown when explanation factors are not yet populated',
    id: 'explanationNotAvailable',
  },
  explanationYes: {
    defaultMessage: 'Yes',
    description: 'Boolean true value for explanation factors',
    id: 'explanationYes',
  },
  explanationNo: {
    defaultMessage: 'No',
    description: 'Boolean false value for explanation factors',
    id: 'explanationNo',
  },
  recommended: {
    defaultMessage: 'Recommended',
    description: 'Column header for recommended values',
    id: 'recommended',
  },
  savingsEstimatedMonthly: {
    defaultMessage: 'Estimated monthly savings',
    description: 'Label for estimated monthly savings',
    id: 'savingsEstimatedMonthly',
  },
  savingsNotAvailable: {
    defaultMessage: '—',
    description: 'Dash shown when savings data is not available',
    id: 'savingsNotAvailable',
  },
  savingsNoDataTooltip: {
    defaultMessage: 'No cost data available',
    description: 'Tooltip shown when savings dash is hovered',
    id: 'savingsNoDataTooltip',
  },
  replicaCount: {
    defaultMessage: 'Replicas',
    description: 'Label for replica count in detail header',
    id: 'replicaCount',
  },
  replicaValues: {
    defaultMessage: 'available {available} / min {min} / max {max} / desired {desired}',
    description: 'Replica available/min/max/desired values',
    id: 'replicaValues',
  },
  replicaNoDataTooltip: {
    defaultMessage:
      'Not reported by the metrics operator. This value may be managed by an HPA or not available for this workload.',
    description: 'Tooltip shown when a replica value is null',
    id: 'replicaNoDataTooltip',
  },
  dataThrough: {
    defaultMessage: 'Data through',
    description: 'Label for monitoring end time date',
    id: 'dataThrough',
  },
  durationHours: {
    defaultMessage: '{value}h',
    description: 'Duration in hours suffix',
    id: 'durationHours',
  },
  idleStateActive: {
    defaultMessage: 'Active',
    description: 'Active idle state filter label',
    id: 'idleStateActive',
  },
  idleStateBadge: {
    defaultMessage: '{state} {days, plural, =0 {} one {{days}d} other {{days}d}}',
    description: 'Idle/zombie badge text with optional duration',
    id: 'idleStateBadge',
  },
  idleStateIdle: {
    defaultMessage: 'Idle',
    description: 'Idle state filter label',
    id: 'idleStateIdle',
  },
  idleStateZombie: {
    defaultMessage: 'Zombie',
    description: 'Zombie idle state filter label',
    id: 'idleStateZombie',
  },
  wasteEstimatedMonthly: {
    defaultMessage: 'Estimated monthly waste',
    description: 'Label for estimated monthly waste column',
    id: 'wasteEstimatedMonthly',
  },
  idleCalloutTitle: {
    defaultMessage: 'Idle workload detected',
    description: 'Alert title for idle workload callout in detail view',
    id: 'idleCalloutTitle',
  },
  idleCalloutAction: {
    defaultMessage: 'Recommended action: {action}',
    description: 'Recommended action for idle container',
    id: 'idleCalloutAction',
  },
  idleCalloutConfidence: {
    defaultMessage: 'Confidence: {confidence}',
    description: 'Confidence level for idle recommendation',
    id: 'idleCalloutConfidence',
  },
  idleCalloutReason: {
    defaultMessage: 'Reason: {reason}',
    description: 'Reason for idle recommendation',
    id: 'idleCalloutReason',
  },
  dataQualityIncomplete: {
    defaultMessage: 'Analytics incomplete',
    description: 'Warning badge for incomplete analytics data',
    id: 'dataQualityIncomplete',
  },
  dataQualityIngestFailed: {
    defaultMessage: 'Ingest hooks failed',
    description: 'Warning badge for failed ingest hooks',
    id: 'dataQualityIngestFailed',
  },
  nodeClassificationIdle: {
    defaultMessage: 'Idle',
    description: 'Node classification filter option for idle nodes',
    id: 'nodeClassificationIdle',
  },
  nodeClassificationOvercommitted: {
    defaultMessage: 'Overcommitted',
    description: 'Node classification badge for overcommitted nodes',
    id: 'nodeClassificationOvercommitted',
  },
  nodeClassificationStrandedCpu: {
    defaultMessage: 'Stranded CPU',
    description: 'Node classification filter option for stranded CPU',
    id: 'nodeClassificationStrandedCpu',
  },
  nodeClassificationStrandedMemory: {
    defaultMessage: 'Stranded memory',
    description: 'Node classification filter option for stranded memory',
    id: 'nodeClassificationStrandedMemory',
  },
  nodeClassificationStrandedResource: {
    defaultMessage: 'Stranded {resource}',
    description: 'Node classification badge for stranded resource',
    id: 'nodeClassificationStrandedResource',
  },
  nodeClassificationUnderutilized: {
    defaultMessage: 'Underutilized',
    description: 'Node classification badge for underutilized nodes',
    id: 'nodeClassificationUnderutilized',
  },
  nodeClassificationWellUtilized: {
    defaultMessage: 'Well utilized',
    description: 'Node classification badge for well-utilized nodes',
    id: 'nodeClassificationWellUtilized',
  },
  nodeCountReduction: {
    defaultMessage: 'Node count reduction',
    description: 'Label for node count reduction in recommendations',
    id: 'nodeCountReduction',
  },
  nodeClassificationRationaleTitle: {
    defaultMessage: 'Classification rationale',
    description: 'Alert title for node instance type classification rationale',
    id: 'nodeClassificationRationaleTitle',
  },
  nodeUtilizationTitle: {
    defaultMessage: 'Utilization percentiles',
    description: 'Card title for node CPU and memory utilization percentiles',
    id: 'nodeUtilizationTitle',
  },
  nodeUtilizationP50Label: {
    defaultMessage: '{resource} P50',
    description: 'Progress bar label for node utilization P50 percentile',
    id: 'nodeUtilizationP50Label',
  },
  nodeUtilizationP95Label: {
    defaultMessage: '{resource} P95',
    description: 'Progress bar label for node utilization P95 percentile',
    id: 'nodeUtilizationP95Label',
  },
  nodeExplanationTargetUtilization: {
    defaultMessage: 'Target utilization',
    description: 'Node explanation factor for target utilization basis points',
    id: 'nodeExplanationTargetUtilization',
  },
  nodeExplanationCurrentCpu: {
    defaultMessage: 'Current CPU capacity',
    description: 'Node explanation factor for current CPU millicores',
    id: 'nodeExplanationCurrentCpu',
  },
  nodeExplanationMaxCpuP95: {
    defaultMessage: 'Max CPU usage P95',
    description: 'Node explanation factor for max CPU usage P95 millicores',
    id: 'nodeExplanationMaxCpuP95',
  },
  nodeExplanationCurrentMemory: {
    defaultMessage: 'Current memory capacity',
    description: 'Node explanation factor for current memory KiB',
    id: 'nodeExplanationCurrentMemory',
  },
  nodeExplanationMaxMemP95: {
    defaultMessage: 'Max memory usage P95',
    description: 'Node explanation factor for max memory usage P95 KiB',
    id: 'nodeExplanationMaxMemP95',
  },
  nodeExplanationPodHeadroom: {
    defaultMessage: 'Pod scheduling headroom',
    description: 'Node explanation factor for pod scheduling headroom basis points',
    id: 'nodeExplanationPodHeadroom',
  },
  nodeExplanationEmaImbalance: {
    defaultMessage: 'EMA imbalance',
    description: 'Node explanation factor for EMA imbalance basis points',
    id: 'nodeExplanationEmaImbalance',
  },
  nodeExplanationConsolidationApplied: {
    defaultMessage: 'Consolidation applied',
    description: 'Node explanation factor for fleet consolidation flag',
    id: 'nodeExplanationConsolidationApplied',
  },
  nodeExplanationSizingFormula: {
    defaultMessage: 'Sizing formula',
    description: 'Node explanation factor for sizing formula identifier',
    id: 'nodeExplanationSizingFormula',
  },
  nodes: {
    defaultMessage: 'Nodes',
    description: 'Node tab toggle label',
    id: 'nodes',
  },
  peakHoursSizing: {
    defaultMessage: 'Peak hours sizing',
    description: 'Card title for peak hours sizing recommendations',
    id: 'peakHoursSizing',
  },
  vmStatusIdle: {
    defaultMessage: 'Idle',
    description: 'VM status badge for idle VMs',
    id: 'vmStatusIdle',
  },
  vmStatusAbandoned: {
    defaultMessage: 'Abandoned',
    description: 'VM status badge for abandoned VMs',
    id: 'vmStatusAbandoned',
  },
  vmStatusOversized: {
    defaultMessage: 'Oversized',
    description: 'VM status badge for oversized VMs',
    id: 'vmStatusOversized',
  },
  vmStatusPowerOff: {
    defaultMessage: 'Power-off candidate',
    description: 'VM status badge for power-off candidate VMs',
    id: 'vmStatusPowerOff',
  },
  vmStatusOk: {
    defaultMessage: 'OK',
    description: 'VM status badge for healthy VMs',
    id: 'vmStatusOk',
  },
  vmMetadataFlagsTitle: {
    defaultMessage: 'VM classification flags',
    description: 'Alert title for VM metadata classification flags on breakdown page',
    id: 'vmMetadataFlagsTitle',
  },
  visualInsights: {
    defaultMessage: 'Visual Insights',
    description: 'Visual Insights section title',
    id: 'visualInsights',
  },
  visualInsightsOomTimeline: {
    defaultMessage: 'OOM Event Timeline',
    description: 'OOM Event Timeline chart title',
    id: 'visualInsightsOomTimeline',
  },
  visualInsightsOomTimelineEmpty: {
    defaultMessage: 'No OOM events detected in this period',
    description: 'Empty state for OOM timeline chart',
    id: 'visualInsightsOomTimelineEmpty',
  },
  visualInsightsOomTimelineTooltip: {
    defaultMessage: '{date}: {count, plural, one {{count} OOM kill} other {{count} OOM kills}}',
    description: 'Tooltip for OOM timeline scatter point',
    id: 'visualInsightsOomTimelineTooltip',
  },
  visualInsightsCpuThrottleTrend: {
    defaultMessage: 'CPU Throttle Trend',
    description: 'CPU Throttle Trend chart title',
    id: 'visualInsightsCpuThrottleTrend',
  },
  visualInsightsCpuThrottleEmpty: {
    defaultMessage: 'No CPU throttling detected',
    description: 'Empty state for CPU throttle chart',
    id: 'visualInsightsCpuThrottleEmpty',
  },
  visualInsightsCpuThrottleP95: {
    defaultMessage: 'Throttle (p95)',
    description: 'Legend label for CPU throttle p95 area',
    id: 'visualInsightsCpuThrottleP95',
  },
  visualInsightsCpuThrottleMax: {
    defaultMessage: 'Throttle (max)',
    description: 'Legend label for CPU throttle max line',
    id: 'visualInsightsCpuThrottleMax',
  },
  visualInsightsCpuUsageP95: {
    defaultMessage: 'CPU Usage (p95)',
    description: 'Legend label for CPU usage p95 overlay line',
    id: 'visualInsightsCpuUsageP95',
  },
  clusterQuotaGaugeAriaDesc: {
    defaultMessage: '{resource} utilization as a percentage of the cluster quota hard limit',
    description: 'Accessible description for a cluster quota utilization donut gauge',
    id: 'clusterQuotaGaugeAriaDesc',
  },
  clusterQuotaGaugeAriaTitle: {
    defaultMessage: '{resource} Utilization',
    description: 'Accessible title for a cluster quota utilization donut gauge',
    id: 'clusterQuotaGaugeAriaTitle',
  },
  clusterQuotaGaugeCpuTitle: {
    defaultMessage: 'CPU',
    description: 'Label for the CPU cluster quota utilization gauge',
    id: 'clusterQuotaGaugeCpuTitle',
  },
  clusterQuotaGaugeMemoryTitle: {
    defaultMessage: 'Memory',
    description: 'Label for the Memory cluster quota utilization gauge',
    id: 'clusterQuotaGaugeMemoryTitle',
  },
  clusterQuotaGaugePodsTitle: {
    defaultMessage: 'Pods',
    description: 'Label for the Pods cluster quota utilization gauge',
    id: 'clusterQuotaGaugePodsTitle',
  },
  clusterQuotaGaugeSubtitle: {
    defaultMessage: '{used} / {hard}',
    description: 'Subtitle below the cluster quota gauge showing used vs hard limit values',
    id: 'clusterQuotaGaugeSubtitle',
  },
  visualInsightsPvcUtilizationTitle: {
    defaultMessage: 'PVC Utilization',
    description: 'Title for the PVC utilization donut gauge',
    id: 'visualInsightsPvcUtilizationTitle',
  },
  visualInsightsPvcUtilizationDesc: {
    defaultMessage: 'Current PVC usage as a percentage of provisioned capacity',
    description: 'Accessible description for the PVC utilization donut gauge',
    id: 'visualInsightsPvcUtilizationDesc',
  },
  visualInsightsPvcUtilizationDataAsOf: {
    defaultMessage: 'Data as of {date}',
    description: 'Staleness label below the PVC utilization gauge',
    id: 'visualInsightsPvcUtilizationDataAsOf',
  },
  visualInsightsPvcUtilizationUsed: {
    defaultMessage: '{percent}% used',
    description: 'Label shown in the center of the PVC utilization donut gauge',
    id: 'visualInsightsPvcUtilizationUsed',
  },
  visualInsightsNodePodHeadroomTitle: {
    defaultMessage: 'Pod Scheduling Headroom',
    description: 'Title for the node pod scheduling headroom donut gauge',
    id: 'visualInsightsNodePodHeadroomTitle',
  },
  visualInsightsNodePodHeadroomDesc: {
    defaultMessage: 'Current pod count as a percentage of node pod capacity',
    description: 'Accessible description for the node pod scheduling headroom donut gauge',
    id: 'visualInsightsNodePodHeadroomDesc',
  },
  visualInsightsNodePodHeadroomScheduled: {
    defaultMessage: '{percent}% scheduled',
    description: 'Label shown in the center of the node pod headroom donut gauge',
    id: 'visualInsightsNodePodHeadroomScheduled',
  },
  visualInsightsNodePodHeadroomDataAsOf: {
    defaultMessage: 'Data as of {date}',
    description: 'Staleness label below the node pod headroom gauge',
    id: 'visualInsightsNodePodHeadroomDataAsOf',
  },
  visualInsightsSnapshotAgeDistribution: {
    defaultMessage: 'Snapshot Age Distribution',
    description: 'Title for the snapshot age distribution histogram chart',
    id: 'visualInsightsSnapshotAgeDistribution',
  },
  visualInsightsSnapshotAgeDistributionDesc: {
    defaultMessage: 'Distribution of volume snapshots by age in days',
    description: 'Accessible description for the snapshot age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionDesc',
  },
  visualInsightsSnapshotAgeDistributionEmpty: {
    defaultMessage: 'No snapshot data available',
    description: 'Empty state when no snapshots exist for the age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionEmpty',
  },
  visualInsightsSnapshotAgeDistributionError: {
    defaultMessage: 'Unable to load snapshot age distribution',
    description: 'Error state when the snapshot age distribution API call fails',
    id: 'visualInsightsSnapshotAgeDistributionError',
  },
  visualInsightsSnapshotAgeDistributionTooltip: {
    defaultMessage: '{label}: {count, plural, one {{count} snapshot} other {{count} snapshots}}',
    description: 'Tooltip for a bar in the snapshot age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionTooltip',
  },
  visualInsightsSnapshotAgeDistributionYAxis: {
    defaultMessage: 'Snapshot Count',
    description: 'Y-axis label for the snapshot age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionYAxis',
  },
  visualInsightsSnapshotAgeDistributionBucketHeader: {
    defaultMessage: 'Age Range',
    description: 'Accessible table header for age bucket labels in the snapshot age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionBucketHeader',
  },
  visualInsightsSnapshotAgeDistributionCountHeader: {
    defaultMessage: 'Count',
    description: 'Accessible table header for snapshot count in the age distribution chart',
    id: 'visualInsightsSnapshotAgeDistributionCountHeader',
  },
  visualInsightsSnapshotCostByType: {
    defaultMessage: 'Snapshot Cost by Type',
    description: 'Title for the snapshot cost-by-type donut chart',
    id: 'visualInsightsSnapshotCostByType',
  },
  visualInsightsSnapshotCostByTypeDesc: {
    defaultMessage: 'Proportional breakdown of snapshot storage cost by recommendation type',
    description: 'Accessible description for the snapshot cost-by-type donut chart',
    id: 'visualInsightsSnapshotCostByTypeDesc',
  },
  visualInsightsSnapshotCostByTypeEmpty: {
    defaultMessage: 'No snapshot cost data available',
    description: 'Empty state when no snapshot cost data exists',
    id: 'visualInsightsSnapshotCostByTypeEmpty',
  },
  visualInsightsSnapshotCostByTypeError: {
    defaultMessage: 'Unable to load snapshot cost data',
    description: 'Error state when the snapshot cost-by-type API call fails',
    id: 'visualInsightsSnapshotCostByTypeError',
  },
  visualInsightsSnapshotCostByTypeTooltip: {
    defaultMessage: '{type}: {cost} ({count, plural, one {{count} snapshot} other {{count} snapshots}})',
    description: 'Tooltip for a segment in the snapshot cost-by-type donut chart',
    id: 'visualInsightsSnapshotCostByTypeTooltip',
  },
  visualInsightsVmDiskIo: {
    defaultMessage: 'Disk I/O Trends',
    description: 'Title for the VM disk I/O visual insights section',
    id: 'visualInsightsVmDiskIo',
  },
  visualInsightsVmSizingTitle: {
    defaultMessage: 'VM Resource Sizing',
    description: 'Title for the VM resource sizing grouped bar chart',
    id: 'visualInsightsVmSizingTitle',
  },
  visualInsightsVmSizingDesc: {
    defaultMessage: 'Comparison of current vs recommended vCPU and memory allocation',
    description: 'Accessible description for the VM resource sizing chart',
    id: 'visualInsightsVmSizingDesc',
  },
  visualInsightsVmSizingVcpu: {
    defaultMessage: 'vCPU',
    description: 'X-axis group label for vCPU in the VM sizing chart',
    id: 'visualInsightsVmSizingVcpu',
  },
  visualInsightsVmSizingMemoryGib: {
    defaultMessage: 'Memory GiB',
    description: 'X-axis group label for memory in the VM sizing chart',
    id: 'visualInsightsVmSizingMemoryGib',
  },
  visualInsightsVmSizingResourceMetric: {
    defaultMessage: 'Resource Metric',
    description: 'X-axis label for the VM resource sizing chart',
    id: 'visualInsightsVmSizingResourceMetric',
  },
  visualInsightsVmSizingSavings: {
    defaultMessage: 'Estimated monthly savings: {amount} ({percent}% reduction)',
    description: 'Savings callout below the VM resource sizing chart',
    id: 'visualInsightsVmSizingSavings',
  },
  visualInsightsVmIopsTitle: {
    defaultMessage: 'IOPS (p95)',
    description: 'Title for the IOPS sparkline chart',
    id: 'visualInsightsVmIopsTitle',
  },
  visualInsightsVmIopsDesc: {
    defaultMessage: 'Daily p95 disk read and write IOPS over the observation period',
    description: 'Accessible description for the IOPS sparkline chart',
    id: 'visualInsightsVmIopsDesc',
  },
  visualInsightsVmThroughputTitle: {
    defaultMessage: 'Throughput (p95)',
    description: 'Title for the throughput sparkline chart',
    id: 'visualInsightsVmThroughputTitle',
  },
  visualInsightsVmThroughputDesc: {
    defaultMessage: 'Daily p95 disk read and write throughput over the observation period',
    description: 'Accessible description for the throughput sparkline chart',
    id: 'visualInsightsVmThroughputDesc',
  },
  visualInsightsVmIoRead: {
    defaultMessage: 'Read',
    description: 'Legend label for disk read series in I/O sparklines',
    id: 'visualInsightsVmIoRead',
  },
  visualInsightsVmIoWrite: {
    defaultMessage: 'Write',
    description: 'Legend label for disk write series in I/O sparklines',
    id: 'visualInsightsVmIoWrite',
  },
  visualInsightsVmIoEmpty: {
    defaultMessage: 'No I/O data available for this period',
    description: 'Empty state when all VM I/O values are null or zero',
    id: 'visualInsightsVmIoEmpty',
  },
  visualInsightsVmCpuTrendTitle: {
    defaultMessage: 'CPU Utilization Trend',
    description: 'Title for the VM CPU utilization trend line chart',
    id: 'visualInsightsVmCpuTrendTitle',
  },
  visualInsightsVmCpuTrendDesc: {
    defaultMessage: 'Daily p95 CPU usage in cores with recommended threshold over the observation window',
    description: 'Accessible description for the VM CPU utilization trend chart',
    id: 'visualInsightsVmCpuTrendDesc',
  },
  visualInsightsVmMemoryTrendTitle: {
    defaultMessage: 'Memory Utilization Trend',
    description: 'Title for the VM memory utilization trend line chart',
    id: 'visualInsightsVmMemoryTrendTitle',
  },
  visualInsightsVmMemoryTrendDesc: {
    defaultMessage: 'Daily p95 memory usage in GiB with recommended threshold over the observation window',
    description: 'Accessible description for the VM memory utilization trend chart',
    id: 'visualInsightsVmMemoryTrendDesc',
  },
  visualInsightsVmTrendP95Usage: {
    defaultMessage: 'P95 usage',
    description: 'Legend label for p95 usage trend line in VM utilization charts',
    id: 'visualInsightsVmTrendP95Usage',
  },
  visualInsightsVmTrendRecommended: {
    defaultMessage: 'Recommended',
    description: 'Legend label for recommended threshold reference line in VM utilization charts',
    id: 'visualInsightsVmTrendRecommended',
  },
  visualInsightsNodeCpuTrendTitle: {
    defaultMessage: 'CPU Utilization Trend',
    description: 'Title for the node CPU utilization trend chart',
    id: 'visualInsightsNodeCpuTrendTitle',
  },
  visualInsightsNodeCpuTrendDesc: {
    defaultMessage: 'Daily CPU utilization as a percentage of allocatable capacity over the selected date range',
    description: 'Accessible description for the node CPU utilization trend chart',
    id: 'visualInsightsNodeCpuTrendDesc',
  },
  visualInsightsNodeMemoryTrendTitle: {
    defaultMessage: 'Memory Utilization Trend',
    description: 'Title for the node memory utilization trend chart',
    id: 'visualInsightsNodeMemoryTrendTitle',
  },
  visualInsightsNodeMemoryTrendDesc: {
    defaultMessage: 'Daily memory utilization as a percentage of allocatable capacity over the selected date range',
    description: 'Accessible description for the node memory utilization trend chart',
    id: 'visualInsightsNodeMemoryTrendDesc',
  },
  visualInsightsNodeTrendP95: {
    defaultMessage: 'P95 utilization',
    description: 'Legend label for P95 utilization line in node trend charts',
    id: 'visualInsightsNodeTrendP95',
  },
  visualInsightsNodeTrendP50: {
    defaultMessage: 'P50 utilization',
    description: 'Legend label for P50 (median) utilization line in node trend charts',
    id: 'visualInsightsNodeTrendP50',
  },
  visualInsightsNodeTrendThreshold: {
    defaultMessage: 'Consolidation threshold',
    description: 'Legend label for the consolidation threshold horizontal line in node trend charts',
    id: 'visualInsightsNodeTrendThreshold',
  },
  visualInsightsVmUtilizationTrends: {
    defaultMessage: 'Utilization Trends',
    description: 'Section title for the VM CPU and memory utilization trend charts',
    id: 'visualInsightsVmUtilizationTrends',
  },
  visualInsightsVramUtilizationTitle: {
    defaultMessage: 'VRAM Utilization',
    description: 'Title for the GPU VRAM utilization donut gauge',
    id: 'visualInsightsVramUtilizationTitle',
  },
  visualInsightsVramUtilizationDesc: {
    defaultMessage: 'Peak GPU frame buffer usage as a percentage of total VRAM capacity',
    description: 'Accessible description for the GPU VRAM utilization donut gauge',
    id: 'visualInsightsVramUtilizationDesc',
  },
  visualInsightsVramUtilizationUsed: {
    defaultMessage: '{percent}% used',
    description: 'Label shown in the center of the VRAM utilization donut gauge',
    id: 'visualInsightsVramUtilizationUsed',
  },
  visualInsightsVramUtilizationSubtitle: {
    defaultMessage: '{usage} / {capacity} MiB',
    description: 'Subtitle below the VRAM utilization gauge showing usage vs capacity',
    id: 'visualInsightsVramUtilizationSubtitle',
  },
  visualInsightsGpuRadarTitle: {
    defaultMessage: 'GPU Subsystem Utilization',
    description: 'Title for the GPU subsystem utilization radar chart',
    id: 'visualInsightsGpuRadarTitle',
  },
  visualInsightsGpuRadarDesc: {
    defaultMessage: 'Radar chart showing SM activity, tensor core activity, DRAM bandwidth, and VRAM usage as percentages',
    description: 'Accessible description for the GPU subsystem utilization radar chart',
    id: 'visualInsightsGpuRadarDesc',
  },
  visualInsightsGpuRadarAxisSm: {
    defaultMessage: 'SM Activity',
    description: 'Radar chart axis label for streaming multiprocessor activity',
    id: 'visualInsightsGpuRadarAxisSm',
  },
  visualInsightsGpuRadarAxisTensor: {
    defaultMessage: 'Tensor Core',
    description: 'Radar chart axis label for tensor core pipeline activity',
    id: 'visualInsightsGpuRadarAxisTensor',
  },
  visualInsightsGpuRadarAxisDram: {
    defaultMessage: 'DRAM Bandwidth',
    description: 'Radar chart axis label for DRAM bandwidth activity',
    id: 'visualInsightsGpuRadarAxisDram',
  },
  visualInsightsGpuRadarAxisVram: {
    defaultMessage: 'VRAM Usage',
    description: 'Radar chart axis label for VRAM (frame buffer) usage',
    id: 'visualInsightsGpuRadarAxisVram',
  },
  visualInsightsGpuRadarSubsystem: {
    defaultMessage: 'Subsystem',
    description: 'Column header for subsystem name in the radar chart accessibility table',
    id: 'visualInsightsGpuRadarSubsystem',
  },
  visualInsightsGpuRadarUtilization: {
    defaultMessage: 'Utilization',
    description: 'Column header for utilization percentage in the radar chart accessibility table',
    id: 'visualInsightsGpuRadarUtilization',
  },
  visualInsightsGpuSectionTitle: {
    defaultMessage: 'Visual Insights',
    description: 'Section title for GPU visual insights section on breakdown pages',
    id: 'visualInsightsGpuSectionTitle',
  },
  visualInsightsQuotaTrendTitle: {
    defaultMessage: 'Quota Headroom Trend',
    description: 'Section title for the namespace quota headroom trend charts',
    id: 'visualInsightsQuotaTrendTitle',
  },
  visualInsightsQuotaTrendCpuTitle: {
    defaultMessage: 'CPU Request',
    description: 'Title for the CPU request quota headroom trend chart',
    id: 'visualInsightsQuotaTrendCpuTitle',
  },
  visualInsightsQuotaTrendCpuDesc: {
    defaultMessage: 'Daily CPU request quota hard limit vs actual usage in millicores',
    description: 'Accessible description for the CPU request quota headroom chart',
    id: 'visualInsightsQuotaTrendCpuDesc',
  },
  visualInsightsQuotaTrendMemoryTitle: {
    defaultMessage: 'Memory Request',
    description: 'Title for the memory request quota headroom trend chart',
    id: 'visualInsightsQuotaTrendMemoryTitle',
  },
  visualInsightsQuotaTrendMemoryDesc: {
    defaultMessage: 'Daily memory request quota hard limit vs actual usage',
    description: 'Accessible description for the memory request quota headroom chart',
    id: 'visualInsightsQuotaTrendMemoryDesc',
  },
  visualInsightsQuotaTrendHardLimit: {
    defaultMessage: 'Hard limit',
    description: 'Legend label for the quota hard limit line in headroom charts',
    id: 'visualInsightsQuotaTrendHardLimit',
  },
  visualInsightsQuotaTrendUsed: {
    defaultMessage: 'Used',
    description: 'Legend label for the actual usage line in headroom charts',
    id: 'visualInsightsQuotaTrendUsed',
  },
  visualInsightsQuotaTrendEmpty: {
    defaultMessage: 'No quota trend data available for this period',
    description: 'Empty state when no quota trend data exists',
    id: 'visualInsightsQuotaTrendEmpty',
  },
  visualInsightsQuotaTrendError: {
    defaultMessage: 'Unable to load quota trend data',
    description: 'Error state when the quota trend API call fails',
    id: 'visualInsightsQuotaTrendError',
  },
  welcomeInfo: {
    defaultMessage: 'For more information visit {url}',
    description: 'more information url',
    id: 'welcomeInfo',
  },
  welcomeTitle: {
    defaultMessage: 'Cost Management ROS UI',
    description: 'Cost Management ROS UI',
    id: 'welcomeTitle',
  },
});
