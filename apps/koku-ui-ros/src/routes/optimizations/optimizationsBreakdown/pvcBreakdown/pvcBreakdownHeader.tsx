import { Content, ContentVariants, Label, Title, TitleSizes } from '@patternfly/react-core';
import type { PvcRecommendationDetailResponse } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { formatStorageBytes, formatUsageRatio } from 'routes/optimizations/optimizationsTable/storageTableUtils';
import { getTimeFromNow } from 'utils/dates';
import { getPvcRecommendationId } from 'utils/recommendationIds';

import { RecommendationIdMetadata } from '../RecommendationIdMetadata';

import { styles } from '../optimizationsBreakdownHeader.styles';

interface PvcBreakdownHeaderOwnProps {
  activeTermKey: string;
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  detail?: PvcRecommendationDetailResponse;
  linkState?: any;
  termRec?: PvcRecommendationDetailResponse['terms'][string];
}

const getClassificationBadge = (type: string | undefined, intl: ReturnType<typeof useIntl>) => {
  switch (type) {
    case 'oversized':
      return (
        <Label color="orange" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.pvcClassificationOversized)}
        </Label>
      );
    case 'near_full':
      return (
        <Label color="red" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.pvcClassificationNearFull)}
        </Label>
      );
    case 'orphaned':
      return (
        <Label color="grey" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.pvcClassificationOrphaned)}
        </Label>
      );
    case 'healthy':
      return (
        <Label color="green" isCompact style={{ marginLeft: 8 }}>
          {intl.formatMessage(messages.pvcClassificationHealthy)}
        </Label>
      );
    default:
      return null;
  }
};

const PvcBreakdownHeader: React.FC<PvcBreakdownHeaderOwnProps> = ({
  activeTermKey,
  breadcrumbLabel,
  breadcrumbPath,
  detail,
  linkState,
  termRec,
}) => {
  const intl = useIntl();

  const recommendationId =
    detail?.id ??
    (detail?.cluster_uuid && detail?.namespace && detail?.persistentvolumeclaim
      ? getPvcRecommendationId(detail.cluster_uuid, detail.namespace, detail.persistentvolumeclaim)
      : undefined);

  return (
    <header>
      <Link to={breadcrumbPath} state={{ ...linkState }}>
        {breadcrumbLabel ?? intl.formatMessage(messages.breakdownBackToOptimizations)}
      </Link>
      <div style={styles.title}>
        <Title headingLevel="h1" size={TitleSizes['2xl']}>
          {detail?.persistentvolumeclaim ?? ''}
        </Title>
        {getClassificationBadge(termRec?.recommendation_type, intl)}
      </div>
      <div style={styles.description}>
        <Content>
          <Content component={ContentVariants.dl}>
            <RecommendationIdMetadata recommendationId={recommendationId} />
            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'project' })}
            </Content>
            <Content component={ContentVariants.dd}>{detail?.namespace ?? '—'}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}
            </Content>
            <Content component={ContentVariants.dd}>{detail?.cluster_uuid ?? '—'}</Content>

            {detail?.storageclass && (
              <>
                <Content component={ContentVariants.dt}>
                  {intl.formatMessage(messages.optimizationsNames, { value: 'storage_class' })}
                </Content>
                <Content component={ContentVariants.dd}>{detail.storageclass}</Content>
              </>
            )}

            {detail?.mounted_by && (
              <>
                <Content component={ContentVariants.dt}>{intl.formatMessage(messages.pvcMountedBy)}</Content>
                <Content component={ContentVariants.dd}>{detail.mounted_by}</Content>
              </>
            )}

            {detail?.vm_name && (
              <>
                <Content component={ContentVariants.dt}>{intl.formatMessage(messages.pvcVmName)}</Content>
                <Content component={ContentVariants.dd}>{detail.vm_name}</Content>
              </>
            )}

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.pvcCapacity)}</Content>
            <Content component={ContentVariants.dd}>{formatStorageBytes(detail?.capacity_bytes)}</Content>

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.pvcUsagePercent)}</Content>
            <Content component={ContentVariants.dd}>{formatUsageRatio(termRec?.usage_ratio)}</Content>

            {termRec?.recommended_bytes != null && (
              <>
                <Content component={ContentVariants.dt}>{intl.formatMessage(messages.recommended)}</Content>
                <Content component={ContentVariants.dd}>{formatStorageBytes(termRec.recommended_bytes)}</Content>
              </>
            )}

            <Content component={ContentVariants.dt}>{intl.formatMessage(messages.pvcActiveTerm)}</Content>
            <Content component={ContentVariants.dd}>{activeTermKey}</Content>

            <Content component={ContentVariants.dt}>
              {intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}
            </Content>
            <Content component={ContentVariants.dd}>
              {termRec?.last_reported ? getTimeFromNow(termRec.last_reported) : '—'}
            </Content>
          </Content>
        </Content>
      </div>
    </header>
  );
};

export { PvcBreakdownHeader };
