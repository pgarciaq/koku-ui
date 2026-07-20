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
      case formatPath(routePaths.ocpOptimizations.path):
      case formatPath(routePaths.ocpOptimizationsBreakdown.path):
      case formatPath(routePaths.optimizationsBadge.path):
      case formatPath(routePaths.optimizationsContainersTable.path):
      case formatPath(routePaths.optimizationsDetails.path):
      case formatPath(routePaths.optimizationsDetailsBreakdown.path):
      case formatPath(routePaths.optimizationsLink.path):
      case formatPath(routePaths.optimizationsProjectsTable.path):
      case formatPath(routePaths.optimizationsSummary.path):
      case formatPath(routePaths.welcome.path):
        return messages.pageTitleOptimizations;
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
