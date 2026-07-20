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
      case formatPath(routePaths.awsBreakdown.path):
      case formatPath(routePaths.awsDetails.path):
        msg = messages.notAuthorizedStateAws;
        break;
      case formatPath(routePaths.azureBreakdown.path):
      case formatPath(routePaths.azureDetails.path):
        msg = messages.notAuthorizedStateAzure;
        break;
      case formatPath(routePaths.costModelBreakdown.basePath):
      case formatPath(routePaths.costModelCreate.path):
        msg = messages.notAuthorizedStateCostModels;
        break;
      case formatPath(routePaths.gcpBreakdown.path):
      case formatPath(routePaths.gcpDetails.path):
        msg = messages.notAuthorizedStateGcp;
        break;
      case formatPath(routePaths.ocpBreakdown.path):
      case formatPath(routePaths.ocpDetails.path):
        msg = messages.notAuthorizedStateOcp;
        break;
      case formatPath(routePaths.optimizationsBreakdown.path):
      case formatPath(routePaths.optimizations.path):
        msg = messages.notAuthorizedStateOptimizations;
        break;
      case formatPath(routePaths.priceListBreakdown.basePath):
      case formatPath(routePaths.priceListCreate.path):
        msg = messages.notAuthorizedStatePriceLists;
        break;
      case formatPath(routePaths.settings.path):
        msg = messages.notAuthorizedStateSettings;
        break;
      case formatPath(routePaths.explorer.path):
      default:
        msg = messages.costManagement;
        break;
    }
    return <UnauthorizedAccess serviceName={intl.formatMessage(msg)} />;
  }
}

const NotAuthorizedState = injectIntl(NotAuthorizedStateBase);

export { NotAuthorizedState };
