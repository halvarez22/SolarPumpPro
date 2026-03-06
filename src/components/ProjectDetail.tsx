import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileDown, 
  FileSpreadsheet, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Droplets,
  Sun,
  Zap,
  Waves,
  DollarSign,
  Calendar,
  Package,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { Project, Equipment } from '../types';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { generateProjectPDF } from '../lib/pdfGenerator';

export default function ProjectDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      });
  }, [id]);

  const handleDownloadPDF = () => {
    if (!project) return;
    generateProjectPDF(project);
  };

  const exportExcel = () => {
    if (!project) return;
    const ws = XLSX.utils.json_to_sheet([
      { ...project.data.client, ...project.calculations }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cotización");
    XLSX.writeFile(wb, `Cotizacion_${project.id}.xlsx`);
  };

  if (loading || !project) return <div className="p-8 text-center text-slate-500">Cargando detalle...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors text-sm lg:text-base"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-all shadow-sm text-sm"
          >
            <FileDown size={18} className="text-rose-500" />
            <span>PDF</span>
          </button>
          <button 
            onClick={exportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-all shadow-sm text-sm"
          >
            <FileSpreadsheet size={18} className="text-emerald-500" />
            <span>Excel</span>
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 text-sm">
            <Send size={18} />
            <span>Enviar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Info & Calculations */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Client & Status Card */}
          <div className="bg-slate-900 rounded-2xl lg:rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 lg:p-8 border-b border-slate-800 flex justify-between items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-white truncate">{project.data.client.nombre}</h2>
                  <span className={cn(
                    "px-2 py-0.5 lg:px-3 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                    project.status === 'draft' && "bg-slate-800 text-slate-400 border border-slate-700",
                    project.status === 'sent' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                    project.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  )}>
                    {project.status === 'draft' ? 'Borrador' : project.status === 'sent' ? 'Enviado' : 'Aprobado'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-500 text-xs lg:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="lg:w-4 lg:h-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="lg:w-4 lg:h-4" />
                    <span>Vigencia: {project.data.commercial.vigenciaCotizacion} días</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors shrink-0">
                <Edit3 size={18} className="lg:w-5 lg:h-5" />
              </button>
            </div>

            <div className="p-5 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h4 className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Información de Contacto</h4>
                <div className="space-y-3">
                  <InfoItem label="Contacto" value={project.data.client.contacto} />
                  <InfoItem label="Email" value={project.data.client.email} />
                  <InfoItem label="Teléfono" value={project.data.client.telefono} />
                  <InfoItem label="Ubicación" value={`${project.data.client.municipio}, ${project.data.client.estado}`} />
                </div>
              </div>
              <div>
                <h4 className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Datos del Pozo</h4>
                <div className="space-y-3">
                  <InfoItem label="Profundidad" value={`${project.data.well.profundidadTotal} m`} />
                  <InfoItem label="Nivel Dinámico" value={`${project.data.well.nivelDinamico} m`} />
                  <InfoItem label="Caudal" value={`${project.data.well.caudalDisponible} L/s`} />
                  <InfoItem label="Tipo de Agua" value={project.data.well.tipoAgua} />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Results */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6">
            <ResultBox label="HMT" value={`${project.calculations.HMT} m`} icon={Waves} color="blue" />
            <ResultBox label="Bomba" value={`${project.calculations.potenciaBomba} kW`} icon={Zap} color="amber" />
            <ResultBox label="Solar" value={`${project.calculations.potenciaFV} kWp`} icon={Sun} color="orange" />
            <ResultBox label="Agua" value={`${project.calculations.aguaDiaria} m³`} icon={Droplets} color="cyan" />
            <ResultBox label="Paneles" value={project.calculations.numPaneles} icon={Package} color="indigo" />
            <ResultBox label="CO2" value={`${project.calculations.co2Evitado} ton`} icon={TrendingUp} color="emerald" />
          </div>

          {/* Commercial Notes */}
          <div className="bg-slate-900 p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4">Notas Comerciales</h4>
            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">
              {project.data.commercial.notas || "No hay notas adicionales para esta cotización."}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Condiciones de Pago</div>
                <div className="text-xs lg:text-sm text-slate-300 mt-1">{project.data.commercial.condicionesPago}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Tiempo de Entrega</div>
                <div className="text-xs lg:text-sm text-slate-300 mt-1">{project.data.commercial.tiempoEntrega} semanas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary */}
        <div className="space-y-6 lg:space-y-8">
          <div className="bg-slate-950 text-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-800 shadow-2xl shadow-black/50">
            <h3 className="text-base lg:text-lg font-bold mb-6">Resumen Económico</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span className="text-slate-200 font-medium">${(project.calculations.inversionTotal / 1.16).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>IVA (16%)</span>
                <span className="text-slate-200 font-medium">${(project.calculations.inversionTotal * 0.16 / 1.16).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Total Inversión</div>
                  <div className="text-2xl lg:text-3xl font-bold mt-1 text-white">${project.calculations.inversionTotal.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-slate-600 mb-1">MXN</div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm font-bold text-emerald-400">ROI: {project.calculations.roi} años</span>
              </div>
              <p className="text-[10px] lg:text-xs text-slate-500">
                Ahorro anual estimado de ${(project.calculations.inversionTotal / project.calculations.roi).toLocaleString(undefined, { maximumFractionDigits: 0 })} MXN.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4">Estado del Proyecto</h4>
            <div className="space-y-4">
              <StatusStep label="Cotización Creada" completed date={new Date(project.createdAt).toLocaleDateString()} />
              <StatusStep label="Enviada al Cliente" completed={project.status !== 'draft'} />
              <StatusStep label="Aprobada" completed={project.status === 'approved'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-300">{value}</span>
    </div>
  );
}

function ResultBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
        color === 'blue' && "bg-blue-500/10 text-blue-400",
        color === 'amber' && "bg-amber-500/10 text-amber-400",
        color === 'orange' && "bg-orange-500/10 text-orange-400",
        color === 'indigo' && "bg-indigo-500/10 text-indigo-400",
        color === 'cyan' && "bg-cyan-500/10 text-cyan-400",
        color === 'emerald' && "bg-emerald-500/10 text-emerald-400",
      )}>
        <Icon size={20} />
      </div>
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

function StatusStep({ label, completed, date }: { label: string, completed: boolean, date?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        completed ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"
      )}>
        <CheckCircle2 size={14} />
      </div>
      <div className="flex-1">
        <div className={cn("text-sm font-medium", completed ? "text-slate-200" : "text-slate-500")}>{label}</div>
        {date && <div className="text-[10px] text-slate-600">{date}</div>}
      </div>
    </div>
  );
}
