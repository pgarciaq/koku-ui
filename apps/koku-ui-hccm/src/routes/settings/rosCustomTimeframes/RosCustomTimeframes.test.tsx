import { fireEvent, render, screen } from '@testing-library/react';
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

  it('shows business hours fields when toggle is on', () => {
    render(<RosCustomTimeframes />);
    const toggle = screen.getByRole('checkbox', { name: /restrict analysis to business hours/i });
    fireEvent.click(toggle);
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
  });

  it('shows validation error when terms are not in ascending order', () => {
    render(<RosCustomTimeframes />);
    const term1 = screen.getByLabelText(/term 1/i);
    const term2 = screen.getByLabelText(/term 2/i);
    fireEvent.change(term1, { target: { value: '30' } });
    fireEvent.change(term2, { target: { value: '10' } });
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    expect(screen.getByText(/must be ordered/i)).toBeInTheDocument();
  });

  it('resets all fields to defaults when Reset button is clicked', () => {
    render(<RosCustomTimeframes />);
    const term1 = screen.getByLabelText(/term 1/i);
    fireEvent.change(term1, { target: { value: '42' } });
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    fireEvent.click(resetButton);
    expect(term1).toHaveValue(1);
  });
});
