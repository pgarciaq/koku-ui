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

interface OptimizationsNamespacesToolbarOwnProps {
  isClusterHidden?: boolean;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onEngineSelect?: (value: string) => void;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsNamespacesToolbarStateProps {
  tagReport?: Tag;
}

interface OptimizationsNamespacesToolbarDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

interface OptimizationsNamespacesToolbarState {
  categoryOptions?: ToolbarLabelGroup[];
}

type OptimizationsNamespacesToolbarProps = OptimizationsNamespacesToolbarOwnProps &
  OptimizationsNamespacesToolbarStateProps &
  OptimizationsNamespacesToolbarDispatchProps &
  WrappedComponentProps;

const tagPathsType = TagPathsType.ocp;
const tagType = TagType.tag;

class OptimizationsNamespacesToolbarBase extends React.Component<
  OptimizationsNamespacesToolbarProps,
  OptimizationsNamespacesToolbarState
> {
  protected defaultState: OptimizationsNamespacesToolbarState = {};
  public state: OptimizationsNamespacesToolbarState = { ...this.defaultState };

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
    return isClusterHidden ? options.filter(option => option.key !== 'cluster') : options;
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

const mapStateToProps = createMapStateToProps<OptimizationsNamespacesToolbarOwnProps, OptimizationsNamespacesToolbarStateProps>(
  (state: RootState) => {
    const tagQueryString = getQuery({ filter: { time_scope_value: -1 }, key_only: true, limit: 1000 });
    const tagReport = tagSelectors.selectTag(state, tagPathsType, tagType, tagQueryString);

    return {
      tagReport,
    };
  }
);

const mapDispatchToProps: OptimizationsNamespacesToolbarDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const OptimizationsNamespacesToolbar = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(OptimizationsNamespacesToolbarBase)
);

export { OptimizationsNamespacesToolbar };
