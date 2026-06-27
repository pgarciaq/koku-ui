import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { Filter } from 'routes/utils/filter';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';

interface OptimizationsGpuTimeslicingToolbarOwnProps {
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

interface OptimizationsGpuTimeslicingToolbarState {
  categoryOptions?: ToolbarChipGroupExt[];
}

type OptimizationsGpuTimeslicingToolbarProps = OptimizationsGpuTimeslicingToolbarOwnProps & WrappedComponentProps;

class OptimizationsGpuTimeslicingToolbarBase extends React.Component<
  OptimizationsGpuTimeslicingToolbarProps,
  OptimizationsGpuTimeslicingToolbarState
> {
  protected defaultState: OptimizationsGpuTimeslicingToolbarState = {};
  public state: OptimizationsGpuTimeslicingToolbarState = { ...this.defaultState };

  public componentDidMount() {
    this.setState({
      categoryOptions: this.getCategoryOptions(),
    });
  }

  private getCategoryOptions = (): ToolbarChipGroupExt[] => {
    const { intl } = this.props;

    return [
      { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'node' }), key: 'node' },
    ];
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
        useActiveFilters
      />
    );
  }
}

const OptimizationsGpuTimeslicingToolbar = injectIntl(OptimizationsGpuTimeslicingToolbarBase);

export { OptimizationsGpuTimeslicingToolbar };
