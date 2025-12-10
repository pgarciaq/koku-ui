import { connect } from 'react-redux';
import { DashboardBase } from 'routes/overview/components';
import type { DashboardStateProps } from 'routes/overview/components/dashboardBase';
import { createMapStateToProps } from 'store/common';
import { ocpOnPremiseDashboardSelectors } from 'store/dashboard/ocpOnPremiseDashboard';

import { OcpOnPremiseDashboardWidget } from './ocpOnPremiseDashboardWidget';

type OcpOnPremiseDashboardOwnProps = any;

const mapStateToProps = createMapStateToProps<OcpOnPremiseDashboardOwnProps, DashboardStateProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (state, props) => {
    return {
      DashboardWidget: OcpOnPremiseDashboardWidget,
      selectWidgets: ocpOnPremiseDashboardSelectors.selectWidgets(state),
      widgets: ocpOnPremiseDashboardSelectors.selectCurrentWidgets(state),
    };
  }
);

const OcpOnPremiseDashboard = connect(mapStateToProps, {})(DashboardBase);

export default OcpOnPremiseDashboard;



