interface AdminMetricCardProps {
  icon: string;
  value: number | string;
  label: string;
  trend?: string;
}

import Icon from './Icon';

export default function AdminMetricCard({ icon, value, label, trend }: AdminMetricCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-admin-metric border border-outline-variant/20 flex flex-col relative overflow-hidden group hover:shadow-card-hover transition-all">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/20 rounded-full blur-2xl group-hover:bg-primary-container/30 transition-colors"></div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
          <Icon name={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <span className="bg-surface-container rounded-full px-2 py-1 font-label-sm text-primary flex items-center gap-1">
            <Icon name="trending_up" className="w-3.5 h-3.5" /> {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="font-headline-xl text-on-surface mb-1">{value}</h3>
        <p className="font-label-md text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
