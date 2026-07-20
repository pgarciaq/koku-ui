import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Popover,
  Skeleton,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { skeletonWidth } from 'routes/utils/skeleton';
import { FetchStatus } from 'store/common';

import { styles } from './optimizations.styles';

export interface OptimizationsSummaryOwnProps {
  linkPath?: string; // Path used by the link displayed in each table row
  linkState?: any; // Link state used by the link displayed in each table row
}

export interface OptimizationsSummaryStateProps {
  count: number;
  reportFetchStatus?: FetchStatus;
}

type OptimizationsSummaryProps = OptimizationsSummaryOwnProps & OptimizationsSummaryStateProps;

const reportPathsType = RosPathsType.recommendations;
const reportType = RosType.ros;

const OptimizationsSummary: React.FC<OptimizationsSummaryProps> = ({
  linkPath,
  linkState,
}: OptimizationsSummaryOwnProps) => {
  const intl = useIntl();
  const { count, reportFetchStatus } = useMapToProps();
  const description = intl.formatMessage(messages.optimizationsDetails, { count });

  return (
    <Card className="summary">
      <CardTitle>
        <Title headingLevel="h2" size={TitleSizes.lg}>
          {intl.formatMessage(messages.optimizations)}
          <span style={styles.infoIcon}>
            <Popover
              aria-label={intl.formatMessage(messages.optimizationsInfoArialLabel)}
              enableFlip
              bodyContent={
                <>
                  <p>{intl.formatMessage(messages.optimizationsInfoTitle)}</p>
                  <br />
                  <p>
                    {intl.formatMessage(messages.optimizationsInfoDesc, {
                      learnMore: (
                        <a href={intl.formatMessage(messages.docsOptimizations)} rel="noreferrer" target="_blank">
                          {intl.formatMessage(messages.learnMore)}
                        </a>
                      ),
                    })}
                  </p>
                </>
              }
            >
              <Button
                icon={<OutlinedQuestionCircleIcon />}
                aria-label={intl.formatMessage(messages.optimizationsInfoButtonArialLabel)}
                variant={ButtonVariant.plain}
              />
            </Popover>
          </span>
        </Title>
      </CardTitle>
      <CardBody>
        {reportFetchStatus === FetchStatus.inProgress ? (
          <>
            <Skeleton width="16%" />
            <Skeleton className="skeleton" width={skeletonWidth.md} />
          </>
        ) : linkPath && count > 0 ? (
          <Link to={linkPath} state={{ ...linkState }}>
            {description}
          </Link>
        ) : (
          description
        )}
      </CardBody>
    </Card>
  );
};

const useMapToProps = (): OptimizationsSummaryStateProps => {
  const { count, fetchStatus } = useRosCount({
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return {
    count,
    reportFetchStatus: fetchStatus,
  };
};

export { OptimizationsSummary };
