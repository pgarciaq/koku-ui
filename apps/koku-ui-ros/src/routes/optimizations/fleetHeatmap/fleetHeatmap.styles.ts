import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    marginBottom: 24,
  },
  groupSection: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 'var(--pf-t--global--font--size--body--sm)',
    fontWeight: 'var(--pf-t--global--font--weight--body--bold)' as any,
    color: 'var(--pf-t--global--text--color--subtle)',
    marginBottom: 4,
  },
  cellGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
  },
  legend: {
    display: 'flex',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    fontSize: 'var(--pf-t--global--font--size--body--sm)',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 2,
    border: '1px solid var(--pf-t--global--border--color--default)',
    display: 'inline-block',
  },
  toggleLink: {
    marginTop: 8,
    cursor: 'pointer',
    color: 'var(--pf-t--global--text--color--link--default)',
    fontSize: 'var(--pf-t--global--font--size--body--sm)',
    background: 'none',
    border: 'none',
    padding: 0,
  },
};
