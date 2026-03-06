import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Droplets,
  Sun,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Project } from '../types';
import { cn } from '../lib/utils';

const data = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

export default function Dashboard({ onViewProject }: { onViewProject: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    activeProjects: 0,
    conversionRate: 0,
    totalWater: 0
  });

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        const totalValue = data.reduce((acc: number, p: Project) => acc + p.calculations.inversionTotal, 0);
        const approved = data.filter((p: Project) => p.status === 'approved').length;
        const totalWater = data.reduce((acc: number, p: Project) => acc + p.calculations.aguaDiaria, 0);
        
        setStats({
          totalValue,
          activeProjects: data.length,
          conversionRate: data.length > 0 ? Math.round((approved / data.length) * 100) : 0,
          totalWater
        });
      });
  }, []);

  const kpis = [
    { label: 'Valor Total', value: `$${(stats.totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'blue', trend: '+12%' },
    { label: 'Proyectos', value: stats.activeProjects, icon: Users, color: 'indigo', trend: '+4' },
    { label: 'Conversión', value: `${stats.conversionRate}%`, icon: FileCheck, color: 'emerald', trend: '+2%' },
    { label: 'Agua Diaria', value: `${Math.round(stats.totalWater)} m³`, icon: Droplets, color: 'cyan', trend: '+15%' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:shadow-blue-500/5 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                kpi.color === 'blue' && "bg-blue-500/10 text-blue-400",
                kpi.color === 'indigo' && "bg-indigo-500/10 text-indigo-400",
                kpi.color === 'emerald' && "bg-emerald-500/10 text-emerald-400",
                kpi.color === 'cyan' && "bg-cyan-500/10 text-cyan-400",
              )}>
                <kpi.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {kpi.trend}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-sm text-slate-400 font-medium mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Crecimiento de Cotizaciones</h3>
              <p className="text-sm text-slate-400">Valor de proyectos generados por mes</p>
            </div>
            <select className="bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Proyectos Recientes</h3>
          <div className="space-y-6">
            {projects.slice(0, 5).map((project) => (
              <div 
                key={project.id} 
                className="flex items-center gap-4 group cursor-pointer"
                onClick={() => onViewProject(project.id)}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                  <Droplets size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 truncate">{project.data.client.nombre}</div>
                  <div className="text-xs text-slate-500">{project.data.client.municipio}, {project.data.client.estado}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-200">${(project.calculations.inversionTotal / 1000).toFixed(0)}k</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase">{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-10 text-slate-500 italic text-sm">No hay proyectos recientes</div>
            )}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors">
            Ver todos los proyectos
          </button>
        </div>
      </div>
    </div>
  );
}
