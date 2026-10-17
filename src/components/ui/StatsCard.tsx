import React from "react";

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: { value: number; isPositive: boolean } 
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className="w-10 h-10 rounded-lg bg-primary-900/50 flex items-center justify-center text-primary-400">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%</span>
            <span className="text-gray-500 text-xs">مقارنة بالشهر الماضي</span>
          </p>
        )}
      </div>
    </div>
  );
}
