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
import { PerspectiveSelect } from 'routes/components/perspective/perspectiveSelect';
import type { Filter } from 'routes/utils/filter';
import { createMapStateToProps } from 'store/common';
import type { RootState } from 'store/rootReducer';
import { tagActions, tagSelectors } from 'store/tags';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';
import type { HcpGroupBy } from './hcpTableUtils';

interface OptimizationsHcpToolbarOwnProps {
  groupBy?: HcpGroupBy;
  isClusterHidden?: boolean;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onEngineSelect?: (value: string) => void;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onGroupBySelect?: (value: HcpGroupBy) => void;
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsHcpToolbarStateProps {
  tagReport?: Tag;
}

interface OptimizationsHcpToolbarDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

interface OptimizationsHcpToolbarState {
  categoryOptions?: ToolbarLabelGroup[];
}

type OptimizationsHcpToolbarProps = OptimizationsHcpToolbarOwnProps &
  OptimizationsHcpToolbarStateProps &
  OptimizationsHcpToolbarDispatchProps &
  WrappedComponentProps;

const tagPathsType = TagPathsType.ocp;
const tagType = TagType.tag;

class OptimizationsHcpToolbarBase extends React.Component<OptimizationsHcpToolbarProps, OptimizationsHcpToolbarState> {
  protected defaultState: OptimizationsHcpToolbarState = {};
  public state: OptimizationsHcpToolbarState = { ...this.defaultState };

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
    const { intl, isClusterHidden } = this.props;

    const options = [
      { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'project' }), key: 'project' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'hosted_cluster_id' }), key: 'hosted_cluster_id' },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'tag' }),
        key: 'tag',
      },
    ];
    return isClusterHidden ? options.filter(option => option.key !== 'cluster') : options;
  };

  private getGroupByOptions = () => {
    const { intl } = this.props;
    return [
      { label: intl.formatMessage(messages.hcpGroupByNone), value: '' },
      { label: intl.formatMessage(messages.hcpGroupByHostedCluster), value: 'hosted_cluster_id' },
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
            <PerspectiveSelect
              currentItem={groupBy ?? ''}
              onSelect={onGroupBySelect}
              options={this.getGroupByOptions()}
              title={messages.hcpGroupBy}
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

const mapStateToProps = createMapStateToProps<OptimizationsHcpToolbarOwnProps, OptimizationsHcpToolbarStateProps>(
  (state: RootState) => {
    const tagQueryString = getQuery({ filter: { time_scope_value: -1 }, key_only: true, limit: 1000 });
    const tagReport = tagSelectors.selectTag(state, tagPathsType, tagType, tagQueryString);

    return {
      tagReport,
    };
  }
);

const mapDispatchToProps: OptimizationsHcpToolbarDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const OptimizationsHcpToolbar = injectIntl(connect(mapStateToProps, mapDispatchToProps)(OptimizationsHcpToolbarBase));

export { OptimizationsHcpToolbar };
