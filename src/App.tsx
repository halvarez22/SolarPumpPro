import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Package, 
  Settings, 
  Droplets, 
  Sun, 
  TrendingUp, 
  Menu, 
  X,
  ChevronRight,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BookOpen,
  FileDown
} from 'lucide-react';
import { Edit3, Trash2, Save as SaveIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Project, Equipment } from './types';
import Dashboard from './components/Dashboard';
import ProjectWizard from './components/ProjectWizard';
import ProjectDetail from './components/ProjectDetail';
import EquipmentCatalog from './components/EquipmentCatalog';
import UserManual from './components/UserManual';
import { generateProjectPDF } from './lib/pdfGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'equipment' | 'help'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab, selectedProjectId, isCreatingProject]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: FileText },
    { id: 'equipment', label: 'Equipos', icon: Package },
    { id: 'help', label: 'Manual', icon: BookOpen },
  ];

  const handleCreateProject = () => {
    setIsCreatingProject(true);
    setSelectedProjectId(null);
    setEditingProject(null);
    setActiveTab('projects');
  };

  const handleViewProject = (id: string) => {
    setSelectedProjectId(id);
    setIsCreatingProject(false);
    setActiveTab('projects');
  };
  
  const handleEditProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`);
    const p = await res.json();
    setEditingProject(p);
    setIsCreatingProject(true);
    setSelectedProjectId(null);
    setActiveTab('projects');
  };

  const NavContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-xl object-contain bg-slate-800 border border-slate-700 shadow-lg"
        />
        {(isSidebarOpen || isMobileMenuOpen) && (
          <span className="font-bold text-xl tracking-tight text-white">SolarPump<span className="text-blue-400">Pro</span></span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              setSelectedProjectId(null);
              setIsCreatingProject(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id && !selectedProjectId && !isCreatingProject
                ? "bg-blue-500/10 text-blue-400 font-medium" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <item.icon size={22} className={cn(
              "transition-colors",
              activeTab === item.id && !selectedProjectId && !isCreatingProject ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {(isSidebarOpen || isMobileMenuOpen) && <span>{item.label}</span>}
            {activeTab === item.id && !selectedProjectId && !isCreatingProject && (isSidebarOpen || isMobileMenuOpen) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-[70] lg:hidden flex flex-col"
          >
            <NavContent />
            <div className="p-6 border-t border-slate-800">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-slate-800 rounded-xl text-slate-400 font-medium"
              >
                Cerrar Menú
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-col z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <NavContent />
        <div className="p-4 mt-auto">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-slate-800 rounded-lg text-slate-300"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-white truncate max-w-[150px] sm:max-w-none">
              {activeTab === 'dashboard' && "Panel"}
              {activeTab === 'projects' && (isCreatingProject ? "Nuevo" : selectedProjectId ? "Detalle" : "Proyectos")}
              {activeTab === 'equipment' && "Equipos"}
              {activeTab === 'help' && "Manual"}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 bg-slate-800 border-none rounded-full text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 w-48 transition-all"
              />
            </div>
            <button 
              onClick={handleCreateProject}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 lg:px-5 lg:py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedProjectId || '') + (isCreatingProject ? 'new' : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard onViewProject={handleViewProject} />
              )}
              {activeTab === 'projects' && isCreatingProject && (
                <ProjectWizard project={editingProject || undefined} onComplete={() => {
                  setIsCreatingProject(false);
                  setActiveTab('projects');
                }} onCancel={() => setIsCreatingProject(false)} />
              )}
              {activeTab === 'projects' && selectedProjectId && (
                <ProjectDetail id={selectedProjectId} onBack={() => setSelectedProjectId(null)} onEdit={() => handleEditProject(selectedProjectId)} />
              )}
              {activeTab === 'projects' && !selectedProjectId && !isCreatingProject && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                   <div className="p-4 lg:p-6 border-b border-slate-800 flex justify-between items-center">
                      <h2 className="font-semibold text-white">Lista de Proyectos</h2>
                   </div>
                   <ProjectList onView={handleViewProject} />
                </div>
              )}
              {activeTab === 'equipment' && (
                <EquipmentCatalog />
              )}
              {activeTab === 'help' && (
                <UserManual />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ProjectList({ onView }: { onView: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMunicipio, setEditMunicipio] = useState('');
  const [editEstado, setEditEstado] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');
  const [toast, setToast] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);
  
  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditNombre(p.data.client.nombre || '');
    setEditMunicipio(p.data.client.municipio || '');
    setEditEstado(p.data.client.estado || '');
    setEditStatus((p.status as any) || 'draft');
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  const saveEdit = async (p: Project) => {
    const updated = {
      status: editStatus,
      data: {
        ...p.data,
        client: {
          ...p.data.client,
          nombre: editNombre,
          municipio: editMunicipio,
          estado: editEstado
        }
      },
      calculations: p.calculations
    };
    await fetch(`/api/projects/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, ...updated } as Project : x));
    setEditingId(null);
  };
  
  const deleteProject = async (id: string) => {
    const p = projects.find(x => x.id === id);
    const name = p?.data?.client?.nombre || id;
    const ok = window.confirm(`¿Eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setProjects(prev => prev.filter(x => x.id !== id));
      showToast('Proyecto eliminado', 'success');
    } catch {
      showToast('Error al eliminar proyecto', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando proyectos...</div>;
  if (projects.length === 0) return (
    <div className="p-10 lg:p-20 text-center">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
        <FileText size={32} />
      </div>
      <h3 className="text-lg font-medium text-white">No hay proyectos aún</h3>
      <p className="text-slate-500 mt-1">Comienza creando tu primera cotización solar.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 px-4 py-2 rounded-xl shadow-lg border",
          toast.type === 'success' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border-rose-500/20"
        )}>
          {toast.text}
        </div>
      )}
      {/* Desktop Table View */}
      <table className="w-full text-left hidden md:table">
        <thead>
          <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Ubicación</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Inversión</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-200">
                  {editingId === project.id ? (
                    <input 
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 w-48"
                    />
                  ) : (
                    project.data.client.nombre
                  )}
                </div>
                <div className="text-xs text-slate-500">{project.data.client.contacto}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {editingId === project.id ? (
                  <div className="flex gap-2">
                    <input 
                      value={editMunicipio}
                      onChange={(e) => setEditMunicipio(e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 w-36"
                      placeholder="Municipio"
                    />
                    <input 
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 w-36"
                      placeholder="Estado"
                    />
                  </div>
                ) : (
                  <>
                    {project.data.client.municipio}, {project.data.client.estado}
                  </>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                  project.status === 'draft' && "bg-slate-800 text-slate-400 border border-slate-700",
                  project.status === 'sent' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                  project.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  project.status === 'rejected' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                )}>
                  {editingId === project.id ? (
                    <select 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="bg-transparent text-slate-200"
                    >
                      <option value="draft">Borrador</option>
                      <option value="sent">Enviado</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                  ) : (
                    <>
                      {project.status === 'draft' ? 'Borrador' : 
                       project.status === 'sent' ? 'Enviado' : 
                       project.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-200">
                ${project.calculations.inversionTotal.toLocaleString()} MXN
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      generateProjectPDF(project);
                    }}
                    className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Descargar PDF"
                  >
                    <FileDown size={18} />
                  </button>
                  {editingId === project.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(project)}
                        className="p-2 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 rounded-lg transition-colors"
                        title="Guardar"
                      >
                        <SaveIcon size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(project)}
                        className="p-2 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => onView(project.id)}
                    className="p-2 hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-800">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => onView(project.id)}
            className="p-4 active:bg-slate-800 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-slate-100">{project.data.client.nombre}</div>
                <div className="text-xs text-slate-500">{project.data.client.municipio}, {project.data.client.estado}</div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide",
                project.status === 'draft' && "bg-slate-800 text-slate-400 border border-slate-700",
                project.status === 'sent' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                project.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              )}>
                {project.status === 'draft' ? 'Borrador' : 
                 project.status === 'sent' ? 'Enviado' : 
                 project.status === 'approved' ? 'Aprobado' : 'Rechazado'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm font-bold text-blue-400">
                ${project.calculations.inversionTotal.toLocaleString()} MXN
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    generateProjectPDF(project);
                  }}
                  className="p-2 bg-slate-800 rounded-lg text-rose-400"
                >
                  <FileDown size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(project);
                  }}
                  className="p-2 bg-slate-800 rounded-lg text-amber-400"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="p-2 bg-slate-800 rounded-lg text-rose-400"
                >
                  <Trash2 size={18} />
                </button>
                <div className="text-[10px] text-slate-600">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
