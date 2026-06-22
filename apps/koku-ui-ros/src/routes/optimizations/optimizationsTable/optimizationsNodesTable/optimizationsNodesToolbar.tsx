import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { Filter } from 'routes/utils/filter';

interface OptimizationsNodesToolbarOwnProps {
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  pagination?: React.ReactNode;
  query?: RosQuery;
}

interface OptimizationsNodesToolbarState {
  categoryOptions?: ToolbarChipGroupExt[];
}

type OptimizationsNodesToolbarProps = OptimizationsNodesToolbarOwnProps & WrappedComponentProps;

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
  }

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
    ];
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

const OptimizationsNodesToolbar = injectIntl(OptimizationsNodesToolbarBase);

export { OptimizationsNodesToolbar };
