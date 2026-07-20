import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import React from 'react';
import { Link } from 'react-router-dom';

export interface OptimizationsLinkOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
  linkPath?: string; // Path used by the link displayed in each table row
  linkState?: any; // Link state used by the link displayed in each table row
  project?: string | string[]; // Project name to filter by
}

export interface OptimizationsLinkStateProps {
  count: number;
}

type OptimizationsLinkProps = OptimizationsLinkOwnProps & OptimizationsLinkStateProps;

const reportPathsType = RosPathsType.recommendations;
const reportType = RosType.ros;

const OptimizationsLink: React.FC<OptimizationsLinkProps> = ({
  cluster,
  linkPath,
  linkState,
  project,
}: OptimizationsLinkOwnProps) => {
  const { count } = useMapToProps({ cluster, project });

  if (count === 0) {
    return count;
  }
  return (
    <Link
      to={linkPath}
      state={{
        ...(linkState && linkState),
      }}
    >
      {count}
    </Link>
  );
};

const useMapToProps = ({ cluster, project }: OptimizationsLinkOwnProps): OptimizationsLinkStateProps => {
  const { count } = useRosCount({
    cluster,
    project,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsLink;
