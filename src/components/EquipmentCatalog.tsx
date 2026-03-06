import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Package, 
  Zap, 
  Sun, 
  Droplets,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Equipment } from '../types';
import { cn } from '../lib/utils';

export default function EquipmentCatalog() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        setEquipment(data);
        setLoading(false);
      });
  }, []);

  const filteredEquipment = equipment.filter(e => {
    const matchesFilter = filter === 'all' || e.category === filter;
    const matchesSearch = e.marca.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Todos', icon: Package },
    { id: 'bomba', label: 'Bombas', icon: Droplets },
    { id: 'inversor', label: 'Inversores', icon: Zap },
    { id: 'panel', label: 'Paneles', icon: Sun },
    { id: 'estructura', label: 'Estructuras', icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap",
                filter === cat.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              )}
            >
              <cat.icon size={14} className="lg:w-4 lg:h-4" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none w-full lg:w-64 transition-all"
            />
          </div>
          <button className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 shrink-0">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="p-20 text-center text-slate-500">Cargando catálogo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl hover:border-blue-500/50 transition-all group overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    item.category === 'bomba' && "bg-blue-500/10 text-blue-400",
                    item.category === 'inversor' && "bg-amber-500/10 text-amber-400",
                    item.category === 'panel' && "bg-orange-500/10 text-orange-400",
                    item.category === 'estructura' && "bg-slate-800 text-slate-400",
                  )}>
                    {item.category === 'bomba' && <Droplets size={20} />}
                    {item.category === 'inversor' && <Zap size={20} />}
                    {item.category === 'panel' && <Sun size={20} />}
                    {item.category === 'estructura' && <Package size={20} />}
                  </div>
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{item.marca}</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.modelo}</h3>
                </div>

                <div className="space-y-2 mb-6">
                  {Object.entries(item.especificaciones).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-500 capitalize">{key}</span>
                      <span className="text-slate-300 font-medium">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Precio Venta</div>
                    <div className="text-xl font-bold text-white">${item.precioVenta.toLocaleString()} <span className="text-xs font-normal text-slate-500">{item.moneda}</span></div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                    item.disponible ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {item.disponible ? <Check size={12} /> : <X size={12} />}
                    {item.disponible ? "DISPONIBLE" : "AGOTADO"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEquipment.length === 0 && (
        <div className="p-20 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 border border-slate-700">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-medium text-white">No se encontraron equipos</h3>
          <p className="text-slate-500 mt-1">Intenta con otros filtros o términos de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
