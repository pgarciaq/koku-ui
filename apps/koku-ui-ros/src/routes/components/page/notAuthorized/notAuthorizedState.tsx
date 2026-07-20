import UnauthorizedAccess from '@patternfly/react-component-groups/dist/esm/UnauthorizedAccess';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface NotAuthorizedStateOwnProps {
  pathname?: string;
}

type NotAuthorizedStateProps = NotAuthorizedStateOwnProps & WrappedComponentProps;

class NotAuthorizedStateBase extends React.Component<NotAuthorizedStateProps, any> {
  public render() {
    const { intl, pathname } = this.props;

    let msg;

    switch (pathname) {
      case formatPath(routePaths.ocpOptimizations.path):
      case formatPath(routePaths.ocpOptimizationsBreakdown.path):
      case formatPath(routePaths.optimizationsBadge.path):
      case formatPath(routePaths.optimizationsContainersTable.path):
      case formatPath(routePaths.optimizationsDetails.path):
      case formatPath(routePaths.optimizationsDetailsBreakdown.path):
      case formatPath(routePaths.optimizationsLink.path):
      case formatPath(routePaths.optimizationsProjectsTable.path):
      case formatPath(routePaths.optimizationsSummary.path):
      default:
        msg = messages.costManagement;
        break;
    }
    return <UnauthorizedAccess serviceName={intl.formatMessage(msg)} />;
  }
}

const NotAuthorizedState = injectIntl(NotAuthorizedStateBase);

export { NotAuthorizedState };
