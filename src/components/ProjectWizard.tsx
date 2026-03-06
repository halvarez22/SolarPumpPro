import React, { useState } from 'react';
import { 
  User, 
  Droplets, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  CheckCircle2,
  MapPin,
  Waves,
  Sun,
  Zap,
  Calculator,
  Info,
  Package,
  DollarSign,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ProjectData, ProjectCalculations, Project } from '../types';
import { generateProjectPDF } from '../lib/pdfGenerator';

const steps = [
  { id: 'client', label: 'Cliente', icon: User },
  { id: 'well', label: 'Pozo', icon: Waves },
  { id: 'pumping', label: 'Impulsión', icon: Droplets },
  { id: 'irrigation', label: 'Riego', icon: Droplets },
  { id: 'solar', label: 'Solar', icon: Sun },
  { id: 'commercial', label: 'Comercial', icon: Zap },
  { id: 'results', label: 'Resultados', icon: Calculator },
];

const initialData: ProjectData = {
  client: { nombre: '', contacto: '', email: '', telefono: '', estado: '', municipio: '' },
  well: { profundidadTotal: 0, nivelEstatico: 0, nivelDinamico: 0, caudalDisponible: 0, diametroPozo: 0, tipoAgua: 'dulce' },
  pumping: { longitudTuberia: 0, diametroTuberia: '2', materialTuberia: 'HDPE', accesorios: [], desnivelTopografico: 0, distanciaHorizontal: 0, presionOperacion: 0 },
  irrigation: { superficie: 0, tipoCultivo: '', tipoRiego: 'gravedad', diasRiegoSemana: 7, horasOperacion: 6, requerimientoHidrico: 0 },
  solar: { irradiacionPromedio: 5.2, mesCritico: 'Diciembre', requiereTanque: false, requiereRespaldo: false },
  commercial: { margenGanancia: 25, costoInstalacion: 15, costoIngenieria: 15000, tiempoEntrega: 6, condicionesPago: '50% anticipo, 50% contra entrega', vigenciaCotizacion: 30, notas: '' }
};

