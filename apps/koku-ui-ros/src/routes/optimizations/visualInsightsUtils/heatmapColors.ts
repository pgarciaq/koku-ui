import type { CSSProperties } from 'react';

export type UtilizationBand = 'idle' | 'low' | 'moderate' | 'healthy' | 'hot';

export const bandColorTokens: Record<UtilizationBand, string> = {
  idle: 'var(--pf-t--global--color--nonstatus--gray--default)',
  low: 'var(--pf-t--global--color--status--info--default)',
  moderate: 'var(--pf-t--global--color--status--warning--default)',
  healthy: 'var(--pf-t--global--color--status--success--default)',
  hot: 'var(--pf-t--global--color--status--danger--default)',
};

export const bandTextColorTokens: Record<UtilizationBand, string> = {
  idle: 'var(--pf-t--global--text--color--on-nonstatus--gray--default)',
  low: 'var(--pf-t--global--text--color--status--on-info--default)',
  moderate: 'var(--pf-t--global--text--color--status--on-warning--default)',
  healthy: 'var(--pf-t--global--text--color--status--on-success--default)',
  hot: 'var(--pf-t--global--text--color--status--on-danger--default)',
};

export const bandOrder: UtilizationBand[] = ['idle', 'low', 'moderate', 'healthy', 'hot'];

export function getCellStyle(band: UtilizationBand): CSSProperties {
  return {
    backgroundColor: bandColorTokens[band],
    color: bandTextColorTokens[band],
    width: 28,
    height: 28,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    border: '1px solid var(--pf-t--global--border--color--default)',
  };
}
