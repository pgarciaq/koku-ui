import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { Filter } from 'routes/utils/filter';
import { Interval } from 'utils/commonTypes';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';

interface OptimizationsGpuMigToolbarOwnProps {
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsGpuMigToolbarState {
  categoryOptions?: ToolbarChipGroupExt[];
}

type OptimizationsGpuMigToolbarProps = OptimizationsGpuMigToolbarOwnProps & WrappedComponentProps;

class OptimizationsGpuMigToolbarBase extends React.Component<
  OptimizationsGpuMigToolbarProps,
  OptimizationsGpuMigToolbarState
> {
  protected defaultState: OptimizationsGpuMigToolbarState = {};
  public state: OptimizationsGpuMigToolbarState = { ...this.defaultState };

  public componentDidMount() {
    this.setState({
      categoryOptions: this.getCategoryOptions(),
    });
  }

  private getCategoryOptions = (): ToolbarChipGroupExt[] => {
    const { intl } = this.props;

    return [
      { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'project' }), key: 'project' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'workload' }), key: 'workload' },
      { name: intl.formatMessage(messages.filterByValues, { value: 'gpu_model' }), key: 'gpu_model' },
    ];
  };

  public render() {
    const {
      isDisabled,
      itemsPerPage,
      itemsTotal,
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
            isDisabled={isDisabled}
            onTermSelect={onTermSelect}
            showEngine={false}
            term={query?.term}
            termOptions={[
              { label: messages.optimizationsShortTerm, value: Interval.short_term },
              { label: messages.optimizationsMediumTerm, value: Interval.medium_term },
              { label: messages.optimizationsLongTerm, value: Interval.long_term },
            ]}
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

const OptimizationsGpuMigToolbar = injectIntl(OptimizationsGpuMigToolbarBase);

export { OptimizationsGpuMigToolbar };