export default function ProjectWizard({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectData>(initialData);
  const [calculations, setCalculations] = useState<ProjectCalculations | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleNext = async () => {
    if (currentStep === 5) {
      // Calculate before showing results
      setIsCalculating(true);
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const calcResults = await res.json();
      setCalculations(calcResults);
      setIsCalculating(false);
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    const project = {
      id: `PRJ-${Date.now()}`,
      clientId: 'user-1',
      status: 'draft',
      data: formData,
      calculations: calculations
    };

    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });

    onComplete();
  };

  const updateField = (section: keyof ProjectData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 lg:mb-10 px-2 lg:px-0">
        <div className="flex justify-between mb-4 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          {steps.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center gap-2 min-w-[60px] lg:min-w-0">
              <div className={cn(
                "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                i <= currentStep ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500"
              )}>
                {i < currentStep ? <CheckCircle2 size={16} className="lg:w-5 lg:h-5" /> : <step.icon size={16} className="lg:w-5 lg:h-5" />}
              </div>
              <span className={cn(
                "text-[8px] lg:text-[10px] font-bold uppercase tracking-wider text-center",
                i <= currentStep ? "text-blue-400" : "text-slate-500"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 lg:h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-slate-900 rounded-2xl lg:rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="p-5 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 lg:space-y-8"
            >
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Nombre de la Empresa / Cliente" value={formData.client.nombre} onChange={v => updateField('client', 'nombre', v)} placeholder="Ej. Agrícola El Rosario" />
                  <InputField label="Contacto Principal" value={formData.client.contacto} onChange={v => updateField('client', 'contacto', v)} placeholder="Ej. Ing. Juan Pérez" />
                  <InputField label="Email" value={formData.client.email} onChange={v => updateField('client', 'email', v)} placeholder="correo@ejemplo.com" type="email" />
                  <InputField label="Teléfono" value={formData.client.telefono} onChange={v => updateField('client', 'telefono', v)} placeholder="+52 ..." />
                  <InputField label="Estado" value={formData.client.estado} onChange={v => updateField('client', 'estado', v)} placeholder="Ej. Jalisco" />
                  <InputField label="Municipio" value={formData.client.municipio} onChange={v => updateField('client', 'municipio', v)} placeholder="Ej. Los Altos" />
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Profundidad Total (m)" value={formData.well.profundidadTotal} onChange={v => updateField('well', 'profundidadTotal', Number(v))} type="number" />
                  <InputField label="Nivel Estático (m)" value={formData.well.nivelEstatico} onChange={v => updateField('well', 'nivelEstatico', Number(v))} type="number" />
                  <InputField label="Nivel Dinámico (m)" value={formData.well.nivelDinamico} onChange={v => updateField('well', 'nivelDinamico', Number(v))} type="number" />
                  <InputField label="Caudal Disponible (L/s)" value={formData.well.caudalDisponible} onChange={v => updateField('well', 'caudalDisponible', Number(v))} type="number" />
                  <InputField label="Diámetro del Pozo (pulg)" value={formData.well.diametroPozo} onChange={v => updateField('well', 'diametroPozo', Number(v))} type="number" />
                  <SelectField label="Tipo de Agua" value={formData.well.tipoAgua} onChange={v => updateField('well', 'tipoAgua', v)} options={[{v:'dulce', l:'Dulce'}, {v:'salobre', l:'Salobre'}, {v:'salada', l:'Salada'}]} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Longitud de Tubería (m)" value={formData.pumping.longitudTuberia} onChange={v => updateField('pumping', 'longitudTuberia', Number(v))} type="number" />
                  <SelectField label="Diámetro de Tubería" value={formData.pumping.diametroTuberia} onChange={v => updateField('pumping', 'diametroTuberia', v)} options={[{v:'1', l:'1"'}, {v:'1.5', l:'1.5"'}, {v:'2', l:'2"'}, {v:'3', l:'3"'}, {v:'4', l:'4"'}]} />
                  <InputField label="Desnivel Topográfico (m)" value={formData.pumping.desnivelTopografico} onChange={v => updateField('pumping', 'desnivelTopografico', Number(v))} type="number" />
                  <InputField label="Presión de Operación (bar)" value={formData.pumping.presionOperacion} onChange={v => updateField('pumping', 'presionOperacion', Number(v))} type="number" />
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Superficie (ha)" value={formData.irrigation.superficie} onChange={v => updateField('irrigation', 'superficie', Number(v))} type="number" />
                  <InputField label="Tipo de Cultivo" value={formData.irrigation.tipoCultivo} onChange={v => updateField('irrigation', 'tipoCultivo', v)} />
                  <SelectField label="Tipo de Riego" value={formData.irrigation.tipoRiego} onChange={v => updateField('irrigation', 'tipoRiego', v)} options={[{v:'goteo', l:'Goteo'}, {v:'aspersión', l:'Aspersión'}, {v:'gravedad', l:'Gravedad'}, {v:'tanque', l:'Llenado de Tanque'}]} />
                  <InputField label="Horas de Operación (h/día)" value={formData.irrigation.horasOperacion} onChange={v => updateField('irrigation', 'horasOperacion', Number(v))} type="number" />
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Irradiación Promedio (HSP)" value={formData.solar.irradiacionPromedio} onChange={v => updateField('solar', 'irradiacionPromedio', Number(v))} type="number" />
                  <InputField label="Mes Crítico" value={formData.solar.mesCritico} onChange={v => updateField('solar', 'mesCritico', v)} />
                  <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                    <input type="checkbox" checked={formData.solar.requiereTanque} onChange={e => updateField('solar', 'requiereTanque', e.target.checked)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500" />
                    <label className="text-sm font-medium text-slate-300">¿Requiere Tanque de Almacenamiento?</label>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <InputField label="Margen de Ganancia (%)" value={formData.commercial.margenGanancia} onChange={v => updateField('commercial', 'margenGanancia', Number(v))} type="number" />
                  <InputField label="Costo de Instalación (%)" value={formData.commercial.costoInstalacion} onChange={v => updateField('commercial', 'costoInstalacion', Number(v))} type="number" />
                  <InputField label="Costo de Ingeniería (MXN)" value={formData.commercial.costoIngenieria} onChange={v => updateField('commercial', 'costoIngenieria', Number(v))} type="number" />
                  <InputField label="Vigencia de Cotización (días)" value={formData.commercial.vigenciaCotizacion} onChange={v => updateField('commercial', 'vigenciaCotizacion', Number(v))} type="number" />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-400 mb-2">Notas Adicionales</label>
                    <textarea 
                      value={formData.commercial.notas} 
                      onChange={e => updateField('commercial', 'notas', e.target.value)}
                      className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                    />
                  </div>
                </div>
              )}

              {currentStep === 6 && calculations && (
                <div className="space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6">
                    <ResultCard label="HMT" value={`${calculations.HMT} m`} icon={Waves} color="blue" />
                    <ResultCard label="Bomba" value={`${calculations.potenciaBomba} kW`} icon={Zap} color="amber" />
                    <ResultCard label="FV" value={`${calculations.potenciaFV} kWp`} icon={Sun} color="orange" />
                    <ResultCard label="Paneles" value={`${calculations.numPaneles}`} icon={Package} color="indigo" />
                    <ResultCard label="Agua" value={`${calculations.aguaDiaria} m³`} icon={Droplets} color="cyan" />
                    <ResultCard label="Inversión" value={`$${calculations.inversionTotal.toLocaleString()}`} icon={DollarSign} color="emerald" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-blue-500/10 p-4 lg:p-6 rounded-2xl border border-blue-500/20 flex items-start gap-3 lg:gap-4">
                      <Info className="text-blue-400 shrink-0" size={20} />
                      <div>
                        <h4 className="font-bold text-blue-100 text-sm lg:text-base">Análisis de Retorno</h4>
                        <p className="text-xs lg:text-sm text-blue-300/80 mt-1">
                          Este sistema tiene un retorno de inversión estimado de <strong>{calculations.roi} años</strong> y evitará la emisión de <strong>{calculations.co2Evitado} toneladas</strong> de CO₂ al año.
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const project: Project = {
                          id: 'PREVIEW',
                          clientId: 'preview',
                          status: 'draft',
                          data: formData,
                          calculations: calculations,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        };
                        generateProjectPDF(project);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold hover:bg-slate-700 transition-all shadow-lg"
                    >
                      <FileDown size={20} className="text-rose-400" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 lg:p-6 bg-slate-800/50 border-t border-slate-800 flex justify-between items-center">
          <button 
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="px-4 lg:px-6 py-2.5 text-slate-400 font-semibold hover:text-white transition-colors flex items-center gap-2 text-sm lg:text-base"
          >
            <ArrowLeft size={18} />
            <span>{currentStep === 0 ? 'Cancelar' : 'Anterior'}</span>
          </button>

          <div className="flex gap-2 lg:gap-4">
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext}
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 lg:px-8 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 text-sm lg:text-base"
              >
                {isCalculating ? 'Calculando...' : 'Siguiente'}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 lg:px-8 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm lg:text-base"
              >
                <Save size={18} />
                <span className="hidden sm:inline">Guardar Proyecto</span>
                <span className="sm:hidden">Guardar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-400 mb-2">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-400 mb-2">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      >
        {options.map((opt: any) => <option key={opt.v} value={opt.v} className="bg-slate-900">{opt.l}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 shadow-sm">
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
      <div className="text-sm text-slate-500 font-medium">{label}</div>
      <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}
