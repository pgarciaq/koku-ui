import type { ToolbarLabelGroup } from '@patternfly/react-core';
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
import type { Filter } from 'routes/utils/filter';
import { createMapStateToProps } from 'store/common';
import type { RootState } from 'store/rootReducer';
import { tagActions, tagSelectors } from 'store/tags';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';

interface OptimizationsContainersToolbarOwnProps {
  isClusterHidden?: boolean;
  isDisabled?: boolean;
  isProjectHidden?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onEngineSelect?: (value: string) => void;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsContainersToolbarStateProps {
  tagReport?: Tag;
}

interface OptimizationsContainersToolbarDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

interface OptimizationsContainersToolbarState {
  categoryOptions?: ToolbarLabelGroup[];
}

type OptimizationsContainersToolbarProps = OptimizationsContainersToolbarOwnProps &
  OptimizationsContainersToolbarStateProps &
  OptimizationsContainersToolbarDispatchProps &
  WrappedComponentProps;

const tagPathsType = TagPathsType.ocp;
const tagType = TagType.tag;

class OptimizationsContainersToolbarBase extends React.Component<
  OptimizationsContainersToolbarProps,
  OptimizationsContainersToolbarState
> {
  protected defaultState: OptimizationsContainersToolbarState = {};
  public state: OptimizationsContainersToolbarState = { ...this.defaultState };

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

  private getCategoryOptions = (): ToolbarLabelGroup[] => {
    const { intl, isClusterHidden, isProjectHidden } = this.props;

    const options = [
      { name: intl.formatMessage(messages.filterByValues, { value: 'container' }), key: 'container' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'project' }), key: 'project' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'workload' }), key: 'workload' },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'workload_type' }),
        key: 'workload_type',
        selectClassName: 'selectOverride',
        selectOptions: [
          { name: 'daemonset', key: 'daemonset' },
          { name: 'deployment', key: 'deployment' },
          { name: 'deploymentconfig', key: 'deploymentconfig' },
          { name: 'replicaset', key: 'replicaset' },
          { name: 'replicationcontroller', key: 'replicationcontroller' },
          { name: 'statefulset', key: 'statefulset' },
        ],
      },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'idle_state' }),
        key: 'idle_state',
        selectClassName: 'selectOverride',
        selectOptions: [
          { name: intl.formatMessage(messages.idleStateActive), key: 'active' },
          { name: intl.formatMessage(messages.idleStateIdle), key: 'idle' },
          { name: intl.formatMessage(messages.idleStateZombie), key: 'zombie' },
        ],
      },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'tag' }),
        key: 'tag',
      },
    ];
    const filteredOptions = isClusterHidden ? options.filter(option => option.key !== 'cluster') : options;
    return isProjectHidden ? filteredOptions.filter(option => option.key !== 'project') : filteredOptions;
  };

  public render() {
    const {
      isDisabled,
      itemsPerPage,
      itemsTotal,
      onEngineSelect,
      onFilterAdded,
      onFilterRemoved,
      onTermSelect,
      pagination,
      query,
      tagReport,
    } = this.props;
    const { categoryOptions } = this.state;

    return (
      <BasicToolbar
        actions={
          <OptimizationsProjectionToolbar
            engine={query?.engine}
            isDisabled={isDisabled}
            onEngineSelect={onEngineSelect}
            onTermSelect={onTermSelect}
            term={query?.term}
          />
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

const mapStateToProps = createMapStateToProps<OptimizationsContainersToolbarOwnProps, OptimizationsContainersToolbarStateProps>(
  (state: RootState) => {
    const tagQueryString = getQuery({ filter: { time_scope_value: -1 }, key_only: true, limit: 1000 });
    const tagReport = tagSelectors.selectTag(state, tagPathsType, tagType, tagQueryString);

    return {
      tagReport,
    };
  }
);

const mapDispatchToProps: OptimizationsContainersToolbarDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const OptimizationsContainersToolbar = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(OptimizationsContainersToolbarBase)
);

export { OptimizationsContainersToolbar };
