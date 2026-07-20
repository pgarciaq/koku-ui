import { getUserAccessQuery } from 'api/queries/userAccessQuery';
import type { UserAccess } from 'api/userAccess';
import { UserAccessType } from 'api/userAccess';
import type { AxiosError } from 'axios';
import React from 'react';
import { connect } from 'react-redux';
import { routePaths } from 'routePaths';
import { Loading } from 'routes/components/page/loading';
import { NotAuthorized } from 'routes/components/page/notAuthorized';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { userAccessQuery, userAccessSelectors } from 'store/userAccess';
import type { ChromeComponentProps } from 'utils/chrome';
import { withChrome } from 'utils/chrome';
import { formatPath, usePathname } from 'utils/paths';
import {
  hasAwsAccess,
  hasAzureAccess,
  hasCostModelAccess,
  hasGcpAccess,
  hasOcpAccess,
  hasSettingsAccess,
} from 'utils/userAccess';

interface PermissionsOwnProps extends ChromeComponentProps {
  children?: React.ReactNode;
}

interface PermissionsStateProps {
  userAccess: UserAccess;
  userAccessError: AxiosError;
  userAccessFetchStatus: FetchStatus;
  userAccessQueryString: string;
}

type PermissionsProps = PermissionsOwnProps & PermissionsStateProps;

const PermissionsBase: React.FC<PermissionsProps> = ({
  children = null,
  // chrome,
  userAccess,
  userAccessError,
  userAccessFetchStatus,
}) => {
  const hasPermissions = pathname => {
    if (!(userAccess && userAccessFetchStatus === FetchStatus.complete)) {
      return false;
    }

    const aws = hasAwsAccess(userAccess);
    const azure = hasAzureAccess(userAccess);
    const costModel = hasCostModelAccess(userAccess);
    const gcp = hasGcpAccess(userAccess);
    const ocp = hasOcpAccess(userAccess);
    const settings = hasSettingsAccess(userAccess);

    switch (pathname) {
      case formatPath(routePaths.explorer.path):
      case formatPath(routePaths.overview.path):
        return aws || azure || gcp || ocp;
      case formatPath(routePaths.awsBreakdown.path):
      case formatPath(routePaths.awsDetails.path):
        return aws;
      case formatPath(routePaths.azureBreakdown.path):
      case formatPath(routePaths.azureDetails.path):
        return azure;
      case formatPath(routePaths.costModelBreakdown.basePath):
      case formatPath(routePaths.costModelCreate.path):
        return costModel;
      case formatPath(routePaths.gcpBreakdown.path):
      case formatPath(routePaths.gcpDetails.path):
        return gcp;
      case formatPath(routePaths.ocpBreakdown.path):
      case formatPath(routePaths.ocpDetails.path):
      case formatPath(routePaths.ocpOptimizationsBreakdown.path):
      case formatPath(routePaths.optimizationsBreakdown.path):
      case formatPath(routePaths.optimizationsNamespaceBreakdown.path):
      case formatPath(routePaths.optimizationsNodeBreakdown.path):
      case formatPath(routePaths.optimizationsVmBreakdown.path):
      case formatPath(routePaths.optimizationsPvcBreakdown.path):
      case formatPath(routePaths.optimizationsQuotaBreakdown.path):
      case formatPath(routePaths.optimizationsClusterQuotaBreakdown.path):
      case formatPath(routePaths.optimizationsGpuTimeslicingBreakdown.path):
      case formatPath(routePaths.optimizationsGpuMigBreakdown.path):
      case formatPath(routePaths.optimizations.path):
        return ocp;
      case formatPath(routePaths.priceListBreakdown.basePath):
      case formatPath(routePaths.priceListCreate.path):
        return costModel;
      case formatPath(routePaths.settings.path):
        return settings || costModel;
      default:
        return false;
    }
  };

  // Page access denied because user doesn't have RBAC permissions and is not an org admin
  const pathname = usePathname();
  let result = <NotAuthorized pathname={pathname} />;

  if (userAccessFetchStatus === FetchStatus.inProgress) {
    result = <Loading />;
  } else if (userAccessError) {
    result = <NotAvailable />;
  } else if (hasPermissions(pathname)) {
    result = <>{children}</>;
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<PermissionsOwnProps, PermissionsStateProps>((state, props) => {
  const userAccessQueryString = getUserAccessQuery(userAccessQuery);
  const userAccess = userAccessSelectors.selectUserAccess(state, UserAccessType.all, userAccessQueryString);
  const userAccessError = userAccessSelectors.selectUserAccessError(state, UserAccessType.all, userAccessQueryString);
  const userAccessFetchStatus = userAccessSelectors.selectUserAccessFetchStatus(
    state,
    UserAccessType.all,
    userAccessQueryString
  );

  return {
    userAccess,
    userAccessError,
    userAccessFetchStatus,
    userAccessQueryString,
  };
});

const Permissions = withChrome(connect(mapStateToProps, undefined)(PermissionsBase));

export default Permissions;
