import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { routePaths } from 'routePaths';
import { formatPath, usePathname } from 'utils/paths';

interface PageTitleOwnProps {
  children?: React.ReactNode;
}

type PageTitleProps = PageTitleOwnProps & WrappedComponentProps;

const PageTitleBase: React.FC<PageTitleProps> = ({ children = null, intl }) => {
  const usePageTitle = () => {
    const pathname = usePathname();
    switch (pathname) {
      case formatPath(routePaths.awsBreakdown.path):
      case formatPath(routePaths.awsDetails.path):
        return messages.pageTitleAws;
      case formatPath(routePaths.azureBreakdown.path):
      case formatPath(routePaths.azureDetails.path):
        return messages.pageTitleAzure;
      case formatPath(routePaths.costModelBreakdown.basePath):
        return messages.pageTitleCostModels;
      case formatPath(routePaths.explorer.path):
        return messages.pageTitleExplorer;
      case formatPath(routePaths.gcpBreakdown.path):
      case formatPath(routePaths.gcpDetails.path):
        return messages.pageTitleGcp;
      case formatPath(routePaths.ocpBreakdown.path):
      case formatPath(routePaths.ocpDetails.path):
        return messages.pageTitleOcp;
      case formatPath(routePaths.optimizations.path):
      case formatPath(routePaths.optimizationsBreakdown.path):
        return messages.pageTitleOptimizations;
      case formatPath(routePaths.overview.path):
        return messages.pageTitleOverview;
      case formatPath(routePaths.priceListBreakdown.basePath):
      case formatPath(routePaths.priceListCreate.path):
        return messages.pageTitlePriceList;
      case formatPath(routePaths.settings.path):
        return messages.pageTitleSettings;
      default:
        return messages.pageTitleDefault;
    }
  };

  // Set page title
  document.title = intl.formatMessage(usePageTitle());

  return <>{children}</>;
};

const PageTitle = injectIntl(PageTitleBase);

export default PageTitle;
