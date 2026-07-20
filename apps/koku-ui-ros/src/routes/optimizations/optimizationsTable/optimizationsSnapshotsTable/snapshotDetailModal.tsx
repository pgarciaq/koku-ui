import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import type { SnapshotRecommendationData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { formatMoneyCell, formatStorageBytes } from 'routes/optimizations/optimizationsTable/storageTableUtils';
import { getTimeFromNow } from 'utils/dates';
import { getSnapshotRecommendationId } from 'utils/recommendationIds';

import { RecommendationIdMetadata } from '../../optimizationsBreakdown/RecommendationIdMetadata';

interface SnapshotDetailModalOwnProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSourcePvc?: (item: SnapshotRecommendationData) => void;
  snapshot?: SnapshotRecommendationData;
}

const SnapshotDetailModal: React.FC<SnapshotDetailModalOwnProps> = ({
  isOpen,
  onClose,
  onNavigateToSourcePvc,
  snapshot,
}) => {
  const intl = useIntl();

  if (!snapshot) {
    return null;
  }

  const waste = formatMoneyCell(snapshot.estimated_monthly_cost);
  const notifications = snapshot.notifications ? Object.values(snapshot.notifications) : [];
  const recommendationId =
    snapshot.id ??
    (snapshot.cluster_uuid && snapshot.namespace && snapshot.snapshot_name
      ? getSnapshotRecommendationId(snapshot.cluster_uuid, snapshot.namespace, snapshot.snapshot_name)
      : undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="medium">
      <ModalHeader title={snapshot.snapshot_name ?? intl.formatMessage(messages.snapshotDetailTitle)} />
      <ModalBody>
        {!snapshot.source_pvc_exists && (
          <Alert
            isInline
            style={{ marginBottom: 16 }}
            title={intl.formatMessage(messages.snapshotSourcePvcMissing)}
            variant="warning"
          />
        )}
        <DescriptionList
          isCompact
          isHorizontal
          horizontalTermWidthModifier={{ default: '16rem', sm: '16rem', md: '16rem' }}
        >
          <RecommendationIdMetadata recommendationId={recommendationId} variant="descriptionList" />
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.optimizationsValues, { value: 'project' })}</DescriptionListTerm>
            <DescriptionListDescription>{snapshot.namespace ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.optimizationsValues, { value: 'cluster' })}</DescriptionListTerm>
            <DescriptionListDescription>{snapshot.cluster_uuid ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.sourcePvc)}</DescriptionListTerm>
            <DescriptionListDescription>{snapshot.source_pvc_name ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.snapshotAgeDays)}</DescriptionListTerm>
            <DescriptionListDescription>{snapshot.age_days ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.pvcCapacity)}</DescriptionListTerm>
            <DescriptionListDescription>{formatStorageBytes(snapshot.restore_size_bytes)}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.monthlyHoldingCost)}</DescriptionListTerm>
            <DescriptionListDescription>{waste ?? '—'}</DescriptionListDescription>
          </DescriptionListGroup>
          {snapshot.managed_by && (
            <DescriptionListGroup>
              <DescriptionListTerm>{intl.formatMessage(messages.snapshotManagedBy)}</DescriptionListTerm>
              <DescriptionListDescription>{snapshot.managed_by}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{intl.formatMessage(messages.optimizationsValues, { value: 'last_reported' })}</DescriptionListTerm>
            <DescriptionListDescription>
              {snapshot.last_reported ? getTimeFromNow(snapshot.last_reported) : '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
        {notifications.length > 0 && (
          <Alert isInline style={{ marginTop: 16 }} title={intl.formatMessage(messages.notificationsAlertTitle)} variant="warning">
            <List>
              {notifications.map((notification: any, index) => (
                <ListItem key={index}>{notification.message}</ListItem>
              ))}
            </List>
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        {snapshot.source_pvc_name && onNavigateToSourcePvc && (
          <Button
            onClick={() => {
              onNavigateToSourcePvc(snapshot);
              onClose();
            }}
            variant="link"
          >
            {intl.formatMessage(messages.snapshotViewSourcePvc)}
          </Button>
        )}
        <Button onClick={onClose} variant="primary">
          {intl.formatMessage(messages.modalClose)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { SnapshotDetailModal };
