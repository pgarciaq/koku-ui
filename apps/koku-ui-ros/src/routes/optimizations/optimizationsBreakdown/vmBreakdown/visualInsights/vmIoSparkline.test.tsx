import { render, screen } from '@testing-library/react';
import type { VmDailyDigestItem } from 'api/ros/recommendations';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { VmIoSparkline } from './vmIoSparkline';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const makeDailyDigest = (overrides?: Partial<VmDailyDigestItem>): VmDailyDigestItem => ({
  bucket_date: '2026-06-01',
  cpu_usage_p95_mc: 500,
  mem_usage_p95_kib: 1024,
  sample_count: 24,
  ...overrides,
});

describe('VmIoSparkline', () => {
  it('renders empty state when dailyDigests is undefined', () => {
    render(<VmIoSparkline dailyDigests={undefined} />, { wrapper });
    expect(screen.getByText('No I/O data available for this period')).toBeTruthy();
  });

  it('renders empty state when dailyDigests is empty', () => {
    render(<VmIoSparkline dailyDigests={[]} />, { wrapper });
    expect(screen.getByText('No I/O data available for this period')).toBeTruthy();
  });

  it('renders empty state when all I/O values are null', () => {
    const digests = [
      makeDailyDigest({ bucket_date: '2026-06-01', disk_read_iops_p95: null, disk_write_iops_p95: null }),
      makeDailyDigest({ bucket_date: '2026-06-02', disk_read_bps_p95: null, disk_write_bps_p95: null }),
    ];
    render(<VmIoSparkline dailyDigests={digests} />, { wrapper });
    expect(screen.getByText('No I/O data available for this period')).toBeTruthy();
  });

  it('renders empty state when all I/O values are zero', () => {
    const digests = [
      makeDailyDigest({
        bucket_date: '2026-06-01',
        disk_read_iops_p95: 0,
        disk_write_iops_p95: 0,
        disk_read_bps_p95: 0,
        disk_write_bps_p95: 0,
      }),
    ];
    render(<VmIoSparkline dailyDigests={digests} />, { wrapper });
    expect(screen.getByText('No I/O data available for this period')).toBeTruthy();
  });

  it('renders charts when I/O data is present', () => {
    const digests = [
      makeDailyDigest({
        bucket_date: '2026-06-01',
        disk_read_iops_p95: 150,
        disk_write_iops_p95: 80,
        disk_read_bps_p95: 52428800,
        disk_write_bps_p95: 26214400,
      }),
      makeDailyDigest({
        bucket_date: '2026-06-02',
        disk_read_iops_p95: 200,
        disk_write_iops_p95: 100,
        disk_read_bps_p95: 62914560,
        disk_write_bps_p95: 31457280,
      }),
    ];
    const { container } = render(<VmIoSparkline dailyDigests={digests} />, { wrapper });
    expect(screen.queryByText('No I/O data available for this period')).toBeNull();
    expect(screen.getByText('IOPS (p95)')).toBeTruthy();
    expect(screen.getByText('Throughput (p95)')).toBeTruthy();
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
