import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RosCustomTimeframes from './RosCustomTimeframes';

describe('RosCustomTimeframes Settings', () => {
  it('renders three term input fields with default placeholders', () => {
    render(<RosCustomTimeframes />);
    expect(screen.getByLabelText(/term 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/term 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/term 3/i)).toBeInTheDocument();
  });

  it('disables Term 2 until Term 1 is configured', () => {
    render(<RosCustomTimeframes />);
    const term2 = screen.getByLabelText(/term 2/i);
    expect(term2).toBeDisabled();
  });

  it('disables Term 3 until Term 2 is configured', () => {
    render(<RosCustomTimeframes />);
    const term3 = screen.getByLabelText(/term 3/i);
    expect(term3).toBeDisabled();
  });

  it('hides business hours fields when toggle is off', () => {
    render(<RosCustomTimeframes />);
    expect(screen.queryByLabelText(/start time/i)).not.toBeInTheDocument();
  });

  it('shows business hours fields when toggle is on', async () => {
    render(<RosCustomTimeframes />);
    const toggle = screen.getByRole('checkbox', { name: /restrict analysis to business hours/i });
    await userEvent.click(toggle);
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
  });

  it('shows validation error when terms are not in ascending order', async () => {
    render(<RosCustomTimeframes />);
    const term1 = screen.getByLabelText(/term 1/i);
    const term2 = screen.getByLabelText(/term 2/i);
    await userEvent.clear(term1);
    await userEvent.type(term1, '30');
    await userEvent.clear(term2);
    await userEvent.type(term2, '10');
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);
    expect(screen.getByText(/must be ordered/i)).toBeInTheDocument();
  });

  it('resets all fields to defaults when Reset button is clicked', async () => {
    render(<RosCustomTimeframes />);
    const term1 = screen.getByLabelText(/term 1/i);
    await userEvent.clear(term1);
    await userEvent.type(term1, '42');
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    await userEvent.click(resetButton);
    expect(term1).toHaveValue(1);
  });
});
