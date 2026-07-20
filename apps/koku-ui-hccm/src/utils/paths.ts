import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';

// Prefixes the given path with a basename
//
// Note the basename does not include a release prefix (/beta, /preview, etc.), unlike the getBaseName function from
// @redhat-cloud-services/frontend-components-utilities/helpers
export const formatPath = (path, isReleasePath = false) => {
  const basename = '/openshift/cost-management';
  const newPath = path === routePaths.overview.path ? basename : `${basename}${path}`;
  return isReleasePath ? `${getReleasePath()}${newPath}` : newPath;
};

export const getReleasePath = () => {
  const pathName = window.location.pathname.split('/');
  pathName.shift();

  let release = '';
  if (pathName[0] === 'beta') {
    release = `/beta`;
  }
  if (pathName[0] === 'preview') {
    release = `/preview`;
  }
  return release;
};

export const usePathname = () => {
  const location = useLocation();

  // Cost models and price lists may include UUID in path
  const costModelCreatePath = formatPath(routePaths.costModelCreate.path);
  const costModelPath = formatPath(routePaths.costModelBreakdown.basePath);

  const priceListCreatePath = formatPath(routePaths.priceListCreate.path);
  const priceListPath = formatPath(routePaths.priceListBreakdown.basePath);

  if (location.pathname.startsWith(costModelCreatePath)) {
    return costModelCreatePath;
  } else if (location.pathname.startsWith(costModelPath)) {
    return costModelPath;
  } else if (location.pathname.startsWith(priceListCreatePath)) {
    return priceListCreatePath;
  } else if (location.pathname.startsWith(priceListPath)) {
    return priceListPath;
  } else {
    return location.pathname.replace(/\/$/, '');
  }
};
