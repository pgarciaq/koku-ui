import { getQuery } from 'api/queries/query';
import type { RosQuery } from 'api/queries/rosQuery';
import type { Tag } from 'api/tags/tag';
import { TagPathsType, TagType } from 'api/tags/tag';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { Filter } from 'routes/utils/filter';
import { createMapStateToProps } from 'store/common';
import type { RootState } from 'store/rootReducer';
import { tagActions, tagSelectors } from 'store/tags';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';
import { OptimizationsStorageGroupByToolbar } from '../optimizationsStorageGroupByToolbar';
import type { StorageGroupBy } from '../storageTableUtils';

interface OptimizationsNodesToolbarOwnProps {
  groupBy?: StorageGroupBy;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onEngineSelect?: (value: string) => void;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onGroupBySelect?: (value: StorageGroupBy) => void;
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsNodesToolbarStateProps {
  tagReport?: Tag;
}

interface OptimizationsNodesToolbarDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

interface OptimizationsNodesToolbarState {
  categoryOptions?: ToolbarChipGroupExt[];
}

type OptimizationsNodesToolbarProps = OptimizationsNodesToolbarOwnProps &
  OptimizationsNodesToolbarStateProps &
  OptimizationsNodesToolbarDispatchProps &
  WrappedComponentProps;

const tagPathsType = TagPathsType.ocp;
const tagType = TagType.tag;

class OptimizationsNodesToolbarBase extends React.Component<
  OptimizationsNodesToolbarProps,
  OptimizationsNodesToolbarState
> {
  protected defaultState: OptimizationsNodesToolbarState = {};
  public state: OptimizationsNodesToolbarState = { ...this.defaultState };

  public componentDidMount() {
    this.setState({
      categoryOptions: this.getCategoryOptions(),
    });
    this.updateReport();
  }

  private updateReport = () => {
    const { fetchTag } = this.props;
    const tagQueryString = getQuery({ filter: { time_scope_value: -1 }, key_only: true, limit: 1000 });
    fetchTag(tagPathsType, tagType, tagQueryString);
  };

  private getCategoryOptions = (): ToolbarChipGroupExt[] => {
    const { intl } = this.props;

    return [
      { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'node' }), key: 'node' },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'classification' }),
        key: 'classification',
        selectClassName: 'selectOverride',
        selectOptions: [
          { name: intl.formatMessage(messages.nodeClassificationUnderutilized), key: 'underutilized' },
          { name: intl.formatMessage(messages.nodeClassificationOvercommitted), key: 'overcommitted' },
          { name: intl.formatMessage(messages.nodeClassificationIdle), key: 'idle' },
          { name: intl.formatMessage(messages.nodeClassificationStrandedCpu), key: 'stranded_cpu' },
          { name: intl.formatMessage(messages.nodeClassificationStrandedMemory), key: 'stranded_memory' },
          { name: intl.formatMessage(messages.nodeClassificationWellUtilized), key: 'well_utilized' },
        ],
      },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'tag' }),
        key: 'tag',
      },
    ];
  };

  public render() {
    const {
      groupBy,
      isDisabled,
      itemsPerPage,
      itemsTotal,
      onEngineSelect,
      onFilterAdded,
      onFilterRemoved,
      onGroupBySelect,
      onTermSelect,
      pagination,
      query,
      tagReport,
    } = this.props;
    const { categoryOptions } = this.state;

    return (
      <BasicToolbar
        actions={
          <>
            <OptimizationsStorageGroupByToolbar
              groupBy={groupBy}
              isDisabled={isDisabled}
              onGroupBySelect={onGroupBySelect}
              projectGroupByDisabled
            />
            <OptimizationsProjectionToolbar
              engine={query?.engine}
              isDisabled={isDisabled}
              onEngineSelect={onEngineSelect}
              onTermSelect={onTermSelect}
              term={query?.term}
            />
          </>
        }
        categoryOptions={categoryOptions}
        isDisabled={isDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onFilterAdded={onFilterAdded}
        onFilterRemoved={onFilterRemoved}
        pagination={pagination}
        query={query}
        showFilter
        tagPathsType={tagPathsType}
        tagReport={tagReport}
        useActiveFilters
      />
    );
  }
}

const mapStateToProps = createMapStateToProps<OptimizationsNodesToolbarOwnProps, OptimizationsNodesToolbarStateProps>(
  (state: RootState) => {
    const tagQueryString = getQuery({ filter: { time_scope_value: -1 }, key_only: true, limit: 1000 });
    const tagReport = tagSelectors.selectTag(state, tagPathsType, tagType, tagQueryString);

    return {
      tagReport,
    };
  }
);

const mapDispatchToProps: OptimizationsNodesToolbarDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const OptimizationsNodesToolbar = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(OptimizationsNodesToolbarBase)
);

export { OptimizationsNodesToolbar };
