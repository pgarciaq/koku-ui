import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    marginBottom: 24,
  },
  iconDefault: {
    color: 'var(--pf-t--global--icon--color--regular)',
  },
  iconSuccess: {
    color: 'var(--pf-t--global--icon--color--status--success--default)',
  },
  subtitle: {
    color: 'var(--pf-t--global--text--color--subtle)',
    fontSize: 'var(--pf-t--global--font--size--body--sm)',
  },
};
