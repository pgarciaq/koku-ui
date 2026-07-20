import type { MessageDescriptor } from '@formatjs/intl';
import { Title } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import type { SelectWrapperOption } from 'routes/components/selectWrapper';
import { SelectWrapper } from 'routes/components/selectWrapper';

import { styles } from './perspective.styles';

export type PerspectiveSelectOptionLabel = MessageDescriptor | string;

interface PerspectiveSelectOwnProps {
  currentItem: string;
  isDisabled?: boolean;
  onSelect(value: string);
  options?: {
    isDisabled?: boolean;
    label: PerspectiveSelectOptionLabel;
    value: string;
  }[];
  title?: MessageDescriptor;
}

function formatPerspectiveOptionLabel(
  intl: WrappedComponentProps['intl'],
  label: PerspectiveSelectOptionLabel,
  value: string
): string {
  return typeof label === 'string' ? label : intl.formatMessage(label, { value });
}

interface PerspectiveSelectState {
  // TBD...
}

type PerspectiveSelectProps = PerspectiveSelectOwnProps & WrappedComponentProps;

class PerspectiveSelectBase extends React.Component<PerspectiveSelectProps, PerspectiveSelectState> {
  protected defaultState: PerspectiveSelectState = {
    // TBD...
  };
  public state: PerspectiveSelectState = { ...this.defaultState };

  private getSelectOptions = (): SelectWrapperOption[] => {
    const { intl, options } = this.props;

    const selections: SelectWrapperOption[] = [];

    options.map(option => {
      selections.push({
        isDisabled: option.isDisabled,
        toString: () => formatPerspectiveOptionLabel(intl, option.label, option.value),
        value: option.value,
      });
    });
    return selections;
  };

  private getSelect = () => {
    const { currentItem, intl, isDisabled, options } = this.props;

    if (options.length === 1) {
      return (
        <div style={styles.perspectiveOptionLabel}>
          {formatPerspectiveOptionLabel(intl, options[0].label, options[0].value)}
        </div>
      );
    }

    const selectOptions = this.getSelectOptions();
    const selection = selectOptions.find(option => option.value === currentItem);

    return (
      <SelectWrapper
        id="perspective-select"
        isDisabled={isDisabled}
        onSelect={this.handleOnSelect}
        options={selectOptions}
        selection={selection}
        toggleIcon={<FilterIcon />}
      />
    );
  };

  private handleOnSelect = (_evt, selection: SelectWrapperOption) => {
    const { onSelect } = this.props;

    if (onSelect) {
      onSelect(selection.value);
    }
  };

  public render() {
    const { intl, title } = this.props;

    return (
      <div style={styles.perspectiveSelector}>
        <Title headingLevel="h3" size="md" style={styles.perspectiveLabel}>
          {intl.formatMessage(title || messages.perspective)}
        </Title>
        {this.getSelect()}
      </div>
    );
  }
}

const PerspectiveSelect = injectIntl(PerspectiveSelectBase);

export { PerspectiveSelect };
