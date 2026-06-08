import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  iconBgColor: string;
  iconColor: string;
  trend?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <div className="group rounded-3xl bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)] hover:-translate-y-1">
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBgColor} ${iconColor} transition-all group-hover:scale-110`}>
        <Icon className="text-2xl" />
      </div>
      <p className="mb-2 text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-5xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString()}
      </p>
      {trend !== undefined && (
        <p className={`mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
  );
}