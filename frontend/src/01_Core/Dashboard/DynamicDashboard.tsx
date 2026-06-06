'use client';

import React from 'react';
import { 
  Users, GraduationCap, CalendarCheck, CreditCard, Briefcase, ShieldAlert,
  ArrowUpRight, AlertCircle, Sparkles, Activity, FileText, Calendar, BookOpen, Clock, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const ICON_MAP: Record<string, any> = {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Briefcase,
  ShieldAlert,
  Activity,
  FileText,
  Calendar,
  BookOpen,
  Clock,
  ShieldCheck
};

const COLOR_MAP: Record<string, string> = {
  sky: 'from-sky-400 to-sky-600 border-sky-200/50 bg-sky-50 text-sky-600',
  indigo: 'from-indigo-400 to-indigo-600 border-indigo-200/50 bg-indigo-50 text-indigo-600',
  emerald: 'from-emerald-400 to-emerald-600 border-emerald-200/50 bg-emerald-50 text-emerald-600',
  rose: 'from-rose-400 to-rose-600 border-rose-200/50 bg-rose-50 text-rose-600',
  amber: 'from-amber-400 to-amber-600 border-amber-200/50 bg-amber-50 text-amber-600',
  orange: 'from-orange-400 to-orange-600 border-orange-200/50 bg-orange-50 text-orange-600',
};

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'list' | 'actions';
  title: string;
  value?: string;
  valuePath?: string;
  icon?: string;
  color?: string;
  isPercentage?: boolean;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  dataPath?: string;
  dataKeys?: string[];
  data?: any[];
  listType?: string;
  actions?: { label: string; actionCode: string }[];
}

interface Section {
  title: string;
  gridCols?: number;
  widgets: Widget[];
}

interface DynamicDashboardProps {
  layout: { sections: Section[] };
  metricsData: any;
  triggerToast: (msg: string) => void;
  setActiveCategory: (cat: string) => void;
}

export default function DynamicDashboard({
  layout,
  metricsData,
  triggerToast,
  setActiveCategory
}: DynamicDashboardProps) {

  function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  const renderIcon = (iconName?: string) => {
    const IconComponent = iconName ? ICON_MAP[iconName] : Activity;
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Activity className="h-5 w-5" />;
  };

  const renderKpi = (widget: Widget) => {
    let displayValue = widget.value || '—';
    if (widget.valuePath) {
      const resolved = getNestedValue(metricsData, widget.valuePath);
      if (resolved !== undefined && resolved !== null) {
        displayValue = String(resolved) + (widget.isPercentage ? '%' : '');
      }
    }

    const colorClass = COLOR_MAP[widget.color || 'indigo'] || COLOR_MAP.indigo;

    return (
      <div key={widget.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{widget.title}</p>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">{displayValue}</h3>
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-sm ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
          {renderIcon(widget.icon)}
        </div>
      </div>
    );
  };

  const renderChart = (widget: Widget) => {
    let chartData = widget.data || [];
    if (widget.dataPath) {
      const resolved = getNestedValue(metricsData, widget.dataPath);
      if (Array.isArray(resolved)) {
        chartData = resolved;
      } else if (resolved && typeof resolved === 'object') {
        // If data is feeOverview etc., wrap it into an array
        chartData = [resolved];
      }
    }

    const mainColor = widget.color || '#4f46e5';

    return (
      <div key={widget.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-80 hover:shadow-md transition">
        <div className="flex justify-between items-center mb-4 border-b border-gray-55 pb-2">
          <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">{widget.title}</h4>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {widget.chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                {(widget.dataKeys || ['count']).map((key, i) => (
                  <Bar key={key} dataKey={key} fill={mainColor} radius={[4, 4, 0, 0]} name={key} />
                ))}
              </BarChart>
            ) : widget.chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index === 1 ? '#06b6d4' : index === 2 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {(widget.dataKeys || ['collected']).map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={i === 0 ? '#4f46e5' : '#10b981'} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name={key} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderList = (widget: Widget) => {
    let items = widget.data || [];
    if (widget.dataPath) {
      const resolved = getNestedValue(metricsData, widget.dataPath);
      if (Array.isArray(resolved)) {
        items = resolved;
      }
    }

    return (
      <div key={widget.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-80 hover:shadow-md transition">
        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
          <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">{widget.title}</h4>
          <span className="text-[10px] text-gray-400 font-semibold">{items.length} items</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {items.map((item: any, idx: number) => (
            <div key={item.id || idx} className="rounded-xl border border-gray-50 bg-gray-50/30 p-3 hover:bg-gray-50/70 transition">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="text-xs font-extrabold text-gray-800 leading-tight">{item.label || item.title || item.name}</span>
                <span className="shrink-0 rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">Info</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc || item.content || item.reason || ''}</p>
              {item.attendanceRate !== undefined && (
                <div className="mt-2 flex gap-4 text-[10px] font-bold text-gray-400 border-t border-gray-100/60 pt-1">
                  <span>Attendance: <span className="text-red-500">{item.attendanceRate}%</span></span>
                  <span>Exam Avg: <span className="text-red-500">{item.examAverage}%</span></span>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-400">No items available in list queue.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 select-none">
      {/* Dynamic Sections Grid */}
      {layout.sections.map((section, sIdx) => {
        const gridClass = section.gridCols === 4 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          : section.gridCols === 3
          ? 'grid grid-cols-1 md:grid-cols-3 gap-6'
          : section.gridCols === 2
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          : 'grid grid-cols-1 gap-6';

        return (
          <div key={sIdx} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">{section.title}</h2>
            </div>
            <div className={gridClass}>
              {section.widgets.map((widget) => {
                if (widget.type === 'kpi') return renderKpi(widget);
                if (widget.type === 'chart') return renderChart(widget);
                if (widget.type === 'list') return renderList(widget);
                return null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
