import React from 'react';

export interface AccessibilityTableColumn {
  key: string;
  label: string;
}

export interface AccessibilityTableProps {
  caption: string;
  columns: AccessibilityTableColumn[];
  rows: Record<string, string | number>[];
}

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

export const AccessibilityTable: React.FC<AccessibilityTableProps> = ({ caption, columns, rows }) => {
  return (
    <table style={srOnlyStyle} role="table" aria-label={caption}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {columns.map(col => (
              <td key={col.key}>{row[col.key] ?? ''}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
