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
      'workload {Workload name} ' +
      'workload_type {Workload type} ' +
      'other {}}',
    description: 'Filter by values',
    id: 'filterByValues',
  },
  filterByValuesAriaLabel: {
    defaultMessage: 'Values',
    description: 'Values',
    id: 'filterByValuesAriaLabel',
  },
  forDate: {
    defaultMessage: '{value} for {dateRange}',
    description: '{value} for {Jan 1-31}',
    id: 'forDate',
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
      'node_cpu_util {CPU util P95} ' +
      'node_mem_util {Mem util P95} ' +
      'node_pod_count {Pod count} ' +
      'project {Project names} ' +
      'project_type {Project types} ' +
      'potential_savings {Potential savings} ' +
      'state {State} ' +
      'tags {Tags} ' +
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
    defaultMessage: 'Not reported by the metrics operator. This value may be managed by an HPA or not available for this workload.',
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
