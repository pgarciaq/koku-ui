import type { ToolbarLabelGroup } from '@patternfly/react-core';
import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { Filter } from 'routes/utils/filter';

interface OptimizationsNamespacesToolbarOwnProps {
  isClusterHidden?: boolean;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsNamespacesToolbarState {
  categoryOptions?: ToolbarLabelGroup[];
}

type OptimizationsNamespacesToolbarProps = OptimizationsNamespacesToolbarOwnProps & WrappedComponentProps;

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
  }

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
        placeholderKey: 'tag_key_value',
      },
    ];
    return isClusterHidden ? options.filter(option => option.key !== 'cluster') : options;
  };

  public render() {
    const { isDisabled, itemsPerPage, itemsTotal, onFilterAdded, onFilterRemoved, pagination, query } = this.props;
    const { categoryOptions } = this.state;

    return (
      <BasicToolbar
        categoryOptions={categoryOptions}
        isDisabled={isDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onFilterAdded={onFilterAdded}
        onFilterRemoved={onFilterRemoved}
        pagination={pagination}
        query={query}
        showFilter
        useActiveFilters
      />
    );
  }
}

const OptimizationsNamespacesToolbar = injectIntl(OptimizationsNamespacesToolbarBase);

export { OptimizationsNamespacesToolbar };
