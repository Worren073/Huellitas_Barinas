'use client';

import Icon from './Icon';

interface Column {
  key: string;
  label: string;
  render?: (_item: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (_page: number) => void;
}

export default function AdminTable({
  columns,
  data,
  title,
  page = 1,
  totalPages = 1,
  onPageChange,
}: AdminTableProps) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-admin-metric border border-outline-variant/20 flex flex-col overflow-hidden">
      <div className="p-stack-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-off-white/50">
        <h3 className="font-headline-sm text-on-surface">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-body-sm text-on-surface-variant border border-outline-variant/30 rounded-md flex items-center gap-1">
            <Icon name="filter_list" className="w-4 h-4" /> Filter
          </button>
          <button className="px-3 py-1.5 text-body-sm text-on-surface-variant border border-outline-variant/30 rounded-md flex items-center gap-1">
            <Icon name="download" className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-gray/30 border-b border-outline-variant/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-stack-sm pl-stack-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/10">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low/50 group">
                {columns.map((col) => (
                  <td key={col.key} className="p-stack-sm pl-stack-md">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-stack-sm px-stack-md border-t border-outline-variant/20 flex justify-between items-center bg-surface-off-white/30 text-on-surface-variant">
        <span className="font-label-sm">Pagina {page} de {totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
          >
            <Icon name="chevron_left" className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
          >
            <Icon name="chevron_right" className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
