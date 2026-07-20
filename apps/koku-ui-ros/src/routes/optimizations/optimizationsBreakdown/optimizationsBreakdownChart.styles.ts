import { chart_color_blue_100 } from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import { chart_color_blue_200 } from '@patternfly/react-tokens/dist/js/chart_color_blue_200';
import { chart_color_blue_300 } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { chart_color_blue_400 } from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import { chart_color_orange_200 } from '@patternfly/react-tokens/dist/js/chart_color_orange_200';
import { chart_color_orange_300 } from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import { t_global_color_status_danger_200 } from '@patternfly/react-tokens/dist/js/t_global_color_status_danger_200';

export const chartStyles = {
  limit: {
    fill: 'none',
  },
  limitColorScale: [t_global_color_status_danger_200.var],
  request: {
    fill: 'none',
  },
  requestColorScale: [chart_color_blue_400.var],
  usageP50ColorScale: [chart_color_blue_400.var],
  usageP50P95ColorScale: [chart_color_blue_200.var],
  usageP95P99ColorScale: [chart_color_blue_100.var],
  usageMaxColorScale: [chart_color_blue_300.var],
  bhP50ColorScale: [chart_color_orange_300.var],
  bhP50P95ColorScale: [chart_color_orange_200.var],
};
